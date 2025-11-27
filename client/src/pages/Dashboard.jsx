import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiPackage, FiBriefcase, FiShoppingBag, FiUser, FiSettings, FiArrowRight } from 'react-icons/fi';

function Dashboard() {
  const navigate = useNavigate();
  const { user, setAuth, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    province: '',
    postalCode: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
    setProfileForm({
      name: user.name || '',
      phone: user.phone || '',
      street: user.address?.street || '',
      city: user.address?.city || '',
      province: user.address?.province || '',
      postalCode: user.address?.postalCode || ''
    });
  }, [user]);

  const fetchData = async () => {
    try {
      const [ordersRes, serviceOrdersRes] = await Promise.all([
        api.get('/users/orders'),
        api.get('/orders/my-service-orders').catch(() => ({ data: [] }))
      ]);
      setOrders(ordersRes.data);
      setServiceOrders(serviceOrdersRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/users/profile', {
        name: profileForm.name,
        phone: profileForm.phone,
        address: {
          street: profileForm.street,
          city: profileForm.city,
          province: profileForm.province,
          postalCode: profileForm.postalCode
        }
      });
      setAuth(data, token);
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      accepted: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
          {user?.role === 'admin' && (
            <Link to="/admin" className="btn-primary">
              Admin Dashboard
            </Link>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <FiShoppingBag className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-sm text-gray-600">Product Orders</p>
          </div>
          <div className="card text-center">
            <FiBriefcase className="w-8 h-8 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{serviceOrders.length}</p>
            <p className="text-sm text-gray-600">Service Bookings</p>
          </div>
          <div className="card text-center">
            <FiPackage className="w-8 h-8 mx-auto mb-2 text-emerald" />
            <p className="text-2xl font-bold">
              {orders.filter(o => o.status === 'delivered').length + serviceOrders.filter(o => o.status === 'completed').length}
            </p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          {(user?.isSeller || user?.role === 'seller') ? (
            <Link to="/seller/dashboard" className="card text-center hover:shadow-lg transition cursor-pointer bg-gradient-to-br from-primary to-primary-light text-white">
              <FiArrowRight className="w-8 h-8 mx-auto mb-2" />
              <p className="font-semibold">Seller Dashboard</p>
              <p className="text-sm opacity-80">Manage listings</p>
            </Link>
          ) : (
            <Link to="/become-seller" className="card text-center hover:shadow-lg transition cursor-pointer bg-gradient-to-br from-accent to-accent-light text-white">
              <FiArrowRight className="w-8 h-8 mx-auto mb-2" />
              <p className="font-semibold">Become a Seller</p>
              <p className="text-sm opacity-80">Start selling today</p>
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b">
          {['orders', 'services', 'profile'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition border-b-2 -mb-px capitalize ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'orders' ? 'Product Orders' : tab === 'services' ? 'Service Bookings' : 'Profile'}
            </button>
          ))}
        </div>

        {/* Product Orders */}
        {activeTab === 'orders' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-6">My Product Orders</h2>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <FiShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">No orders yet</p>
                <Link to="/products" className="btn-primary">
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-2 mb-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center text-sm">
                          <img
                            src={item.product?.images?.[0] || 'https://via.placeholder.com/50'}
                            alt=""
                            className="w-12 h-12 object-cover rounded mr-3"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.product?.title || 'Product'}</p>
                            <p className="text-gray-500">Qty: {item.quantity} × Rs. {item.price.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="text-gray-600">Total</span>
                      <span className="text-xl font-bold text-primary">Rs. {order.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Service Bookings */}
        {activeTab === 'services' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-6">My Service Bookings</h2>
            {serviceOrders.length === 0 ? (
              <div className="text-center py-12">
                <FiBriefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">No service bookings yet</p>
                <Link to="/services" className="btn-accent">
                  Browse Services
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {serviceOrders.map((order) => (
                  <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">Booking #{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="font-medium">{order.service?.title}</p>
                      <p className="text-sm text-gray-600">Provider: {order.provider?.name}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <p className="text-sm text-gray-600">Requirements:</p>
                      <p className="text-sm">{order.requirements}</p>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="text-gray-600">Price</span>
                      <span className="text-xl font-bold text-accent">Rs. {order.price.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile */}
        {activeTab === 'profile' && (
          <div className="card max-w-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <FiSettings className="mr-2" /> Profile Settings
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Street Address</label>
                <input
                  type="text"
                  value={profileForm.street}
                  onChange={(e) => setProfileForm({ ...profileForm, street: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Province</label>
                  <input
                    type="text"
                    value={profileForm.province}
                    onChange={(e) => setProfileForm({ ...profileForm, province: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Postal Code</label>
                <input
                  type="text"
                  value={profileForm.postalCode}
                  onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
