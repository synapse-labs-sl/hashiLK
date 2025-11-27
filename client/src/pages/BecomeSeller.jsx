import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiCheck } from 'react-icons/fi';

function BecomeSeller() {
  const navigate = useNavigate();
  const { user, setAuth, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    description: ''
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  if (user.isSeller || user.role === 'seller') {
    navigate('/seller/dashboard');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/users/become-seller', {
        sellerInfo: formData
      });
      setAuth(data.user, token);
      toast.success('You are now a seller!');
      navigate('/seller/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register as seller');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    'List unlimited products and services',
    'Reach thousands of buyers across Sri Lanka',
    'Secure payment processing',
    'Seller dashboard with analytics',
    'Direct communication with buyers'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">Become a Seller</h1>
            <p className="text-gray-600 text-lg">Start selling your products and services on Hashi.lk</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Seller Benefits</h2>
              <ul className="space-y-4">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start">
                    <FiCheck className="w-5 h-5 text-emerald mt-0.5 mr-3 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 p-4 bg-accent/10 rounded-lg">
                <h3 className="font-semibold text-accent mb-2">Commission Structure</h3>
                <p className="text-sm text-gray-600">
                  Products: No commission fees<br />
                  Services: 15% commission on completed orders
                </p>
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Register as Seller</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Business Name</label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Your business or brand name"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Business Description</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell buyers about your business..."
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full"
                  >
                    {loading ? 'Processing...' : 'Start Selling'}
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  By registering, you agree to our seller terms and conditions
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BecomeSeller;
