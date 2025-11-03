import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: "Welcome to Hashi.lk",
      subtitle: "Sri Lanka's All-in-One Marketplace",
      searchProducts: "Search Products",
      searchServices: "Search Services",
      products: "Products",
      services: "Services",
      login: "Login",
      register: "Register",
      cart: "Cart",
      myAccount: "My Account",
      becomeASeller: "Become a Seller",
      categories: "Categories"
    }
  },
  si: {
    translation: {
      welcome: "Hashi.lk වෙත සාදරයෙන් පිළිගනිමු",
      subtitle: "ශ්‍රී ලංකාවේ සියල්ල එකම වෙළඳපොළ",
      searchProducts: "නිෂ්පාදන සොයන්න",
      searchServices: "සේවා සොයන්න",
      products: "නිෂ්පාදන",
      services: "සේවා",
      login: "ඇතුල් වන්න",
      register: "ලියාපදිංචි වන්න",
      cart: "කරත්තය",
      myAccount: "මගේ ගිණුම",
      becomeASeller: "විකුණුම්කරුවෙකු වන්න",
      categories: "කාණ්ඩ"
    }
  },
  ta: {
    translation: {
      welcome: "Hashi.lk க்கு வரவேற்கிறோம்",
      subtitle: "இலங்கையின் அனைத்தும் ஒரே சந்தை",
      searchProducts: "தயாரிப்புகளைத் தேடுங்கள்",
      searchServices: "சேவைகளைத் தேடுங்கள்",
      products: "தயாரிப்புகள்",
      services: "சேவைகள்",
      login: "உள்நுழைக",
      register: "பதிவு செய்க",
      cart: "வண்டி",
      myAccount: "எனது கணக்கு",
      becomeASeller: "விற்பனையாளராக மாறுங்கள்",
      categories: "வகைகள்"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
