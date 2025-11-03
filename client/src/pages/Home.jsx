import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiShoppingBag, FiBriefcase, FiTrendingUp, FiUsers, FiAward } from 'react-icons/fi';

function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('products');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/${searchType}?search=${searchQuery}`);
  };

  const categories = [
    { name: 'Electronics', icon: '📱', gradient: 'from-blue-500 to-blue-600' },
    { name: 'Fashion', icon: '👕', gradient: 'from-pink-500 to-pink-600' },
    { name: 'Home & Garden', icon: '🏠', gradient: 'from-green-500 to-green-600' },
    { name: 'Sports', icon: '⚽', gradient: 'from-orange-500 to-orange-600' },
    { name: 'Books', icon: '📚', gradient: 'from-purple-500 to-purple-600' },
    { name: 'Toys', icon: '🧸', gradient: 'from-yellow-500 to-yellow-600' }
  ];

  const serviceCategories = [
    { name: 'Web Development', icon: '💻', gradient: 'from-cyan-500 to-cyan-600' },
    { name: 'Graphic Design', icon: '🎨', gradient: 'from-rose-500 to-rose-600' },
    { name: 'Writing', icon: '✍️', gradient: 'from-indigo-500 to-indigo-600' },
    { name: 'Marketing', icon: '📢', gradient: 'from-emerald-500 to-emerald-600' },
    { name: 'Photography', icon: '📷', gradient: 'from-violet-500 to-violet-600' },
    { name: 'Tutoring', icon: '📖', gradient: 'from-amber-500 to-amber-600' }
  ];

  const features = [
    { icon: FiTrendingUp, title: 'Growing Marketplace', desc: 'Join thousands of active buyers and sellers' },
    { icon: FiUsers, title: 'Trusted Community', desc: 'Verified sellers and secure transactions' },
    { icon: FiAward, title: 'Quality Assured', desc: 'Admin-moderated listings for your safety' }
  ];

  return (
    <div className="gokkola-bg">
      {/* Hero Section with Bridge Theme */}
      <section className="relative bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white py-24 overflow-hidden">
        {/* Decorative bridge arch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-32 opacity-10">
          <svg viewBox="0 0 800 100" className="w-full h-full">
            <path d="M0,100 Q400,0 800,100" fill="currentColor" className="text-white" />
          </svg>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            {t('welcome')}
          </h1>
          <p className="text-2xl mb-3 font-light opacity-90">{t('subtitle')}</p>
          <p className="text-lg mb-12 opacity-75 max-w-2xl mx-auto">
            Bridging opportunities across Sri Lanka - Your trusted marketplace for products and services
          </p>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6 space-x-4">
              <button
                onClick={() => setSearchType('products')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                  searchType === 'products' 
                    ? 'bg-accent shadow-hover scale-105' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <FiShoppingBag className="inline mr-2" />
                {t('products')}
              </button>
              <button
                onClick={() => setSearchType('services')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                  searchType === 'services' 
                    ? 'bg-accent shadow-hover scale-105' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <FiBriefcase className="inline mr-2" />
                {t('services')}
              </button>
            </div>
            
            <form onSubmit={handleSearch} className="flex shadow-hover rounded-full overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchType === 'products' ? t('searchProducts') : t('searchServices')}
                className="flex-1 px-8 py-5 text-gray-900 focus:outline-none text-lg"
              />
              <button 
                type="submit" 
                className="bg-accent hover:bg-accent-light px-10 py-5 transition-all duration-300 hover:scale-105"
              >
                <FiSearch size={28} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bridge curve */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-50 bridge-arch"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="card-bridge text-center">
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3 text-primary">Popular Product Categories</h2>
            <p className="text-gray-600">Discover what you need across diverse categories</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => navigate(`/products?category=${cat.name}`)}
                className="card-bridge text-center cursor-pointer group"
              >
                <div className={`text-5xl mb-4 transition-transform duration-300 group-hover:scale-125`}>
                  {cat.icon}
                </div>
                <h3 className="font-semibold text-gray-800 group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* Service Categories */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3 text-primary">Popular Service Categories</h2>
            <p className="text-gray-600">Find skilled professionals for any task</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {serviceCategories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => navigate(`/services?category=${cat.name}`)}
                className="card-bridge text-center cursor-pointer group"
              >
                <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-125">
                  {cat.icon}
                </div>
                <h3 className="font-semibold text-gray-800 group-hover:text-accent transition-colors">
                  {cat.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Bridge Theme */}
      <section className="relative py-24 bg-gradient-to-r from-accent-dark via-accent to-accent-light text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Start Selling Today</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of sellers bridging opportunities across Sri Lanka</p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-accent px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-hover hover:scale-105 hover:-translate-y-1"
          >
            {t('becomeASeller')} →
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
