import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import { FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Vehicles', 'Other'];
const CONDITIONS = ['new', 'used', 'refurbished'];

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const [filters, setFilters] = useState({
    category,
    minPrice,
    maxPrice
  });

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        category: searchParams.get('category'),
        search: searchParams.get('search'),
        minPrice: searchParams.get('minPrice'),
        maxPrice: searchParams.get('maxPrice')
      };
      
      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const { data } = await api.get('/products', { params });
      setProducts(data.products);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (search) params.set('search', search);
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ category: '', minPrice: '', maxPrice: '' });
    setSearchParams(search ? { search } : {});
  };

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = category || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-gray-50 gokkola-bg">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-dark via-primary to-primary-light text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Products</h1>
          <p className="text-white/80">
            {search ? `Search results for "${search}"` : 'Browse our marketplace'}
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

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-1/2 px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-1/2 px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <button onClick={applyFilters} className="btn-primary w-full">
                  Apply Filters
                </button>
                {hasActiveFilters && (
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
                {hasActiveFilters && (
                  <span className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </button>
              <span className="text-gray-600">{products.length} products</span>
            </div>

            {/* Active Filters Tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {category && (
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                    {category}
                    <button onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete('category');
                      setSearchParams(params);
                      setFilters({ ...filters, category: '' });
                    }} className="ml-2"><FiX /></button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                    Rs. {minPrice || '0'} - {maxPrice || '∞'}
                    <button onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete('minPrice');
                      params.delete('maxPrice');
                      setSearchParams(params);
                      setFilters({ ...filters, minPrice: '', maxPrice: '' });
                    }} className="ml-2"><FiX /></button>
                  </span>
                )}
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
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 text-xl mb-4">No products found</p>
                <p className="text-gray-400 mb-6">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
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
                                ? 'bg-primary text-white'
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
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
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

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-1/2 px-3 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-1/2 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <button onClick={applyFilters} className="btn-primary w-full">
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

export default Products;
