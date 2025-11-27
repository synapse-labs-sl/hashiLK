import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiPackage, FiBriefcase, FiShoppingBag, FiEdit, FiTrash2 } from 'react-icons/fi';

const PRODUCT_CATEGORIES = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Vehicles', 'Other'];
const SERVICE_CATEGORIES = ['Web Development', 'Graphic Design', 'Writing', 'Marketing', 'Photography', 'Tutoring', 'Consulting', 'Other'];
const PROVINCES = ['Western', 'Central', 'Southern', 'Northern', 'Eastern', 'North Western', 'North Central', 'Uva', 'Sabaragamuwa'];

function SellerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [productOrders, setProductOrders] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [productForm, setProductForm] = useState({
    title: '', description: '', price: '', category: '', stock: '', condition: 'new',
    images: [], city: '', province: ''
  });

  const [serviceForm, setServiceForm] = useState({
    title: '', description: '', price: '', priceType: 'fixed', category: '',
    deliveryTime: '', images: [], city: '', province: ''
  });

  useEffect(() => {
    if (!user || (!user.isSeller && user.role !== 'seller')) {
      navigate('/become-seller');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [dashboardRes, productOrdersRes, serviceOrdersRes] = await Promise.all([
        api.get('/users/seller/dashboard'),
        api.get('/orders/seller-orders').catch(() => ({ data: [] })),
        api.get('/orders/provider-orders').catch(() => ({ data: [] }))
      ]);
      setProducts(dashboardRes.data.products);
      setServices(dashboardRes.data.services);
      setProductOrders(productOrdersRes.data);
      setServiceOrders(serviceOrdersRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    try {
      const { data } = await api.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (type === 'product') {
        setProductForm(prev => ({ ...prev, images: [...prev.images, ...data.urls] }));
      } else {
        setServiceForm(prev => ({ ...prev, images: [...prev.images, ...data.urls] }));
      }
      toast.success('Images uploaded');
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        location: { city: productForm.city, province: productForm.province }
      };
      await api.post('/products', payload);
      toast.success('Product created! Pending approval.');
      setShowProductModal(false);
      setProductForm({ title: '', description: '', price: '', category: '', stock: '', condition: 'new', images: [], city: '', province: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...serviceForm,
        price: Number(serviceForm.price),
        location: { city: serviceForm.city, province: serviceForm.province }
      };
      await api.post('/services', payload);
      toast.success('Service created! Pending approval.');
      setShowServiceModal(false);
      setServiceForm({ title: '', description: '', price: '', priceType: 'fixed', category: '', deliveryTime: '', images: [], city: '', province: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create service');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleServiceOrderStatus = async (id, status) => {
    try {
      await api.patch(`/orders/service-order/${id}/status`, { status });
      setServiceOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      toast.success('Order updated');
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  const stats = {
    totalProducts: products.length,
    approvedProducts: products.filter(p => p.status === 'approved').length,
    totalServices: services.length,
    approvedServices: services.filter(s => s.status === 'approved').length,
    pendingOrders: serviceOrders.filter(o => o.status === 'pending').length
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <div className="flex space-x-3">
          <button onClick={() => setShowProductModal(true)} className="btn-primary flex items-center">
            <FiPlus className="mr-2" /> Add Product
          </button>
          <button onClick={() => setShowServiceModal(true)} className="btn-accent flex items-center">
            <FiPlus className="mr-2" /> Add Service
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="card text-center">
          <FiPackage className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{stats.totalProducts}</p>
          <p className="text-sm text-gray-600">Products</p>
        </div>
        <div className="card text-center">
          <FiBriefcase className="w-8 h-8 mx-auto mb-2 text-accent" />
          <p className="text-2xl font-bold">{stats.totalServices}</p>
          <p className="text-sm text-gray-600">Services</p>
        </div>
        <div className="card text-center">
          <FiShoppingBag className="w-8 h-8 mx-auto mb-2 text-emerald" />
          <p className="text-2xl font-bold">{productOrders.length}</p>
          <p className="text-sm text-gray-600">Product Orders</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold">{serviceOrders.length}</p>
          <p className="text-sm text-gray-600">Service Orders</p>
        </div>
        <div className="card text-center bg-yellow-50">
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
      </div>

      <div className="flex space-x-4 mb-6 border-b">
        {['products', 'services', 'product-orders', 'service-orders'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-12">No products yet. Add your first product!</p>
          ) : products.map(product => (
            <div key={product._id} className="card">
              <img src={product.images[0] || 'https://via.placeholder.com/200'} alt={product.title} className="w-full h-40 object-cover rounded-lg mb-3" />
              <h3 className="font-semibold truncate">{product.title}</h3>
              <p className="text-primary font-bold">Rs. {product.price.toLocaleString()}</p>
              <div className="flex justify-between items-center mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  product.status === 'approved' ? 'bg-green-100 text-green-800' :
                  product.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>{product.status}</span>
                <button onClick={() => handleDeleteProduct(product._id)} className="text-red-500 hover:text-red-700">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {services.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-12">No services yet. Add your first service!</p>
          ) : services.map(service => (
            <div key={service._id} className="card">
              <img src={service.images[0] || 'https://via.placeholder.com/200'} alt={service.title} className="w-full h-40 object-cover rounded-lg mb-3" />
              <h3 className="font-semibold truncate">{service.title}</h3>
              <p className="text-accent font-bold">Rs. {service.price.toLocaleString()}/{service.priceType}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${
                service.status === 'approved' ? 'bg-green-100 text-green-800' :
                service.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}>{service.status}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'product-orders' && (
        <div className="card">
          {productOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {productOrders.map(order => (
                <div key={order._id} className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">#{order.orderNumber}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>{order.status}</span>
                  </div>
                  <p className="text-sm text-gray-600">Buyer: {order.buyer?.name}</p>
                  <p className="font-bold text-primary">Rs. {order.totalAmount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'service-orders' && (
        <div className="card">
          {serviceOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No service orders yet</p>
          ) : (
            <div className="space-y-4">
              {serviceOrders.map(order => (
                <div key={order._id} className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">#{order.orderNumber}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>{order.status}</span>
                  </div>
                  <p className="text-sm text-gray-600">Service: {order.service?.title}</p>
                  <p className="text-sm text-gray-600">Buyer: {order.buyer?.name}</p>
                  <p className="text-sm mt-2 bg-gray-50 p-2 rounded">{order.requirements}</p>
                  <div className="flex justify-between items-center mt-3">
                    <p className="font-bold text-accent">Rs. {order.price.toLocaleString()}</p>
                    {order.status === 'pending' && (
                      <div className="space-x-2">
                        <button onClick={() => handleServiceOrderStatus(order._id, 'accepted')} className="px-3 py-1 bg-green-500 text-white rounded text-sm">Accept</button>
                        <button onClick={() => handleServiceOrderStatus(order._id, 'cancelled')} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Decline</button>
                      </div>
                    )}
                    {order.status === 'accepted' && (
                      <button onClick={() => handleServiceOrderStatus(order._id, 'in_progress')} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">Start Work</button>
                    )}
                    {order.status === 'in_progress' && (
                      <button onClick={() => handleServiceOrderStatus(order._id, 'delivered')} className="px-3 py-1 bg-emerald text-white rounded text-sm">Mark Delivered</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Product</h2>
              <button onClick={() => setShowProductModal(false)}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input type="text" required value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea required rows={3} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (Rs.)</label>
                  <input type="number" required min="0" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input type="number" required min="0" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    <option value="">Select category</option>
                    {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Condition</label>
                  <select value={productForm.condition} onChange={e => setProductForm({...productForm, condition: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input type="text" value={productForm.city} onChange={e => setProductForm({...productForm, city: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Province</label>
                  <select value={productForm.province} onChange={e => setProductForm({...productForm, province: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    <option value="">Select province</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Images</label>
                <input type="file" multiple accept="image/*" onChange={e => handleImageUpload(e, 'product')} className="w-full" disabled={uploading} />
                {productForm.images.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {productForm.images.map((url, i) => (
                      <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" disabled={uploading} className="btn-primary w-full">{uploading ? 'Uploading...' : 'Create Product'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Service</h2>
              <button onClick={() => setShowServiceModal(false)}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input type="text" required value={serviceForm.title} onChange={e => setServiceForm({...serviceForm, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea required rows={3} value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (Rs.)</label>
                  <input type="number" required min="0" value={serviceForm.price} onChange={e => setServiceForm({...serviceForm, price: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price Type</label>
                  <select value={serviceForm.priceType} onChange={e => setServiceForm({...serviceForm, priceType: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    <option value="fixed">Fixed</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select required value={serviceForm.category} onChange={e => setServiceForm({...serviceForm, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    <option value="">Select category</option>
                    {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Time</label>
                  <input type="text" placeholder="e.g., 3-5 days" value={serviceForm.deliveryTime} onChange={e => setServiceForm({...serviceForm, deliveryTime: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input type="text" value={serviceForm.city} onChange={e => setServiceForm({...serviceForm, city: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Province</label>
                  <select value={serviceForm.province} onChange={e => setServiceForm({...serviceForm, province: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    <option value="">Select province</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Images</label>
                <input type="file" multiple accept="image/*" onChange={e => handleImageUpload(e, 'service')} className="w-full" disabled={uploading} />
                {serviceForm.images.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {serviceForm.images.map((url, i) => (
                      <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" disabled={uploading} className="btn-accent w-full">{uploading ? 'Uploading...' : 'Create Service'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerDashboard;
