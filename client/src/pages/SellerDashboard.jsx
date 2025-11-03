import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';

function SellerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.isSeller) {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/users/seller/dashboard');
      setProducts(data.products);
      setServices(data.services);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Seller Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-primary">{products.length}</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Total Services</h3>
          <p className="text-3xl font-bold text-secondary">{services.length}</p>
        </div>
      </div>

      <div className="card mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Products</h2>
          <button className="btn-primary">Add Product</button>
        </div>
        
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No products yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product._id} className="border rounded-lg p-4">
                <img
                  src={product.images[0] || 'https://via.placeholder.com/200'}
                  alt={product.title}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <h3 className="font-semibold">{product.title}</h3>
                <p className="text-primary font-bold">Rs. {product.price.toLocaleString()}</p>
                <span className={`text-sm px-2 py-1 rounded ${
                  product.status === 'approved' ? 'bg-green-100 text-green-800' :
                  product.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {product.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Services</h2>
          <button className="btn-secondary">Add Service</button>
        </div>
        
        {services.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No services yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {services.map((service) => (
              <div key={service._id} className="border rounded-lg p-4">
                <img
                  src={service.images[0] || 'https://via.placeholder.com/200'}
                  alt={service.title}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <h3 className="font-semibold">{service.title}</h3>
                <p className="text-secondary font-bold">Rs. {service.price.toLocaleString()}</p>
                <span className={`text-sm px-2 py-1 rounded ${
                  service.status === 'approved' ? 'bg-green-100 text-green-800' :
                  service.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {service.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerDashboard;
