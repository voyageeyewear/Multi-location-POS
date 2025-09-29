import React from 'react';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';

const Users = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          <FiPlus className="mr-2 h-4 w-4" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">User management interface coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Users;
