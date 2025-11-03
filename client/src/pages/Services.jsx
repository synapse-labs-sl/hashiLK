import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import ServiceCard from '../components/ServiceCard';

function Services() {
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, [searchParams]);

  const fetchServices = async () => {
    try {
      const params = {
        category: searchParams.get('category'),
        search: searchParams.get('search')
      };
      const { data } = await api.get('/services', { params });
      setServices(data.services);
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-accent text-xl">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 gokkola-bg py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-accent mb-2">Services</h1>
          {searchParams.get('category') && (
            <p className="text-gray-600">Category: {searchParams.get('category')}</p>
          )}
          {searchParams.get('search') && (
            <p className="text-gray-600">Search results for: "{searchParams.get('search')}"</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl mb-4">No services found</p>
            <p className="text-gray-400">Try adjusting your search or browse all categories</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Services;
