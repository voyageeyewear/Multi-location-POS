import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiCreditCard, FiCash } from 'react-icons/fi';

const POSInterface = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(user?.userLocations?.[0]?.locationId || '');

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    // Implement checkout logic
    console.log('Checkout:', cart);
    setCart([]);
  };

  // Mock products
  const products = [
    { id: 1, name: 'Premium Headphones', price: 299.99, sku: 'PWH-001' },
    { id: 2, name: 'Smart Watch', price: 399.99, sku: 'SWS-005' },
    { id: 3, name: 'Bluetooth Speaker', price: 129.99, sku: 'BTS-003' },
    { id: 4, name: 'USB-C Cable', price: 24.99, sku: 'UCC-6FT' },
    { id: 5, name: 'Phone Case', price: 19.99, sku: 'PC-CLR-UNI' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
            <p className="text-gray-600">
              {user?.userLocations?.find(ul => ul.locationId === selectedLocation)?.location?.name || 'Select Location'}
            </p>
          </div>
          
          {user?.userLocations && user.userLocations.length > 1 && (
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {user.userLocations.map(ul => (
                <option key={ul.locationId} value={ul.locationId}>
                  {ul.location.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Products</h2>
              
              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {products.map(product => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => addToCart(product)}
                  >
                    <div className="text-center">
                      <div className="h-20 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        <FiShoppingCart className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{product.sku}</p>
                      <p className="text-lg font-semibold text-blue-600">${product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cart</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <FiShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Cart is empty</p>
                  <p className="text-sm text-gray-400">Add products to get started</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">${item.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded-full hover:bg-gray-200"
                          >
                            <FiMinus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded-full hover:bg-gray-200"
                          >
                            <FiPlus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 rounded-full hover:bg-red-100 text-red-600"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span>${getTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div className="space-y-3">
                    <button
                      onClick={handleCheckout}
                      className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FiCash className="mr-2 h-4 w-4" />
                      Cash Payment
                    </button>
                    <button
                      onClick={handleCheckout}
                      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FiCreditCard className="mr-2 h-4 w-4" />
                      Card Payment
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSInterface;
