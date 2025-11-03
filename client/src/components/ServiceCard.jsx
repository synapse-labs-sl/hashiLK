import { useNavigate } from 'react-router-dom';

function ServiceCard({ service }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/services/${service._id}`)}
      className="card-bridge cursor-pointer group"
    >
      <div className="relative overflow-hidden rounded-xl mb-4">
        <img
          src={service.images[0] || 'https://via.placeholder.com/300'}
          alt={service.title}
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3">
          <span className="bg-emerald/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
            {service.category}
          </span>
        </div>
      </div>
      
      <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-accent transition-colors line-clamp-2">
        {service.title}
      </h3>
      
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {service.description}
      </p>
      
      <div className="flex justify-between items-center mb-2">
        <span className="text-2xl font-bold text-accent">
          Rs. {service.price.toLocaleString()}
          <span className="text-sm font-normal text-gray-500">/{service.priceType}</span>
        </span>
      </div>
      
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>⏱️ {service.deliveryTime}</span>
        {service.location?.city && <span>📍 {service.location.city}</span>}
      </div>
    </div>
  );
}

export default ServiceCard;
