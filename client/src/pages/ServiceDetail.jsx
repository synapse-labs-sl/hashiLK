import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import ReviewSection from '../components/ReviewSection';
import { FiClock, FiMapPin, FiUser, FiStar, FiX, FiHeart, FiMessageCircle, FiShare2, FiCheck } from 'react-icons/fi';

function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [booking, setBooking] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  const { addService, removeService, isInWishlist } = useWishlistStore();

  useEffect(() => {
    fetchService();
  }, [id]);

  useEffect(() => {
    if (service && user) {
      setInWishlist(isInWishlist('service', service._id));
    }
  }, [service, user]);

  const fetchService = async () => {
    try {
      const { data } = await api.get(`/services/${id}`);
      setService(data);
    } catch (error) {
      toast.error('Failed to load service');
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = async () => {
    if (!user) {
      toast.error('Please login to book this service');
      navigate('/login');
      return;
    }

    if (!requirements.trim()) {
      toast.error('Please describe your requirements');
      return;
    }

    setBooking(true);
    try {
      await api.post('/orders/service-order', {
        serviceId: service._id,
        requirements
      });
      toast.success('Service booked successfully!');
      setShowBookingModal(false);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book service');
    } finally {
      setBooking(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }

    if (inWishlist) {
      await removeService(service._id);
      setInWishlist(false);
      toast.success('Removed from wishlist');
    } else {
      await addService(service._id);
      setInWishlist(true);
      toast.success('Added to wishlist');
    }
  };

  const handleContact = () => {
    if (!user) {
      toast.error('Please login to contact provider');
      navigate('/login');
      return;
    }
    navigate(`/messages?to=${service.provider._id}&service=${service._id}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: service.title,
        text: `Check out ${service.title} on Hashi.lk`,
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Service not found</h2>
          <button onClick={() => navigate('/services')} className="btn-accent">Browse Services</button>
        </div>
      </div>
    );
  }

  const isOwnService = service.provider?._id === user?.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="card mb-6">
              <div className="relative">
                <img
                  src={service.images?.[selectedImage] || 'https://via.placeholder.com/800x500'}
                  alt={service.title}
                  className="w-full h-96 object-cover rounded-xl"
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
                  <button onClick={handleShare} className="p-3 bg-white rounded-full shadow-lg text-gray-600 hover:text-accent transition">
                    <FiShare2 />
                  </button>
                </div>
              </div>
              {service.images?.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {service.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt=""
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 object-cover rounded-lg cursor-pointer transition ${
                        selectedImage === idx ? 'ring-2 ring-accent' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Service Info */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">
                  {service.category}
                </span>
                <span className="text-gray-500 text-sm flex items-center">
                  <FiClock className="mr-1" /> {service.deliveryTime || 'Flexible'}
                </span>
                {service.rating?.count > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FiStar className="text-yellow-400 fill-yellow-400 mr-1" />
                    {service.rating.average?.toFixed(1)} ({service.rating.count})
                  </div>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-4">{service.title}</h1>

              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-line">{service.description}</p>
              </div>

              {service.location?.city && (
                <div className="flex items-center text-gray-600 mb-4">
                  <FiMapPin className="mr-2" />
                  {service.location.city}, {service.location.province}
                </div>
              )}

              <div className="text-sm text-gray-500">
                {service.views} views
              </div>
            </div>

            {/* Reviews Section */}
            <ReviewSection type="service" itemId={id} canReview={true} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Pricing Card */}
            <div className="card sticky top-24">
              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-accent">
                  Rs. {service.price?.toLocaleString()}
                </p>
                <p className="text-gray-500">/{service.priceType}</p>
              </div>

              <button
                onClick={() => setShowBookingModal(true)}
                className="btn-accent w-full mb-4"
                disabled={isOwnService}
              >
                {isOwnService ? 'This is your service' : 'Book This Service'}
              </button>

              <button
                onClick={handleContact}
                disabled={isOwnService}
                className="w-full py-3 border-2 border-gray-300 rounded-full font-semibold flex items-center justify-center hover:border-accent hover:text-accent transition disabled:opacity-50"
              >
                <FiMessageCircle className="mr-2" /> Contact Provider
              </button>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <FiUser className="mr-2" /> About the Provider
                </h3>
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent font-bold text-lg mr-3">
                    {service.provider?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{service.provider?.name}</p>
                    {service.provider?.sellerInfo?.businessName && (
                      <p className="text-sm text-gray-600">{service.provider.sellerInfo.businessName}</p>
                    )}
                  </div>
                </div>
                {service.provider?.sellerInfo?.rating > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FiStar className="text-yellow-500 mr-1" />
                    {service.provider.sellerInfo.rating} rating
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mt-4 text-xs text-gray-500">
                <p>Platform fee: {service.commissionRate}% on completion</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Book Service</h2>
              <button onClick={() => setShowBookingModal(false)}>
                <FiX size={24} />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">{service.title}</h3>
              <p className="text-2xl font-bold text-accent">
                Rs. {service.price?.toLocaleString()}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Describe your requirements *
              </label>
              <textarea
                rows={5}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Please describe what you need in detail. Include any specific requirements, deadlines, or preferences..."
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span>Service Price</span>
                <span>Rs. {service.price?.toLocaleString()}</span>
              </div>
              <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>Rs. {service.price?.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleBookService}
              disabled={booking || !requirements.trim()}
              className="btn-accent w-full"
            >
              {booking ? 'Processing...' : 'Confirm Booking'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              The provider will review your request and accept or decline within 24 hours.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceDetail;
