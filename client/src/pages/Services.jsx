import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import ServiceCard from '../components/ServiceCard';
import { FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const CATEGORIES = ['Web Development', 'Graphic Design', 'Writing', 'Marketing', 'Photography', 'Tutoring', 'Consulting', 'Other'];

function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  const [filters, setFilters] = useState({ category });

  useEffect(() => {
    fetchServices();
  }, [searchParams]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        category: searchParams.get('category'),
        search: searchParams.get('search')
      };
      
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const { data } = await api.get('/services', { params });
      setServices(data.services);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (search) params.set('search', search);
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ category: '' });
    setSearchParams(search ? { search } : {});
  };

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 gokkola-bg">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-dark via-accent to-accent-light text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Services</h1>
          <p className="text-white/80">
            {search ? `Search results for "${search}"` : 'Find skilled professionals for any task'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="card sticky top-24">
              <h3 className="font-bold text-lg mb-4">Filters</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <button onClick={applyFilters} className="btn-accent w-full">
                  Apply Filters
                </button>
                {category && (
                  <button onClick={clearFilters} className="btn-outline w-full">
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4 flex justify-between items-center">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center px-4 py-2 border rounded-lg"
              >
                <FiFilter className="mr-2" /> Filters
                {category && (
                  <span className="ml-2 bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </button>
              <span className="text-gray-600">{services.length} services</span>
            </div>

            {/* Active Filters Tags */}
            {category && (
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm flex items-center">
                  {category}
                  <button onClick={clearFilters} className="ml-2"><FiX /></button>
                </span>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="bg-gray-200 h-56 rounded-xl mb-4"></div>
                    <div className="bg-gray-200 h-6 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 text-xl mb-4">No services found</p>
                <p className="text-gray-400 mb-6">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="btn-accent">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <ServiceCard key={service._id} service={service} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-12 space-x-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      <FiChevronLeft />
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`w-10 h-10 rounded-lg ${
                              currentPage === page
                                ? 'bg-accent text-white'
                                : 'border hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return <span key={page}>...</span>;
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Filters</h3>
              <button onClick={() => setShowFilters(false)}><FiX size={24} /></button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <button onClick={applyFilters} className="btn-accent w-full">
                Apply Filters
              </button>
              <button onClick={clearFilters} className="btn-outline w-full">
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Services;
