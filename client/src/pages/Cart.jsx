import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { FiTrash2 } from 'react-icons/fi';

function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/products')} className="btn-primary">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <div key={item.product._id} className="card mb-4 flex items-center">
              <img
                src={item.product.images[0] || 'https://via.placeholder.com/100'}
                alt={item.product.title}
                className="w-24 h-24 object-cover rounded-lg mr-4"
              />
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.product.title}</h3>
                <p className="text-primary font-bold">Rs. {item.product.price.toLocaleString()}</p>
              </div>

              <div className="flex items-center space-x-4">
                <select
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.product._id, Number(e.target.value))}
                  className="border rounded px-3 py-1"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>

                <button
                  onClick={() => removeItem(item.product._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {getTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Rs. 500</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>Rs. {(getTotal() + 500).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
