import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiX, FiImage, FiTag, FiBell, FiStar } from 'react-icons/fi';

function AdminContent() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('banners');
  const [banners, setBanners] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [bannersRes, promotionsRes, noticesRes] = await Promise.all([
        api.get('/content/admin/banners'),
        api.get('/content/admin/promotions'),
        api.get('/content/admin/notices')
      ]);
      setBanners(bannersRes.data);
      setPromotions(promotionsRes.data);
      setNotices(noticesRes.data);
    } catch (error) {
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    
    try {
      await api.delete(`/content/admin/${type}/${id}`);
      toast.success('Deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleToggleActive = async (type, id, currentStatus) => {
    try {
      await api.put(`/content/admin/${type}/${id}`, { isActive: !currentStatus });
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update');
    }
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
          <h1 className="text-3xl font-bold">Content Management</h1>
          <button
            onClick={() => { setEditingItem(null); setShowModal(true); }}
            className="btn-primary flex items-center"
          >
            <FiPlus className="mr-2" /> Add New
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b">
          {[
            { id: 'banners', label: 'Banners', icon: FiImage, count: banners.length },
            { id: 'promotions', label: 'Promotions', icon: FiTag, count: promotions.length },
            { id: 'notices', label: 'Notices', icon: FiBell, count: notices.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 font-medium transition border-b-2 -mb-px ${
                activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="mr-2" />
              {tab.label}
              <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Banners Tab */}
        {activeTab === 'banners' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 py-12">No banners yet</p>
            ) : banners.map(banner => (
              <div key={banner._id} className="card">
                <img
                  src={banner.image || 'https://via.placeholder.com/400x200'}
                  alt={banner.title}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold">{banner.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{banner.subtitle}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-gray-500">{banner.position}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleToggleActive('banners', banner._id, banner.isActive)}
                    className="flex-1 py-2 text-sm border rounded hover:bg-gray-50"
                  >
                    {banner.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => { setEditingItem({ ...banner, type: 'banner' }); setShowModal(true); }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDelete('banners', banner._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <div className="card">
            {promotions.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No promotions yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Title</th>
                      <th className="text-left py-3 px-4">Code</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Discount</th>
                      <th className="text-left py-3 px-4">Usage</th>
                      <th className="text-left py-3 px-4">Valid Until</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotions.map(promo => (
                      <tr key={promo._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{promo.title}</td>
                        <td className="py-3 px-4">
                          <code className="bg-gray-100 px-2 py-1 rounded">{promo.code || '-'}</code>
                        </td>
                        <td className="py-3 px-4 capitalize">{promo.type.replace('_', ' ')}</td>
                        <td className="py-3 px-4">
                          {promo.type === 'percentage' ? `${promo.discountValue}%` : `Rs. ${promo.discountValue}`}
                        </td>
                        <td className="py-3 px-4">
                          {promo.usageCount}/{promo.usageLimit || '∞'}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(promo.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            promo.isActive && new Date(promo.endDate) > new Date()
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {promo.isActive && new Date(promo.endDate) > new Date() ? 'Active' : 'Expired'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <button
                              onClick={() => { setEditingItem({ ...promo, type: 'promotion' }); setShowModal(true); }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete('promotions', promo._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Notices Tab */}
        {activeTab === 'notices' && (
          <div className="space-y-4">
            {notices.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No notices yet</p>
            ) : notices.map(notice => (
              <div key={notice._id} className={`card border-l-4 ${
                notice.type === 'warning' ? 'border-yellow-500' :
                notice.type === 'error' ? 'border-red-500' :
                notice.type === 'success' ? 'border-green-500' :
                notice.type === 'announcement' ? 'border-purple-500' :
                'border-blue-500'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{notice.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        notice.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {notice.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                        {notice.position}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                        {notice.target}
                      </span>
                    </div>
                    <p className="text-gray-600">{notice.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive('notices', notice._id, notice.isActive)}
                      className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                    >
                      {notice.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => { setEditingItem({ ...notice, type: 'notice' }); setShowModal(true); }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete('notices', notice._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <ContentModal
            type={editingItem?.type || activeTab.slice(0, -1)}
            item={editingItem}
            onClose={() => { setShowModal(false); setEditingItem(null); }}
            onSave={() => { setShowModal(false); setEditingItem(null); fetchData(); }}
          />
        )}
      </div>
    </div>
  );
}

// Modal Component
function ContentModal({ type, item, onClose, onSave }) {
  const [formData, setFormData] = useState(item || getDefaultData(type));
  const [loading, setLoading] = useState(false);

  function getDefaultData(type) {
    if (type === 'banner') {
      return { title: '', subtitle: '', image: '', link: '', linkText: '', position: 'hero', isActive: true };
    }
    if (type === 'promotion') {
      return { 
        title: '', description: '', type: 'percentage', discountValue: 10, code: '',
        minOrderAmount: 0, maxDiscount: '', usageLimit: '', startDate: '', endDate: '', isActive: true
      };
    }
    if (type === 'notice') {
      return { 
        title: '', content: '', type: 'info', target: 'all', position: 'top_bar',
        isDismissible: true, isActive: true, link: '', linkText: ''
      };
    }
    return {};
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const endpoint = `/content/admin/${type}s${item?._id ? `/${item._id}` : ''}`;
      if (item?._id) {
        await api.put(endpoint, formData);
      } else {
        await api.post(endpoint, formData);
      }
      toast.success(`${type} ${item?._id ? 'updated' : 'created'} successfully`);
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold capitalize">{item?._id ? 'Edit' : 'Add'} {type}</h2>
          <button onClick={onClose}><FiX size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Banner Fields */}
          {type === 'banner' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subtitle</label>
                <input type="text" value={formData.subtitle || ''} onChange={e => setFormData({...formData, subtitle: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL *</label>
                <input type="url" required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Link URL</label>
                  <input type="url" value={formData.link || ''} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Link Text</label>
                  <input type="text" value={formData.linkText || ''} onChange={e => setFormData({...formData, linkText: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="Shop Now" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <select value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                  <option value="hero">Hero (Homepage)</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="footer">Footer</option>
                  <option value="popup">Popup</option>
                </select>
              </div>
            </>
          )}

          {/* Promotion Fields */}
          {type === 'promotion' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type *</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    <option value="percentage">Percentage Off</option>
                    <option value="fixed">Fixed Amount Off</option>
                    <option value="flash_sale">Flash Sale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Value *</label>
                  <input type="number" required min="0" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Coupon Code</label>
                <input type="text" value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full px-4 py-2 border rounded-lg font-mono" placeholder="SAVE20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Min Order Amount</label>
                  <input type="number" min="0" value={formData.minOrderAmount || ''} onChange={e => setFormData({...formData, minOrderAmount: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Usage Limit</label>
                  <input type="number" min="0" value={formData.usageLimit || ''} onChange={e => setFormData({...formData, usageLimit: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" placeholder="Unlimited" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <input type="datetime-local" required value={formData.startDate?.slice(0, 16) || ''} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date *</label>
                  <input type="datetime-local" required value={formData.endDate?.slice(0, 16) || ''} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
            </>
          )}

          {/* Notice Fields */}
          {type === 'notice' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content *</label>
                <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full px-4 py-2 border rounded-lg" rows={3} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Target</label>
                  <select value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    <option value="all">All Users</option>
                    <option value="buyers">Buyers Only</option>
                    <option value="sellers">Sellers Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Position</label>
                  <select value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    <option value="top_bar">Top Bar</option>
                    <option value="popup">Popup</option>
                    <option value="dashboard">Dashboard</option>
                    <option value="checkout">Checkout</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input type="checkbox" checked={formData.isDismissible} onChange={e => setFormData({...formData, isDismissible: e.target.checked})} className="mr-2" />
                  Dismissible
                </label>
              </div>
            </>
          )}

          {/* Common Active Toggle */}
          <div className="flex items-center">
            <label className="flex items-center">
              <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="mr-2" />
              Active
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : (item?._id ? 'Update' : 'Create')}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2 border rounded-full">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminContent;
