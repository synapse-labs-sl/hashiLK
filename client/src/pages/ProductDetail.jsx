import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
    } catch (error) {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addItem(product);
    toast.success('Added to cart!');
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!product) return <div className="text-center py-20">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={product.images[0] || 'https://via.placeholder.com/500'}
            alt={product.title}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          <p className="text-4xl font-bold text-primary mb-6">Rs. {product.price.toLocaleString()}</p>
          
          <div className="mb-6">
            <span className="inline-block bg-gray-200 px-3 py-1 rounded-full text-sm mr-2">
              {product.category}
            </span>
            <span className="inline-block bg-gray-200 px-3 py-1 rounded-full text-sm">
              {product.condition}
            </span>
          </div>

          <p className="text-gray-700 mb-6">{product.description}</p>

          <div className="mb-6">
            <p className="text-sm text-gray-600">Stock: {product.stock} available</p>
            <p className="text-sm text-gray-600">Location: {product.location?.city}</p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn-primary w-full md:w-auto"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          <div className="mt-8 border-t pt-6">
            <h3 className="font-semibold mb-2">Seller Information</h3>
            <p className="text-gray-700">{product.seller?.name}</p>
            <p className="text-sm text-gray-600">Rating: {product.seller?.sellerInfo?.rating || 'New seller'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
