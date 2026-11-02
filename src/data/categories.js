/** Product categories. `art` drives the placeholder illustration (see assets/images.js). */
export const categories = [
  { id: 'pure-spices', name: { en: 'Pure Spices', hi: 'शुद्ध मसाले', mr: 'शुद्ध मसाले' }, desc: { en: 'Single-origin, stone-ground', hi: 'एकल स्रोत, पत्थर पर पिसे', mr: 'एकाच स्रोतातून, दगडावर दळलेले' }, icon: 'Leaf' },
  { id: 'blended-masalas', name: { en: 'Blended Masalas', hi: 'मिश्रित मसाले', mr: 'मिश्र मसाले' }, desc: { en: 'Time-tested family blends', hi: 'पारंपरिक पारिवारिक मिश्रण', mr: 'पारंपरिक घरगुती मिश्रणे' }, icon: 'Sparkles' },
  { id: 'maharashtrian', name: { en: 'Maharashtrian Masalas', hi: 'महाराष्ट्रीयन मसाले', mr: 'महाराष्ट्रीय मसाले' }, desc: { en: 'Goda, Kanda Lasun & more', hi: 'गोडा, कांदा लसूण और भी', mr: 'गोडा, कांदा लसूण आणि बरेच' }, icon: 'Flame' },
  { id: 'south-indian', name: { en: 'South Indian Masalas', hi: 'दक्षिण भारतीय मसाले', mr: 'दाक्षिणात्य मसाले' }, desc: { en: 'Sambhar, Rasam, Chettinad', hi: 'सांभर, रसम, चेट्टिनाड', mr: 'सांबार, रसम, चेट्टिनाड' }, icon: 'Soup' },
  { id: 'north-indian', name: { en: 'North Indian Masalas', hi: 'उत्तर भारतीय मसाले', mr: 'उत्तर भारतीय मसाले' }, desc: { en: 'Chole, Rajma, Tandoori', hi: 'छोले, राजमा, तंदूरी', mr: 'छोले, राजमा, तंदुरी' }, icon: 'ChefHat' },
  { id: 'instant-mixes', name: { en: 'Instant Mixes', hi: 'इंस्टेंट मिक्स', mr: 'इन्स्टंट मिक्स' }, desc: { en: 'Chai, chaat & drinks', hi: 'चाय, चाट और पेय', mr: 'चहा, चाट आणि पेये' }, icon: 'Zap' },
  { id: 'ready-to-cook', name: { en: 'Ready-to-Cook', hi: 'रेडी-टू-कुक', mr: 'रेडी-टू-कुक' }, desc: { en: 'Restaurant taste in minutes', hi: 'मिनटों में रेस्टोरेंट जैसा स्वाद', mr: 'काही मिनिटांत हॉटेलसारखी चव' }, icon: 'Timer' },
  { id: 'combo-packs', name: { en: 'Combo Packs', hi: 'कॉम्बो पैक', mr: 'कॉम्बो पॅक' }, desc: { en: 'Curated kitchen sets', hi: 'चुने हुए किचन सेट', mr: 'निवडक किचन सेट' }, icon: 'Package' },
];

export const productTypes = [
  { id: 'powder', name: { en: 'Ground Powder', hi: 'पिसा पाउडर', mr: 'पावडर' } },
  { id: 'whole', name: { en: 'Whole Spice', hi: 'साबुत मसाला', mr: 'अख्खा मसाला' } },
  { id: 'blend', name: { en: 'Masala Blend', hi: 'मसाला मिश्रण', mr: 'मसाला मिश्रण' } },
  { id: 'mix', name: { en: 'Instant / Ready Mix', hi: 'इंस्टेंट / रेडी मिक्स', mr: 'इन्स्टंट / रेडी मिक्स' } },
  { id: 'combo', name: { en: 'Combo Pack', hi: 'कॉम्बो पैक', mr: 'कॉम्बो पॅक' } },
];

export const regions = [
  { id: 'maharashtra', name: { en: 'Maharashtra', hi: 'महाराष्ट्र', mr: 'महाराष्ट्र' }, desc: { en: 'Bold, fiery and aromatic — from the Kolhapuri tambda rassa to the sweet-smoky Goda masala of Pune homes.', hi: 'तीखा, चटपटा और खुशबूदार — कोल्हापुरी तांबडा रस्सा से लेकर पुणे के घरों के गोडा मसाले तक।', mr: 'झणझणीत, खमंग आणि सुगंधी — कोल्हापुरी तांबड्या रश्श्यापासून पुण्याच्या घरांतील गोड्या मसाल्यापर्यंत.' }, dishes: { en: 'Misal, Bharli Vangi, Masale Bhaat, Tambda Rassa', hi: 'मिसल, भरली वांगी, मसाले भात, तांबडा रस्सा', mr: 'मिसळ, भरली वांगी, मसाले भात, तांबडा रस्सा' } },
  { id: 'north', name: { en: 'North India', hi: 'उत्तर भारत', mr: 'उत्तर भारत' }, desc: { en: 'Rich, warming and creamy — the masalas behind Punjabi dhaba classics and royal Mughlai gravies.', hi: 'समृद्ध, गर्माहट भरे और मलाईदार — पंजाबी ढाबा क्लासिक्स और मुगलई ग्रेवी के पीछे के मसाले।', mr: 'समृद्ध, उबदार आणि मलईदार — पंजाबी ढाबा पदार्थ आणि मुघलाई ग्रेव्हीमागचे मसाले.' }, dishes: { en: 'Chole, Rajma, Dal Makhani, Tandoori Tikka', hi: 'छोले, राजमा, दाल मखनी, तंदूरी टिक्का', mr: 'छोले, राजमा, दाल मखनी, तंदुरी टिक्का' } },
  { id: 'south', name: { en: 'South India', hi: 'दक्षिण भारत', mr: 'दक्षिण भारत' }, desc: { en: 'Tangy, peppery and tempered with curry leaves — the soul of everyday sambhar, rasam and biryani.', hi: 'खट्टा, कालीमिर्च वाला और करी पत्ते का तड़का — रोज़ के सांभर, रसम और बिरयानी की आत्मा।', mr: 'आंबट, मिरीदार आणि कढीपत्त्याची फोडणी — रोजच्या सांबार, रसम आणि बिर्याणीचा आत्मा.' }, dishes: { en: 'Sambhar, Rasam, Chettinad Curry, Biryani', hi: 'सांभर, रसम, चेट्टिनाड करी, बिरयानी', mr: 'सांबार, रसम, चेट्टिनाड करी, बिर्याणी' } },
];

/** URL slugs for region pages (/regional/<slug>). */
export const REGION_SLUGS = { maharashtra: 'maharashtra', north: 'north-india', south: 'south-india' };
export const regionSlug = (id) => REGION_SLUGS[id] || id;
export const regionFromSlug = (slug) => Object.keys(REGION_SLUGS).find((k) => REGION_SLUGS[k] === slug);
