import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiUsers, FiPackage, FiBriefcase } from 'react-icons/fi';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('products');
  const [pendingProducts, setPendingProducts] = useState([]);
  const [pendingServices, setPendingServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [productsRes, servicesRes, usersRes] = await Promise.all([
        api.get('/admin/products/pending'),
        api.get('/admin/services/pending'),
        api.get('/admin/users')
      ]);
      setPendingProducts(productsRes.data);
      setPendingServices(servicesRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleProductStatus = async (id, status) => {
    try {
      await api.patch(`/admin/products/${id}/status`, { status });
      setPendingProducts(prev => prev.filter(p => p._id !== id));
      toast.success(`Product ${status}`);
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const handleServiceStatus = async (id, status) => {
    try {
      await api.patch(`/admin/services/${id}/status`, { status });
      setPendingServices(prev => prev.filter(s => s._id !== id));
      toast.success(`Service ${status}`);
    } catch (error) {
      toast.error('Failed to update service');
    }
  };

  const handleUserRole = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u));
      toast.success('User role updated');
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <FiPackage className="w-8 h-8 text-primary mb-2" />
          <h3 className="text-lg font-semibold">Pending Products</h3>
          <p className="text-3xl font-bold text-primary">{pendingProducts.length}</p>
        </div>
        <div className="card">
          <FiBriefcase className="w-8 h-8 text-accent mb-2" />
          <h3 className="text-lg font-semibold">Pending Services</h3>
          <p className="text-3xl font-bold text-accent">{pendingServices.length}</p>
        </div>
        <div className="card">
          <FiUsers className="w-8 h-8 text-emerald mb-2" />
          <h3 className="text-lg font-semibold">Total Users</h3>
          <p className="text-3xl font-bold text-emerald-dark">{users.length}</p>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-2 rounded-full font-semibold transition ${
            activeTab === 'products' ? 'bg-primary text-white' : 'bg-gray-200'
          }`}
        >
          Products ({pendingProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-6 py-2 rounded-full font-semibold transition ${
            activeTab === 'services' ? 'bg-accent text-white' : 'bg-gray-200'
          }`}
        >
          Services ({pendingServices.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2 rounded-full font-semibold transition ${
            activeTab === 'users' ? 'bg-emerald text-white' : 'bg-gray-200'
          }`}
        >
          Users
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Pending Products</h2>
          {pendingProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending products</p>
          ) : (
            <div className="space-y-4">
              {pendingProducts.map(product => (
                <div key={product._id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={product.images[0] || 'https://via.placeholder.com/80'}
                      alt={product.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-semibold">{product.title}</h3>
                      <p className="text-sm text-gray-600">Rs. {product.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">By: {product.seller?.name}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleProductStatus(product._id, 'approved')}
                      className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                    >
                      <FiCheck size={20} />
                    </button>
                    <button
                      onClick={() => handleProductStatus(product._id, 'rejected')}
                      className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'services' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Pending Services</h2>
          {pendingServices.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending services</p>
          ) : (
            <div className="space-y-4">
              {pendingServices.map(service => (
                <div key={service._id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={service.images[0] || 'https://via.placeholder.com/80'}
                      alt={service.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-semibold">{service.title}</h3>
                      <p className="text-sm text-gray-600">Rs. {service.price.toLocaleString()}/{service.priceType}</p>
                      <p className="text-xs text-gray-500">By: {service.provider?.name}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleServiceStatus(service._id, 'approved')}
                      className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                    >
                      <FiCheck size={20} />
                    </button>
                    <button
                      onClick={() => handleServiceStatus(service._id, 'rejected')}
                      className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">All Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{u.name}</td>
                    <td className="py-3 px-4">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'seller' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleUserRole(u._id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                        disabled={u._id === user.id}
                      >
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
