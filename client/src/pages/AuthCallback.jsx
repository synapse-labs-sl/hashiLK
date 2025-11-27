import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';

function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore(state => state.setAuth);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Fetch user data with the token
      const fetchUser = async () => {
        try {
          const { data } = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAuth(data.user, token);
          toast.success('Login successful!');
          navigate('/dashboard');
        } catch (error) {
          toast.error('Authentication failed');
          navigate('/login');
        }
      };
      fetchUser();
    } else {
      navigate('/login');
    }
  }, [searchParams, setAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}

export default AuthCallback;
