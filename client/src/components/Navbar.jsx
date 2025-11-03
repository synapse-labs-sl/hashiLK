import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiShoppingCart, FiUser } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import BridgeLogo from './BridgeLogo';

function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const items = useCartStore(state => state.items);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="bg-gradient-to-r from-primary-dark via-primary to-primary-light text-white shadow-bridge sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <BridgeLogo className="w-10 h-10 transition-transform duration-300 group-hover:scale-110" />
            <div className="flex items-baseline">
              <span className="text-3xl font-bold tracking-tight">Hashi</span>
              <span className="text-lg font-light opacity-80">.lk</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="nav-link pb-1">
              {t('products')}
            </Link>
            <Link to="/services" className="nav-link pb-1">
              {t('services')}
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex space-x-1 bg-white/10 rounded-full px-3 py-1.5">
              <button 
                onClick={() => changeLanguage('en')} 
                className={`text-xs px-2 py-1 rounded-full transition-all ${i18n.language === 'en' ? 'bg-accent text-white' : 'hover:bg-white/10'}`}
              >
                EN
              </button>
              <button 
                onClick={() => changeLanguage('si')} 
                className={`text-xs px-2 py-1 rounded-full transition-all ${i18n.language === 'si' ? 'bg-accent text-white' : 'hover:bg-white/10'}`}
              >
                සිං
              </button>
              <button 
                onClick={() => changeLanguage('ta')} 
                className={`text-xs px-2 py-1 rounded-full transition-all ${i18n.language === 'ta' ? 'bg-accent text-white' : 'hover:bg-white/10'}`}
              >
                த
              </button>
            </div>

            <Link to="/cart" className="relative hover:text-accent transition-all duration-300 hover:scale-110">
              <FiShoppingCart size={24} />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-pulse">
                  {items.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="hover:text-accent transition-all duration-300 hover:scale-110">
                  <FiUser size={24} />
                </Link>
                <button 
                  onClick={logout} 
                  className="text-sm hover:text-accent transition-all duration-300 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-accent hover:bg-accent-light text-white px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
