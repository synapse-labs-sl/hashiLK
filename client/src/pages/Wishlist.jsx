import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { FiHeart, FiShoppingCart, FiTrash2, FiTrendingDown } from 'react-icons/fi';

function Wishlist() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { products, services, loading, fetchWishlist, removeProduct, removeService } = useWishlistStore();
  const addToCart = useCartStore(state => state.addItem);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [user]);

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success('Added to cart!');
  };

  const handleRemoveProduct = async (productId) => {
    await removeProduct(productId);
    toast.success('Removed from wishlist');
  };

  const handleRemoveService = async (serviceId) => {
    await removeService(serviceId);
    toast.success('Removed from wishlist');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isEmpty = products.length === 0 && services.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <FiHeart className="mr-3 text-red-500" /> My Wishlist
        </h1>

        {isEmpty ? (
          <div className="text-center py-20">
            <FiHeart className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save items you like by clicking the heart icon</p>
            <div className="flex justify-center gap-4">
              <Link to="/products" className="btn-primary">Browse Products</Link>
              <Link to="/services" className="btn-accent">Browse Services</Link>
            </div>
          </div>
        ) : (
          <>
            {/* Products */}
            {products.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-bold mb-4">Products ({products.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <div key={product._id} className="card group">
                      <div className="relative">
                        <img
                          src={product.images?.[0] || 'https://via.placeholder.com/300'}
                          alt={product.title}
                          className="w-full h-48 object-cover rounded-lg mb-3 cursor-pointer"
                          onClick={() => navigate(`/products/${product._id}`)}
                        />
                        {product.priceDropped && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                            <FiTrendingDown className="mr-1" />
                            Rs. {product.priceDrop.toLocaleString()} off!
                          </div>
                        )}
                        <button
                          onClick={() => handleRemoveProduct(product._id)}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-red-50 text-red-500"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                      <h3 className="font-semibold truncate">{product.title}</h3>
                      <p className="text-primary font-bold text-lg">Rs. {product.price?.toLocaleString()}</p>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="mt-3 w-full py-2 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary-light transition disabled:opacity-50"
                      >
                        <FiShoppingCart className="mr-2" />
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {services.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Services ({services.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {services.map((service) => (
                    <div key={service._id} className="card group">
                      <div className="relative">
                        <img
                          src={service.images?.[0] || 'https://via.placeholder.com/300'}
                          alt={service.title}
                          className="w-full h-48 object-cover rounded-lg mb-3 cursor-pointer"
                          onClick={() => navigate(`/services/${service._id}`)}
                        />
                        {service.priceDropped && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                            <FiTrendingDown className="mr-1" />
                            Price dropped!
                          </div>
                        )}
                        <button
                          onClick={() => handleRemoveService(service._id)}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-red-50 text-red-500"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                      <h3 className="font-semibold truncate">{service.title}</h3>
                      <p className="text-accent font-bold text-lg">
                        Rs. {service.price?.toLocaleString()}/{service.priceType}
                      </p>
                      <button
                        onClick={() => navigate(`/services/${service._id}`)}
                        className="mt-3 w-full py-2 bg-accent text-white rounded-lg hover:bg-accent-light transition"
                      >
                        View Service
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
