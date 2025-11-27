import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import ReviewSection from '../components/ReviewSection';
import { FiShoppingCart, FiMapPin, FiUser, FiStar, FiMinus, FiPlus, FiCheck, FiHeart, FiMessageCircle, FiShare2 } from 'react-icons/fi';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const addItem = useCartStore(state => state.addItem);
  const { addProduct, removeProduct, isInWishlist } = useWishlistStore();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && user) {
      setInWishlist(isInWishlist('product', product._id));
    }
  }, [product, user]);

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
    addItem(product, quantity);
    setAddedToCart(true);
    toast.success('Added to cart!');
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/cart');
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }

    if (inWishlist) {
      await removeProduct(product._id);
      setInWishlist(false);
      toast.success('Removed from wishlist');
    } else {
      await addProduct(product._id);
      setInWishlist(true);
      toast.success('Added to wishlist');
    }
  };

  const handleContact = () => {
    if (!user) {
      toast.error('Please login to contact seller');
      navigate('/login');
      return;
    }
    navigate(`/messages?to=${product.seller._id}&product=${product._id}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out ${product.title} on Hashi.lk`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <button onClick={() => navigate('/products')} className="btn-primary">Browse Products</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="card mb-4">
              <div className="relative">
                <img
                  src={product.images?.[selectedImage] || 'https://via.placeholder.com/600x500'}
                  alt={product.title}
                  className="w-full h-96 lg:h-[500px] object-contain rounded-xl bg-white"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={handleWishlist}
                    className={`p-3 rounded-full shadow-lg transition ${
                      inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:text-red-500'
                    }`}
                  >
                    <FiHeart className={inWishlist ? 'fill-current' : ''} />
                  </button>
                  <button onClick={handleShare} className="p-3 bg-white rounded-full shadow-lg text-gray-600 hover:text-primary transition">
                    <FiShare2 />
                  </button>
                </div>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.condition === 'new' ? 'bg-green-100 text-green-800' :
                    product.condition === 'refurbished' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {product.condition}
                  </span>
                </div>
              </div>
            </div>
            
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt=""
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer transition flex-shrink-0 ${
                      selectedImage === idx ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {product.category}
                </span>
                {product.rating?.count > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FiStar className="text-yellow-400 fill-yellow-400 mr-1" />
                    {product.rating.average?.toFixed(1)} ({product.rating.count})
                  </div>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-primary">
                  Rs. {product.price?.toLocaleString()}
                </span>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
              </div>

              <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                {product.location?.city && (
                  <span className="flex items-center">
                    <FiMapPin className="mr-1" /> {product.location.city}, {product.location.province}
                  </span>
                )}
                <span className={`flex items-center ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-100"
                    >
                      <FiMinus />
                    </button>
                    <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-100"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-3 rounded-full font-semibold transition flex items-center justify-center ${
                    addedToCart
                      ? 'bg-green-500 text-white'
                      : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {addedToCart ? <><FiCheck className="mr-2" /> Added!</> : <><FiShoppingCart className="mr-2" /> Add to Cart</>}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {/* Contact Seller */}
              <button
                onClick={handleContact}
                className="w-full py-3 border-2 border-gray-300 rounded-full font-semibold flex items-center justify-center hover:border-primary hover:text-primary transition"
              >
                <FiMessageCircle className="mr-2" /> Contact Seller
              </button>

              {/* Seller Info */}
              <div className="border-t pt-6 mt-6">
                <h3 className="font-semibold mb-3 flex items-center">
                  <FiUser className="mr-2" /> Seller Information
                </h3>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg mr-3">
                    {product.seller?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{product.seller?.name}</p>
                    {product.seller?.sellerInfo?.businessName && (
                      <p className="text-sm text-gray-600">{product.seller.sellerInfo.businessName}</p>
                    )}
                    {product.seller?.sellerInfo?.rating > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FiStar className="text-yellow-500 mr-1" />
                        {product.seller.sellerInfo.rating} rating
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500 text-center">
              {product.views} views
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSection type="product" itemId={id} canReview={true} />
      </div>
    </div>
  );
}

export default ProductDetail;
