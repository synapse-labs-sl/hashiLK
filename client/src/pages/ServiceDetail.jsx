import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchService();
  }, [id]);

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

  const handleContact = () => {
    toast.success('Contact feature coming soon!');
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!service) return <div className="text-center py-20">Service not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={service.images[0] || 'https://via.placeholder.com/500'}
            alt={service.title}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{service.title}</h1>
          <p className="text-4xl font-bold text-secondary mb-6">
            Rs. {service.price.toLocaleString()}/{service.priceType}
          </p>
          
          <div className="mb-6">
            <span className="inline-block bg-gray-200 px-3 py-1 rounded-full text-sm mr-2">
              {service.category}
            </span>
            <span className="inline-block bg-gray-200 px-3 py-1 rounded-full text-sm">
              Delivery: {service.deliveryTime}
            </span>
          </div>

          <p className="text-gray-700 mb-6">{service.description}</p>

          <div className="mb-6">
            <p className="text-sm text-gray-600">Location: {service.location?.city}</p>
            <p className="text-sm text-gray-600">Commission: {service.commissionRate}%</p>
          </div>

          <button onClick={handleContact} className="btn-secondary w-full md:w-auto">
            Contact Provider
          </button>

          <div className="mt-8 border-t pt-6">
            <h3 className="font-semibold mb-2">Provider Information</h3>
            <p className="text-gray-700">{service.provider?.name}</p>
            <p className="text-sm text-gray-600">Rating: {service.provider?.sellerInfo?.rating || 'New provider'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceDetail;
