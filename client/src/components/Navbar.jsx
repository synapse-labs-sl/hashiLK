import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch, FiLogOut, FiSettings, FiShield, FiHeart, FiMessageCircle, FiBell } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useNotificationStore } from '../store/notificationStore';
import BridgeLogo from './BridgeLogo';

function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const items = useCartStore(state => state.items);
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-primary-dark via-primary to-primary-light text-white shadow-bridge sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <BridgeLogo className="w-8 h-8 md:w-10 md:h-10 transition-transform duration-300 group-hover:scale-110" />
            <div className="flex items-baseline">
              <span className="text-2xl md:text-3xl font-bold tracking-tight">Hashi</span>
              <span className="text-sm md:text-lg font-light opacity-80">.lk</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="nav-link pb-1">{t('products')}</Link>
            <Link to="/services" className="nav-link pb-1">{t('services')}</Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Search Button */}
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:bg-white/10 rounded-full transition">
              <FiSearch size={20} />
            </button>

            {/* Language Selector - Desktop */}
            <div className="hidden lg:flex space-x-1 bg-white/10 rounded-full px-2 py-1">
              {['en', 'si', 'ta'].map(lng => (
                <button
                  key={lng}
                  onClick={() => changeLanguage(lng)}
                  className={`text-xs px-2 py-1 rounded-full transition-all ${
                    i18n.language === lng ? 'bg-accent text-white' : 'hover:bg-white/10'
                  }`}
                >
                  {lng === 'en' ? 'EN' : lng === 'si' ? 'සිං' : 'த'}
                </button>
              ))}
            </div>

            {user && (
              <>
                {/* Wishlist */}
                <Link to="/wishlist" className="p-2 hover:bg-white/10 rounded-full transition hidden md:block">
                  <FiHeart size={20} />
                </Link>

                {/* Messages */}
                <Link to="/messages" className="relative p-2 hover:bg-white/10 rounded-full transition hidden md:block">
                  <FiMessageCircle size={20} />
                </Link>

                {/* Notifications */}
                <button 
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative p-2 hover:bg-white/10 rounded-full transition hidden md:block"
                >
                  <FiBell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:bg-white/10 rounded-full transition">
              <FiShoppingCart size={20} />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {items.length}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 hover:bg-white/10 rounded-full transition"
                >
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center font-semibold">
                    {user.name?.charAt(0)}
                  </div>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-50 text-gray-800">
                      <div className="px-4 py-2 border-b">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 hover:bg-gray-100">
                        <FiUser className="mr-3" /> Dashboard
                      </Link>
                      <Link to="/wishlist" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 hover:bg-gray-100 md:hidden">
                        <FiHeart className="mr-3" /> Wishlist
                      </Link>
                      <Link to="/messages" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 hover:bg-gray-100 md:hidden">
                        <FiMessageCircle className="mr-3" /> Messages
                      </Link>
                      {(user.isSeller || user.role === 'seller') && (
                        <Link to="/seller/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 hover:bg-gray-100">
                          <FiSettings className="mr-3" /> Seller Dashboard
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 hover:bg-gray-100 text-purple-600">
                          <FiShield className="mr-3" /> Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-red-600">
                        <FiLogOut className="mr-3" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden md:block bg-accent hover:bg-accent-light text-white px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300">
                {t('login')}
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-white/10 rounded-full transition">
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-4">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products and services..."
                className="flex-1 px-4 py-2 rounded-l-full text-gray-900 focus:outline-none"
                autoFocus
              />
              <button type="submit" className="bg-accent px-6 py-2 rounded-r-full">
                <FiSearch />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-primary-dark">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-accent transition">
              {t('products')}
            </Link>
            <Link to="/services" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-accent transition">
              {t('services')}
            </Link>
            {!user && (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-accent transition">
                {t('login')}
              </Link>
            )}
            <div className="flex space-x-2 pt-2 border-t border-white/20">
              {['en', 'si', 'ta'].map(lng => (
                <button
                  key={lng}
                  onClick={() => changeLanguage(lng)}
                  className={`text-sm px-3 py-1 rounded-full transition-all ${
                    i18n.language === lng ? 'bg-accent text-white' : 'bg-white/10'
                  }`}
                >
                  {lng === 'en' ? 'English' : lng === 'si' ? 'සිංහල' : 'தமிழ்'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
