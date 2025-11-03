import { Link } from 'react-router-dom';
import BridgeLogo from './BridgeLogo';

function Footer() {
  return (
    <footer className="bg-gradient-to-b from-primary-dark to-primary text-white mt-20 gokkola-bg">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <BridgeLogo className="w-8 h-8" />
              <div className="flex items-baseline">
                <span className="text-2xl font-bold">Hashi</span>
                <span className="text-sm font-light opacity-80">.lk</span>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Bridging opportunities across Sri Lanka. Your marketplace for products and services.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-accent">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-accent transition-colors duration-300">Products</Link></li>
              <li><Link to="/services" className="hover:text-accent transition-colors duration-300">Services</Link></li>
              <li><Link to="/register" className="hover:text-accent transition-colors duration-300">Become a Seller</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-accent">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-accent transition-colors duration-300">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-accent transition-colors duration-300">FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-accent transition-colors duration-300">Terms & Conditions</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-accent">Contact</h4>
            <p className="text-sm text-white/70 leading-relaxed">
              Email: support@hashi.lk<br />
              Phone: +94 XX XXX XXXX<br />
              <span className="text-xs mt-2 block">Connecting Sri Lanka, one opportunity at a time.</span>
            </p>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-sm text-white/60">&copy; 2025 Hashi.lk. All rights reserved. Built with ❤️ in Sri Lanka.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
