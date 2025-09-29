import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.tokens.accessToken,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app load
  useEffect(() => {
    const token = Cookies.get('accessToken');
    const refreshToken = Cookies.get('refreshToken');
    
    if (token) {
      // Set token in API headers
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get user profile
      getProfile();
    } else if (refreshToken) {
      // Try to refresh token
      refreshAccessToken();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const getProfile = async () => {
    try {
      const response = await authAPI.get('/profile');
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data.data.user,
          tokens: {
            accessToken: Cookies.get('accessToken')
          }
        }
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      // Try to refresh token
      const refreshToken = Cookies.get('refreshToken');
      if (refreshToken) {
        await refreshAccessToken();
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Session expired' });
      }
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = Cookies.get('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await authAPI.post('/refresh-token', {
        refreshToken
      });

      const { accessToken } = response.data.data;
      
      // Update cookies
      Cookies.set('accessToken', accessToken, { expires: 1 }); // 1 day
      
      // Update API headers
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // Get user profile
      await getProfile();
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
    }
  };

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authAPI.post('/login', credentials);
      const { user, tokens } = response.data.data;
      
      // Store tokens in cookies
      Cookies.set('accessToken', tokens.accessToken, { expires: 1 }); // 1 day
      Cookies.set('refreshToken', tokens.refreshToken, { expires: 7 }); // 7 days
      
      // Set token in API headers
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, tokens }
      });
      
      toast.success(`Welcome back, ${user.firstName}!`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authAPI.post('/register', userData);
      const { user, tokens } = response.data.data;
      
      // Store tokens in cookies
      Cookies.set('accessToken', tokens.accessToken, { expires: 1 });
      Cookies.set('refreshToken', tokens.refreshToken, { expires: 7 });
      
      // Set token in API headers
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, tokens }
      });
      
      toast.success(`Welcome to POS System, ${user.firstName}!`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Call logout API
      await authAPI.post('/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear cookies
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      
      // Clear API headers
      delete authAPI.defaults.headers.common['Authorization'];
      
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const hasPermission = (permission) => {
    if (!state.user?.role?.permissions) return false;
    return state.user.role.permissions[permission] === true;
  };

  const hasRole = (roles) => {
    if (!state.user?.role?.name) return false;
    return roles.includes(state.user.role.name);
  };

  const hasLocationAccess = (locationId) => {
    if (!state.user?.userLocations) return false;
    return state.user.userLocations.some(ul => ul.locationId === locationId);
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    hasPermission,
    hasRole,
    hasLocationAccess,
    getProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
