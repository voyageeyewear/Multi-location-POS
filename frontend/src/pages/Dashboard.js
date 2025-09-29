import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  FiShoppingCart, 
  FiPackage, 
  FiMapPin, 
  FiUsers, 
  FiTrendingUp,
  FiDollarSign,
  FiBarChart3,
  FiSettings
} from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();

  const getDashboardCards = () => {
    const baseCards = [
      {
        title: 'Point of Sale',
        description: 'Process sales transactions',
        icon: FiShoppingCart,
        link: '/pos',
        color: 'bg-blue-500',
        available: user?.role?.name === 'cashier' || user?.role?.name === 'manager' || user?.role?.name === 'admin'
      }
    ];

    if (user?.role?.name === 'admin' || user?.role?.name === 'super_admin') {
      baseCards.push(
        {
          title: 'Products',
          description: 'Manage inventory and products',
          icon: FiPackage,
          link: '/admin/products',
          color: 'bg-green-500'
        },
        {
          title: 'Sales',
          description: 'View sales history and reports',
          icon: FiTrendingUp,
          link: '/admin/sales',
          color: 'bg-purple-500'
        },
        {
          title: 'Users',
          description: 'Manage users and permissions',
          icon: FiUsers,
          link: '/admin/users',
          color: 'bg-orange-500'
        },
        {
          title: 'Locations',
          description: 'Manage store locations',
          icon: FiMapPin,
          link: '/admin/locations',
          color: 'bg-indigo-500'
        },
        {
          title: 'Reports',
          description: 'Generate and view reports',
          icon: FiBarChart3,
          link: '/admin/reports',
          color: 'bg-pink-500'
        }
      );

      if (user?.role?.name === 'super_admin') {
        baseCards.push(
          {
            title: 'Companies',
            description: 'Manage companies',
            icon: FiDollarSign,
            link: '/admin/companies',
            color: 'bg-red-500'
          },
          {
            title: 'Roles',
            description: 'Manage user roles',
            icon: FiSettings,
            link: '/admin/roles',
            color: 'bg-gray-500'
          }
        );
      }
    }

    return baseCards.filter(card => card.available !== false);
  };

  const dashboardCards = getDashboardCards();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="mt-2 text-gray-600">
            {user?.role?.name === 'super_admin' && 'Super Administrator Dashboard'}
            {user?.role?.name === 'admin' && 'Company Administrator Dashboard'}
            {user?.role?.name === 'manager' && 'Manager Dashboard'}
            {user?.role?.name === 'cashier' && 'Cashier Dashboard'}
          </p>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-lg font-semibold text-blue-600">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-gray-600">{user?.email}</p>
              <p className="text-sm text-blue-600 font-medium capitalize">
                {user?.role?.name?.replace('_', ' ')}
              </p>
            </div>
          </div>
          
          {user?.company && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Company:</span> {user.company.name}
              </p>
            </div>
          )}

          {user?.userLocations && user.userLocations.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Assigned Locations:</span>{' '}
                {user.userLocations.map(ul => ul.location.name).join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dashboardCards.map((card, index) => (
              <Link
                key={index}
                to={card.link}
                className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`h-12 w-12 rounded-lg ${card.color} flex items-center justify-center`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {card.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity (placeholder) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-center py-8">
            <p className="text-gray-500">No recent activity to display</p>
            <p className="text-sm text-gray-400 mt-2">
              Activity will appear here as you use the system
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
