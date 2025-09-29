import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:8000', {
        auth: {
          token: localStorage.getItem('accessToken')
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setConnected(true);
        
        // Join company room for real-time updates
        if (user.company?.id) {
          newSocket.emit('join-company', user.company.id);
        }
        
        // Join user's assigned locations
        if (user.userLocations) {
          user.userLocations.forEach(userLocation => {
            newSocket.emit('join-location', userLocation.locationId);
          });
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
        toast.error('Connection lost. Attempting to reconnect...');
      });

      // Listen for real-time updates
      newSocket.on('sale_created', (data) => {
        toast.success(`New sale: ${data.orderNumber}`);
      });

      newSocket.on('sale_updated', (data) => {
        toast.info(`Sale updated: ${data.orderNumber}`);
      });

      newSocket.on('product_updated', (data) => {
        toast.info(`Product updated: ${data.product.name}`);
      });

      newSocket.on('inventory_updated', (data) => {
        toast.info(`Inventory updated for ${data.product.name}`);
      });

      newSocket.on('user_updated', (data) => {
        if (data.userId === user.id) {
          toast.info('Your profile has been updated');
        }
      });

      newSocket.on('location_updated', (data) => {
        toast.info(`Location updated: ${data.location.name}`);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      // Disconnect socket if user is not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  const emitEvent = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  const subscribeToEvent = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const unsubscribeFromEvent = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const value = {
    socket,
    connected,
    emitEvent,
    subscribeToEvent,
    unsubscribeFromEvent
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
