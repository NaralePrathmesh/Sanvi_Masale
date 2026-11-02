/**
 * Homepage hero banners & announcement bar messages (editable in /admin/content).
 * `image`: set a real path such as '/images/banners/hero-1.jpg'. When null, an
 * illustrated placeholder (variant `art`) is shown.
 */
export const defaultBanners = [
  {
    id: 'b1', active: true, image: null, art: 'bowls', link: '/shop',
    eyebrow: { en: 'Since 1978 · Stone-ground in small batches', hi: '1978 से · छोटे बैच में पत्थर पर पिसे', mr: '1978 पासून · छोट्या बॅचमध्ये दगडावर दळलेले' },
    title: { en: 'Bringing Authentic Indian Flavours to Your Kitchen.', hi: 'प्रामाणिक भारतीय स्वाद, सीधे आपकी रसोई तक।', mr: 'अस्सल भारतीय चव, थेट तुमच्या स्वयंपाकघरात.' },
    subtitle: { en: 'Discover the richness of traditional Indian spices, carefully selected for unforgettable meals.', hi: 'पारंपरिक भारतीय मसालों की समृद्धि खोजें — यादगार भोजन के लिए सावधानी से चुने गए।', mr: 'पारंपरिक भारतीय मसाल्यांची समृद्धी अनुभवा — अविस्मरणीय जेवणासाठी काळजीपूर्वक निवडलेले.' },
  },
  {
    id: 'b2', active: true, image: null, art: 'maharashtra', link: '/regional',
    eyebrow: { en: 'Regional Specials', hi: 'क्षेत्रीय विशेष', mr: 'प्रादेशिक खास' },
    title: { en: 'Kolhapur to Konkan, in a Spoon', hi: 'कोल्हापुर से कोंकण तक, एक चम्मच में', mr: 'कोल्हापूर ते कोकण, एका चमच्यात' },
    subtitle: { en: 'Kanda Lasun, Goda, Malvani and Misal masalas made the way aaji made them.', hi: 'कांदा लहसुन, गोडा, मालवणी और मिसल मसाले — दादी के तरीके से।', mr: 'कांदा लसूण, गोडा, मालवणी आणि मिसळ मसाले — आजीच्या पद्धतीने.' },
  },
  {
    id: 'b3', active: true, image: null, art: 'festive', link: '/offers',
    eyebrow: { en: 'Festive Offer · Use FESTIVE15', hi: 'त्योहारी ऑफ़र · FESTIVE15 लगाएँ', mr: 'सणासुदीची ऑफर · FESTIVE15 वापरा' },
    title: { en: 'Gift the Warmth of Masala', hi: 'मसालों की गर्माहट उपहार में दें', mr: 'मसाल्यांची ऊब भेट द्या' },
    subtitle: { en: 'Festive gift boxes and combos with up to 20% off this season.', hi: 'इस सीज़न त्योहारी गिफ़्ट बॉक्स और कॉम्बो पर 20% तक की छूट।', mr: 'या हंगामात सणासुदीचे गिफ्ट बॉक्स आणि कॉम्बोवर 20% पर्यंत सूट.' },
  },
];

export const defaultAnnouncements = [
  { en: 'Authentic Indian Flavours  |  Free Delivery on Orders Above ₹499', hi: 'प्रामाणिक भारतीय स्वाद  |  ₹499 से ऊपर के ऑर्डर पर मुफ़्त डिलीवरी', mr: 'अस्सल भारतीय चव  |  ₹499 पेक्षा जास्त ऑर्डरवर मोफत डिलिव्हरी' },
];

/** Homepage section toggles & featured product ids (editable in /admin/content). */
export const defaultHomeContent = {
  featuredProductIds: ['p11', 'p17', 'p22', 'p26', 'p01', 'p35', 'p30', 'p24'],
  // Homepage section toggles (admin → Content). Hero, categories and bestsellers are always shown.
  sections: { regional: true, why: true, reviews: true, recipes: true, story: true, newsletter: true },
  promo: {
    active: true,
    title: { en: 'Build Your Own Masala Box', hi: 'अपना मसाला बॉक्स बनाएँ', mr: 'तुमचा मसाला बॉक्स बनवा' },
    text: { en: 'Pick any 3 or more masalas and save up to 20%.', hi: 'कोई भी 3 या अधिक मसाले चुनें और 20% तक बचाएँ।', mr: 'कोणतेही 3 किंवा अधिक मसाले निवडा आणि 20% पर्यंत बचत करा.' },
  },
};
