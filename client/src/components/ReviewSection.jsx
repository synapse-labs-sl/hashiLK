import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiStar, FiThumbsUp, FiCheck } from 'react-icons/fi';

function ReviewSection({ type, itemId, canReview = false }) {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [itemId]);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/reviews/${type}/${itemId}`);
      setReviews(data.reviews);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to leave a review');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post(`/reviews/${type}/${itemId}`, formData);
      setReviews([data, ...reviews]);
      setStats({
        ...stats,
        totalReviews: stats.totalReviews + 1,
        averageRating: ((stats.averageRating * stats.totalReviews) + formData.rating) / (stats.totalReviews + 1)
      });
      setShowForm(false);
      setFormData({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      const { data } = await api.post(`/reviews/${reviewId}/helpful`);
      setReviews(reviews.map(r => 
        r._id === reviewId ? { ...r, helpfulCount: data.helpfulCount } : r
      ));
    } catch (error) {
      toast.error('Failed to mark as helpful');
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onChange(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : ''} transition`}
            disabled={!interactive}
          >
            <FiStar
              className={`w-5 h-5 ${
                star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="animate-pulse h-40 bg-gray-100 rounded-lg"></div>;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">Reviews</h3>
          <div className="flex items-center mt-1">
            {renderStars(Math.round(stats.averageRating))}
            <span className="ml-2 text-gray-600">
              {stats.averageRating.toFixed(1)} ({stats.totalReviews} reviews)
            </span>
          </div>
        </div>
        {canReview && user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary text-sm"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6">
          <h4 className="font-semibold mb-4">Write Your Review</h4>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Rating</label>
            {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Title (optional)</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Summarize your experience"
              className="w-full px-4 py-2 border rounded-lg"
              maxLength={100}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Your Review</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Share your experience..."
              rows={4}
              className="w-full px-4 py-2 border rounded-lg"
              maxLength={1000}
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 border rounded-full"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold mr-3">
                    {review.reviewer?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{review.reviewer?.name}</p>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                      {review.isVerifiedPurchase && (
                        <span className="ml-2 text-xs text-green-600 flex items-center">
                          <FiCheck className="mr-1" /> Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>

              {review.title && (
                <h4 className="font-semibold mt-3">{review.title}</h4>
              )}
              
              <p className="text-gray-700 mt-2">{review.comment}</p>

              {review.response && (
                <div className="mt-4 pl-4 border-l-2 border-primary bg-gray-50 p-3 rounded">
                  <p className="text-sm font-semibold text-primary">Seller Response:</p>
                  <p className="text-sm text-gray-600">{review.response.text}</p>
                </div>
              )}

              <div className="mt-4 flex items-center">
                <button
                  onClick={() => handleHelpful(review._id)}
                  className="text-sm text-gray-500 hover:text-primary flex items-center"
                >
                  <FiThumbsUp className="mr-1" />
                  Helpful ({review.helpfulCount || 0})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewSection;
