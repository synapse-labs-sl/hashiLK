import { useNavigate } from 'react-router-dom';

function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      className="card-bridge cursor-pointer group"
    >
      <div className="relative overflow-hidden rounded-xl mb-4">
        <img
          src={product.images[0] || 'https://via.placeholder.com/300'}
          alt={product.title}
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary">
            {product.condition}
          </span>
        </div>
      </div>
      
      <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-primary transition-colors line-clamp-2">
        {product.title}
      </h3>
      
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {product.description}
      </p>
      
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold text-primary">
          Rs. {product.price.toLocaleString()}
        </span>
        {product.location?.city && (
          <span className="text-xs text-gray-500">📍 {product.location.city}</span>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
