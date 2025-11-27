import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { FcGoogle } from 'react-icons/fc';
import { FiCheck } from 'react-icons/fi';

function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data } = await api.post('/auth/register', formData);
      setAuth(data.user, data.token);
      toast.success('Registration successful!');
      
      // Redirect based on role
      if (formData.role === 'seller') {
        navigate('/become-seller');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="card max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-2">{t('register')}</h2>
        <p className="text-gray-600 text-center mb-8">Join Sri Lanka's marketplace</p>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center space-x-2 border-2 border-gray-300 rounded-lg py-3 mb-6 hover:bg-gray-50 transition"
        >
          <FcGoogle size={24} />
          <span>Continue with Google</span>
        </button>
        
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or register with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Confirm your password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'buyer' })}
                className={`p-4 border-2 rounded-lg text-left transition ${
                  formData.role === 'buyer' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-2xl">🛒</span>
                  {formData.role === 'buyer' && <FiCheck className="text-primary" />}
                </div>
                <p className="font-semibold mt-2">Buy</p>
                <p className="text-xs text-gray-500">Shop products & services</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'seller' })}
                className={`p-4 border-2 rounded-lg text-left transition ${
                  formData.role === 'seller' 
                    ? 'border-accent bg-accent/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-2xl">💼</span>
                  {formData.role === 'seller' && <FiCheck className="text-accent" />}
                </div>
                <p className="font-semibold mt-2">Sell</p>
                <p className="text-xs text-gray-500">List products & services</p>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            {t('login')}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
