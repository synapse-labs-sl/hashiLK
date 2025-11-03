import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';

function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      const params = {
        category: searchParams.get('category'),
        search: searchParams.get('search')
      };
      const { data } = await api.get('/products', { params });
      setProducts(data.products);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 gokkola-bg py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Products</h1>
          {searchParams.get('category') && (
            <p className="text-gray-600">Category: {searchParams.get('category')}</p>
          )}
          {searchParams.get('search') && (
            <p className="text-gray-600">Search results for: "{searchParams.get('search')}"</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl mb-4">No products found</p>
            <p className="text-gray-400">Try adjusting your search or browse all categories</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
