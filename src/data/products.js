/**
 * CENTRAL MOCK PRODUCT CATALOGUE  (DEMO DATA — not real products)
 * ----------------------------------------------------------------
 * Replace these entries with your real products. Every field is plain data:
 *  - name / short / description: { en, hi, mr }  (description is optional — a
 *    localized template is used when it is missing)
 *  - packs: [{ size, price, mrp, stock }]  (prices in INR)
 *  - ingredients / dishes: keys translated in i18n (`ingredients.*`, `dishes.*`)
 *  - images: [] → put real image paths here, e.g. ['/images/products/turmeric-1.jpg'].
 *    While empty, a generated packaging mockup (PackShot) is shown instead.
 *  - color: [primary, accent] used by the generated packaging mockup.
 */

const SCALE = { 25: 1.18, 50: 1.08, 100: 1, 200: 0.94, 500: 0.86, 1000: 0.8 };
const round5 = (n) => Math.max(5, Math.round(n / 5) * 5);

/** Build pack sizes from a price-per-100g and a discount %. */
function packs(sizes, per100, discount = 10, stockSeed = 1) {
  return sizes.map((g, i) => {
    const price = round5((per100 * g * SCALE[g]) / 100);
    const mrp = discount ? round5(price / (1 - discount / 100)) : price;
    const stock = (stockSeed * 37 + i * 53) % 140 + (i === 0 ? 4 : 18);
    return { size: g >= 1000 ? `${g / 1000}kg` : `${g}g`, grams: g, price, mrp: Math.max(mrp, price), stock };
  });
}

const raw = [
  // ─── Pure spices ────────────────────────────────────────────────
  { id: 'p01', slug: 'turmeric-powder', category: 'pure-spices', type: 'powder', region: 'pan-india', color: ['#E5A52B', '#A92324'],
    name: { en: 'Turmeric Powder', hi: 'हल्दी पाउडर', mr: 'हळद पावडर' },
    short: { en: 'High-curcumin Salem turmeric, sun-dried and stone-ground.', hi: 'उच्च करक्यूमिन वाली सेलम हल्दी, धूप में सुखाई और पत्थर पर पिसी।', mr: 'जास्त करक्युमिन असलेली सेलम हळद, उन्हात वाळवलेली आणि दगडावर दळलेली.' },
    packs: packs([50, 100, 200, 500], 42, 12, 1), ingredients: ['turmeric'], dishes: ['dal', 'vegetables', 'chickenCurry', 'paneer'],
    rating: 4.8, reviews: 2140, popularity: 98, createdAt: '2025-01-10', bestseller: true, heat: 1, tags: ['haldi', 'halad'] },
  { id: 'p02', slug: 'red-chilli-powder', category: 'pure-spices', type: 'powder', region: 'pan-india', color: ['#A92324', '#E5A52B'],
    name: { en: 'Chilli Powder (Dava Special)', hi: 'मिर्ची पाउडर (दावा स्पेशल)', mr: 'मिरची पावडर (दावा स्पेशल)' },
    short: { en: 'Fiery Guntur chillies for colour and honest heat.', hi: 'रंग और असली तीखेपन के लिए गुंटूर मिर्च।', mr: 'रंग आणि खऱ्या तिखटपणासाठी गुंटूर मिरची.' },
    packs: packs([50, 100, 200, 500, 1000], 48, 10, 2), ingredients: ['redChilli'], dishes: ['chickenCurry', 'vegetables', 'dal', 'snacks'],
    rating: 4.7, reviews: 1876, popularity: 95, createdAt: '2025-01-12', bestseller: true, heat: 4, tags: ['mirch', 'lal mirchi', 'tikhat'] },
  { id: 'p03', slug: 'kashmiri-chilli-powder', category: 'pure-spices', type: 'powder', region: 'north', color: ['#C2362F', '#FFF8ED'],
    name: { en: 'Kashmiri Mirchi Powder (Stemless)', hi: 'कश्मीरी मिर्ची पाउडर (डंठल रहित)', mr: 'काश्मिरी मिरची पावडर (डंकी कट)' },
    short: { en: 'Deep red colour, gentle heat — perfect for gravies.', hi: 'गहरा लाल रंग, हल्का तीखापन — ग्रेवी के लिए बढ़िया।', mr: 'गडद लाल रंग, सौम्य तिखटपणा — ग्रेव्हीसाठी उत्तम.' },
    packs: packs([50, 100, 200], 70, 10, 3), ingredients: ['kashmiriChilli'], dishes: ['paneer', 'chickenCurry', 'pavBhaji', 'snacks'],
    rating: 4.8, reviews: 954, popularity: 88, createdAt: '2025-03-02', heat: 2, tags: ['degi mirch'] },
  { id: 'p04', slug: 'coriander-powder', category: 'pure-spices', type: 'powder', region: 'pan-india', color: ['#7A8B3A', '#E5A52B'],
    name: { en: 'Coriander Powder', hi: 'धनिया पाउडर', mr: 'धणे पावडर' },
    short: { en: 'Fragrant, lightly roasted Rajasthani coriander seeds.', hi: 'खुशबूदार, हल्के भुने राजस्थानी धनिया बीज।', mr: 'सुगंधी, हलक्या भाजलेल्या राजस्थानी धण्यांपासून.' },
    packs: packs([50, 100, 200, 500], 32, 10, 4), ingredients: ['coriander'], dishes: ['vegetables', 'dal', 'chickenCurry', 'paneer'],
    rating: 4.6, reviews: 1320, popularity: 90, createdAt: '2025-01-15', bestseller: true, heat: 1, tags: ['dhaniya', 'dhane'] },
  { id: 'p05', slug: 'cumin-powder', category: 'pure-spices', type: 'powder', region: 'pan-india', color: ['#8A5A2B', '#FFF8ED'],
    name: { en: 'Cumin Powder', hi: 'जीरा पाउडर', mr: 'जिरे पावडर' },
    short: { en: 'Earthy, warm Unjha cumin ground fresh in small batches.', hi: 'मिट्टी जैसी, गर्म ऊंझा जीरा, छोटे बैच में ताज़ा पिसा।', mr: 'मातीसारखा उबदार सुगंध, उंझा जिरे छोट्या बॅचमध्ये दळलेले.' },
    packs: packs([50, 100, 200], 75, 8, 5), ingredients: ['cumin'], dishes: ['dal', 'vegetables', 'snacks'],
    rating: 4.7, reviews: 860, popularity: 80, createdAt: '2025-02-01', heat: 1, tags: ['jeera', 'jire'] },
  { id: 'p06', slug: 'black-pepper-powder', category: 'pure-spices', type: 'powder', region: 'south', color: ['#3A3330', '#E5A52B'],
    name: { en: 'Black Pepper Powder', hi: 'काली मिर्च पाउडर', mr: 'काळी मिरी पावडर' },
    short: { en: 'Bold Malabar pepper with a sharp, lingering bite.', hi: 'तेज़ और देर तक रहने वाले स्वाद वाली मालाबार काली मिर्च।', mr: 'तीव्र आणि दीर्घ चवीची मलबार काळी मिरी.' },
    packs: packs([25, 50, 100], 160, 10, 6), ingredients: ['blackPepper'], dishes: ['snacks', 'chickenCurry', 'vegetables'],
    rating: 4.6, reviews: 512, popularity: 70, createdAt: '2025-04-11', heat: 3, tags: ['kali mirch', 'miri'] },
  { id: 'p07', slug: 'whole-cumin-seeds', category: 'pure-spices', type: 'whole', region: 'pan-india', color: ['#9C7A3C', '#315C3B'],
    name: { en: 'Whole Cumin Seeds', hi: 'साबुत जीरा', mr: 'अख्खे जिरे' },
    short: { en: 'Machine-cleaned bold jeera for perfect tadka.', hi: 'बेहतरीन तड़के के लिए साफ़ किया हुआ मोटा जीरा।', mr: 'उत्तम फोडणीसाठी स्वच्छ केलेले टपोरे जिरे.' },
    packs: packs([50, 100, 200, 500], 60, 8, 7), ingredients: ['cumin'], dishes: ['dal', 'vegetables', 'biryani'],
    rating: 4.7, reviews: 690, popularity: 76, createdAt: '2025-02-20', heat: 1, tags: ['jeera', 'sabut'] },
  { id: 'p08', slug: 'green-cardamom', category: 'pure-spices', type: 'whole', region: 'south', color: ['#5E8C4A', '#FFF8ED'],
    name: { en: 'Green Cardamom', hi: 'हरी इलायची', mr: 'हिरवी वेलची' },
    short: { en: '8mm bold Idukki pods, intensely aromatic.', hi: '8 मिमी मोटी इडुक्की इलायची, बेहद खुशबूदार।', mr: '8 मिमी टपोरी इडुक्की वेलची, अतिशय सुगंधी.' },
    packs: packs([25, 50, 100], 420, 12, 8), ingredients: ['cardamom'], dishes: ['biryani', 'snacks'],
    rating: 4.9, reviews: 432, popularity: 72, createdAt: '2025-05-06', heat: 0, tags: ['elaichi', 'velchi'] },
  { id: 'p09', slug: 'dry-ginger-powder', category: 'pure-spices', type: 'powder', region: 'south', color: ['#C9A26B', '#A92324'],
    name: { en: 'Dry Ginger Powder (Saunth)', hi: 'सौंठ पाउडर', mr: 'सुंठ पावडर' },
    short: { en: 'Warming Kerala saunth for chai, kadha and sweets.', hi: 'चाय, काढ़ा और मिठाइयों के लिए केरल की सौंठ।', mr: 'चहा, काढा आणि गोड पदार्थांसाठी केरळची सुंठ.' },
    packs: packs([50, 100], 110, 10, 9), ingredients: ['dryGinger'], dishes: ['snacks'],
    rating: 4.5, reviews: 210, popularity: 55, createdAt: '2026-08-14', isNew: true, heat: 1, tags: ['saunth', 'sunth', 'ginger'] },
  { id: 'p10', slug: 'amchur-powder', category: 'pure-spices', type: 'powder', region: 'north', color: ['#D9B04A', '#315C3B'],
    name: { en: 'Amchur Powder', hi: 'अमचूर पाउडर', mr: 'आमचूर पावडर' },
    short: { en: 'Tangy dried raw-mango powder for chaats and bhindi.', hi: 'चाट और भिंडी के लिए खट्टा कच्चे आम का पाउडर।', mr: 'चाट आणि भेंडीसाठी आंबट कैरी पावडर.' },
    packs: packs([50, 100], 90, 10, 10), ingredients: ['amchur'], dishes: ['snacks', 'vegetables'],
    rating: 4.5, reviews: 318, popularity: 58, createdAt: '2025-06-01', heat: 0, tags: ['mango', 'aamchur'] },

  // ─── Blended masalas ────────────────────────────────────────────
  { id: 'p11', slug: 'garam-masala', category: 'blended-masalas', type: 'blend', region: 'north', color: ['#6B3A24', '#E5A52B'],
    name: { en: 'Garam Masala', hi: 'गरम मसाला', mr: 'गरम मसाला' },
    short: { en: 'A royal blend of 13 whole spices, slow-roasted.', hi: '13 साबुत मसालों का धीमी आँच पर भुना शाही मिश्रण।', mr: '13 अख्ख्या मसाल्यांचे मंद आचेवर भाजलेले शाही मिश्रण.' },
    packs: packs([50, 100, 200, 500], 95, 12, 11), ingredients: ['coriander', 'cumin', 'blackPepper', 'cardamom', 'blackCardamom', 'clove', 'cinnamon', 'bayLeaf', 'nutmeg', 'mace', 'dryGinger', 'starAnise', 'fennel'],
    dishes: ['paneer', 'chickenCurry', 'biryani', 'vegetables', 'dal'], rating: 4.9, reviews: 3012, popularity: 99, createdAt: '2025-01-05', bestseller: true, heat: 2, tags: ['garam'] },
  { id: 'p12', slug: 'kitchen-king-masala', category: 'blended-masalas', type: 'blend', region: 'north', color: ['#A92324', '#315C3B'],
    name: { en: 'Kitchen King Masala', hi: 'किचन किंग मसाला', mr: 'किचन किंग मसाला' },
    short: { en: 'One all-rounder masala for every sabzi and curry.', hi: 'हर सब्ज़ी और करी के लिए एक ऑल-राउंडर मसाला।', mr: 'प्रत्येक भाजी आणि करीसाठी एकच अष्टपैलू मसाला.' },
    packs: packs([50, 100, 200], 85, 10, 12), ingredients: ['coriander', 'redChilli', 'turmeric', 'cumin', 'fenugreek', 'kasuriMethi', 'dryGinger', 'blackPepper', 'clove', 'cinnamon'],
    dishes: ['vegetables', 'paneer', 'dal'], rating: 4.7, reviews: 1490, popularity: 92, createdAt: '2025-01-20', bestseller: true, heat: 2, tags: ['all purpose'] },
  { id: 'p13', slug: 'chaat-masala', category: 'blended-masalas', type: 'blend', region: 'north', color: ['#315C3B', '#E5A52B'],
    name: { en: 'Chaat Masala', hi: 'चाट मसाला', mr: 'चाट मसाला' },
    short: { en: 'Tangy, salty, chatpata — sprinkle on anything.', hi: 'खट्टा, नमकीन, चटपटा — किसी भी चीज़ पर छिड़कें।', mr: 'आंबट, खारट, चटपटीत — कशावरही भुरभुरा.' },
    packs: packs([50, 100, 200], 80, 10, 13), ingredients: ['amchur', 'blackSalt', 'cumin', 'coriander', 'mint', 'blackPepper', 'asafoetida', 'dryGinger'],
    dishes: ['snacks', 'vegetables'], rating: 4.8, reviews: 1704, popularity: 93, createdAt: '2025-02-02', bestseller: true, heat: 1, tags: ['chat'] },
  { id: 'p14', slug: 'chicken-masala', category: 'blended-masalas', type: 'blend', region: 'pan-india', color: ['#8B1C1D', '#E5A52B'],
    name: { en: 'Chicken Masala', hi: 'चिकन मसाला', mr: 'चिकन मसाला' },
    short: { en: 'Home-style chicken curry with a deep, roasted base.', hi: 'गहरे भुने स्वाद के साथ घर जैसी चिकन करी।', mr: 'खमंग भाजलेल्या चवीची घरगुती चिकन करी.' },
    packs: packs([50, 100, 200], 90, 10, 14), ingredients: ['coriander', 'redChilli', 'turmeric', 'cumin', 'blackPepper', 'clove', 'cinnamon', 'cardamom', 'fennel', 'garlic', 'onion', 'bayLeaf'],
    dishes: ['chickenCurry'], rating: 4.7, reviews: 1388, popularity: 89, createdAt: '2025-01-25', heat: 3, tags: ['murgh', 'non veg'] },
  { id: 'p15', slug: 'mutton-masala', category: 'blended-masalas', type: 'blend', region: 'pan-india', color: ['#5A1E1A', '#E5A52B'],
    name: { en: 'Mutton Masala', hi: 'मटन मसाला', mr: 'मटण मसाला' },
    short: { en: 'Robust whole-spice blend for slow-cooked mutton.', hi: 'धीमी आँच पर पके मटन के लिए दमदार मिश्रण।', mr: 'मंद आचेवर शिजवलेल्या मटणासाठी दमदार मिश्रण.' },
    packs: packs([50, 100, 200], 98, 10, 15), ingredients: ['coriander', 'redChilli', 'blackPepper', 'clove', 'cinnamon', 'blackCardamom', 'starAnise', 'nutmeg', 'mace', 'dryCoconut', 'garlic'],
    dishes: ['chickenCurry'], rating: 4.6, reviews: 702, popularity: 74, createdAt: '2025-03-15', heat: 4, tags: ['meat', 'non veg'] },
  { id: 'p16', slug: 'sabzi-masala', category: 'blended-masalas', type: 'blend', region: 'pan-india', color: ['#4F7A3A', '#A92324'],
    name: { en: 'Sabzi Masala', hi: 'सब्ज़ी मसाला', mr: 'भाजी मसाला' },
    short: { en: 'Light, balanced masala for daily dry vegetables.', hi: 'रोज़ की सूखी सब्ज़ियों के लिए हल्का, संतुलित मसाला।', mr: 'रोजच्या सुक्या भाज्यांसाठी हलका, संतुलित मसाला.' },
    packs: packs([50, 100, 200], 70, 10, 16), ingredients: ['coriander', 'cumin', 'turmeric', 'redChilli', 'amchur', 'fennel', 'fenugreek', 'asafoetida'],
    dishes: ['vegetables'], rating: 4.5, reviews: 460, popularity: 66, createdAt: '2026-09-01', isNew: true, heat: 2, tags: ['bhaji', 'vegetable'] },

  // ─── Maharashtrian ──────────────────────────────────────────────
  { id: 'p17', slug: 'kanda-lasun-masala', category: 'maharashtrian', type: 'blend', region: 'maharashtra', color: ['#A92324', '#28231F'],
    name: { en: 'Kanda Lasun Masala', hi: 'कांदा लहसुन मसाला', mr: 'कांदा लसूण मसाला' },
    short: { en: 'Fiery Kolhapur-style onion-garlic chilli masala.', hi: 'तीखा कोल्हापुरी प्याज़-लहसुन मिर्च मसाला।', mr: 'झणझणीत कोल्हापुरी कांदा-लसूण तिखट.' },
    packs: packs([100, 200, 500], 88, 12, 17), ingredients: ['redChilli', 'onion', 'garlic', 'dryCoconut', 'coriander', 'sesame', 'cumin', 'clove', 'cinnamon', 'stoneFlower', 'salt'],
    dishes: ['misal', 'chickenCurry', 'vegetables'], rating: 4.9, reviews: 2380, popularity: 97, createdAt: '2025-01-08', bestseller: true, heat: 5, tags: ['kolhapuri', 'lasun', 'kanda lasun'] },
  { id: 'p18', slug: 'goda-masala', category: 'maharashtrian', type: 'blend', region: 'maharashtra', color: ['#4A3426', '#E5A52B'],
    name: { en: 'Goda Masala', hi: 'गोडा मसाला', mr: 'गोडा मसाला' },
    short: { en: 'Sweet-smoky Brahmin-style blend for amti and bhaat.', hi: 'आमटी और भात के लिए मीठा-धुएँदार पारंपरिक मिश्रण।', mr: 'आमटी आणि भातासाठी गोडसर-खमंग पारंपरिक मसाला.' },
    packs: packs([50, 100, 200], 92, 10, 18), ingredients: ['coriander', 'dryCoconut', 'sesame', 'stoneFlower', 'clove', 'cinnamon', 'blackPepper', 'bayLeaf', 'cumin', 'asafoetida'],
    dishes: ['dal', 'vegetables'], rating: 4.8, reviews: 1210, popularity: 86, createdAt: '2025-01-18', bestseller: true, heat: 1, tags: ['kala masala', 'puneri'] },
  { id: 'p19', slug: 'misal-masala', category: 'maharashtrian', type: 'blend', region: 'maharashtra', color: ['#C0392B', '#E5A52B'],
    name: { en: 'Misal Masala', hi: 'मिसल मसाला', mr: 'मिसळ मसाला' },
    short: { en: 'For that red, oily, soul-warming kat of Puneri misal.', hi: 'पुणेरी मिसल के लाल, तेज़ कट के लिए।', mr: 'पुणेरी मिसळीच्या लालभडक, झणझणीत कटासाठी.' },
    packs: packs([50, 100, 200], 90, 10, 19), ingredients: ['redChilli', 'dryCoconut', 'coriander', 'clove', 'cinnamon', 'blackPepper', 'garlic', 'onion', 'stoneFlower'],
    dishes: ['misal'], rating: 4.8, reviews: 980, popularity: 84, createdAt: '2025-02-12', heat: 4, tags: ['misal pav', 'usal'] },
  { id: 'p20', slug: 'kala-masala', category: 'maharashtrian', type: 'blend', region: 'maharashtra', color: ['#28231F', '#A92324'],
    name: { en: 'Sp. Gharguti Kala Masala', hi: 'स्पेशल घरेलू काला मसाला', mr: 'स्पेशल घरगुती काळा मसाला' },
    short: { en: 'Dark-roasted Khandeshi masala, intensely aromatic.', hi: 'गहरा भुना खानदेशी मसाला, तेज़ खुशबू वाला।', mr: 'खोल भाजलेला खान्देशी मसाला, तीव्र सुगंधी.' },
    packs: packs([50, 100, 200], 96, 10, 20), ingredients: ['coriander', 'dryCoconut', 'sesame', 'redChilli', 'clove', 'cinnamon', 'stoneFlower', 'blackPepper', 'cumin'],
    dishes: ['vegetables', 'chickenCurry', 'dal'], rating: 4.7, reviews: 540, popularity: 70, createdAt: '2025-04-01', heat: 3, tags: ['khandeshi', 'kaala'] },
  { id: 'p21', slug: 'kolhapuri-masala', category: 'maharashtrian', type: 'blend', region: 'maharashtra', color: ['#8B1C1D', '#E5A52B'],
    name: { en: 'Kolhapuri Masala', hi: 'कोल्हापुरी मसाला', mr: 'कोल्हापुरी मसाला' },
    short: { en: 'For tambda-pandhra rassa and spicy Kolhapuri curries.', hi: 'तांबडा-पांढरा रस्सा और तीखी कोल्हापुरी करी के लिए।', mr: 'तांबडा-पांढरा रस्सा आणि झणझणीत कोल्हापुरी करीसाठी.' },
    packs: packs([50, 100, 200], 94, 10, 21), ingredients: ['redChilli', 'dryCoconut', 'sesame', 'coriander', 'garlic', 'onion', 'clove', 'cinnamon', 'stoneFlower', 'poppySeed'],
    dishes: ['chickenCurry', 'vegetables', 'paneer'], rating: 4.8, reviews: 860, popularity: 82, createdAt: '2025-03-10', heat: 5, tags: ['tambda rassa'] },
  { id: 'p22', slug: 'pav-bhaji-masala', category: 'maharashtrian', type: 'blend', region: 'maharashtra', color: ['#D9502A', '#E5A52B'],
    name: { en: 'Pav Bhaji Masala', hi: 'पाव भाजी मसाला', mr: 'पावभाजी मसाला' },
    short: { en: 'Mumbai street-style bhaji with buttery depth.', hi: 'मुंबई स्ट्रीट-स्टाइल भाजी, मक्खन जैसी गहराई के साथ।', mr: 'मुंबई स्ट्रीट-स्टाइल भाजी, लोण्यासारख्या चवीसह.' },
    packs: packs([50, 100, 200], 86, 10, 22), ingredients: ['kashmiriChilli', 'coriander', 'cumin', 'fennel', 'amchur', 'blackPepper', 'clove', 'cinnamon', 'blackSalt', 'cardamom'],
    dishes: ['pavBhaji', 'snacks'], rating: 4.9, reviews: 2650, popularity: 96, createdAt: '2025-01-09', bestseller: true, heat: 2, tags: ['pavbhaji', 'mumbai'] },
  { id: 'p23', slug: 'malvani-masala', category: 'maharashtrian', type: 'blend', region: 'maharashtra', color: ['#9E2B25', '#315C3B'],
    name: { en: 'Malvani Masala', hi: 'मालवणी मसाला', mr: 'मालवणी मसाला' },
    short: { en: 'Coastal Konkan blend for fish, chicken and vade.', hi: 'मछली, चिकन और वडे के लिए कोंकणी तटीय मिश्रण।', mr: 'मासे, चिकन आणि वड्यांसाठी कोकणी किनारपट्टीचा मसाला.' },
    packs: packs([50, 100, 200], 99, 10, 23), ingredients: ['redChilli', 'coriander', 'blackPepper', 'clove', 'cinnamon', 'fennel', 'nutmeg', 'mace', 'starAnise', 'turmeric'],
    dishes: ['chickenCurry'], rating: 4.7, reviews: 388, popularity: 64, createdAt: '2026-09-20', isNew: true, heat: 4, tags: ['konkan', 'fish', 'malwani'] },

  // ─── South Indian ───────────────────────────────────────────────
  { id: 'p24', slug: 'sambhar-masala', category: 'south-indian', type: 'blend', region: 'south', color: ['#B5541E', '#315C3B'],
    name: { en: 'Sambar Masala', hi: 'सांबर मसाला', mr: 'सांबार मसाला' },
    short: { en: 'Temple-style sambhar with roasted dals and curry leaves.', hi: 'भुनी दालों और करी पत्तों वाला मंदिर-शैली सांभर।', mr: 'भाजलेल्या डाळी आणि कढीपत्त्यासह मंदिर-शैली सांबार.' },
    packs: packs([50, 100, 200, 500], 78, 10, 24), ingredients: ['coriander', 'redChilli', 'chanaDal', 'uradDal', 'fenugreek', 'cumin', 'blackPepper', 'curryLeaves', 'asafoetida', 'turmeric'],
    dishes: ['dal', 'vegetables'], rating: 4.8, reviews: 1720, popularity: 91, createdAt: '2025-01-14', bestseller: true, heat: 2, tags: ['sambar'] },
  { id: 'p25', slug: 'rasam-powder', category: 'south-indian', type: 'blend', region: 'south', color: ['#C2462B', '#E5A52B'],
    name: { en: 'Rasam Powder', hi: 'रसम पाउडर', mr: 'रसम पावडर' },
    short: { en: 'Peppery, tangy rasam that soothes like home.', hi: 'घर जैसी राहत देने वाला कालीमिर्च और खट्टा रसम।', mr: 'घरच्यासारखा दिलासा देणारा मिरीदार, आंबट रसम.' },
    packs: packs([50, 100, 200], 82, 10, 25), ingredients: ['blackPepper', 'cumin', 'coriander', 'redChilli', 'toorDal', 'curryLeaves', 'asafoetida', 'turmeric'],
    dishes: ['dal'], rating: 4.7, reviews: 640, popularity: 72, createdAt: '2025-02-25', heat: 3, tags: ['saaru'] },
  { id: 'p26', slug: 'biryani-masala', category: 'south-indian', type: 'blend', region: 'south', color: ['#6E3B1F', '#E5A52B'],
    name: { en: 'Biryani Masala', hi: 'बिरयानी मसाला', mr: 'बिर्याणी मसाला' },
    short: { en: 'Fragrant dum-style blend with mace, star anise and rose.', hi: 'जावित्री, चक्रफूल और गुलाब के साथ खुशबूदार दम मिश्रण।', mr: 'जायपत्री, चक्रीफूल आणि गुलाबासह सुगंधी दम मसाला.' },
    packs: packs([50, 100, 200], 110, 12, 26), ingredients: ['coriander', 'redChilli', 'cardamom', 'blackCardamom', 'clove', 'cinnamon', 'starAnise', 'mace', 'nutmeg', 'bayLeaf', 'fennel', 'shahJeera', 'rosePetal'],
    dishes: ['biryani'], rating: 4.9, reviews: 2210, popularity: 94, createdAt: '2025-01-11', bestseller: true, heat: 3, tags: ['pulao', 'dum'] },
  { id: 'p27', slug: 'chettinad-masala', category: 'south-indian', type: 'blend', region: 'south', color: ['#7A2E1E', '#E5A52B'],
    name: { en: 'Chettinad Masala', hi: 'चेट्टिनाड मसाला', mr: 'चेट्टिनाड मसाला' },
    short: { en: 'Peppery Karaikudi blend with kalpasi and star anise.', hi: 'कल्पासी और चक्रफूल के साथ तेज़ करईकुडी मिश्रण।', mr: 'दगडफूल आणि चक्रीफुलासह मिरीदार कराईकुडी मसाला.' },
    packs: packs([50, 100], 105, 10, 27), ingredients: ['blackPepper', 'redChilli', 'coriander', 'fennel', 'stoneFlower', 'starAnise', 'dryCoconut', 'curryLeaves', 'clove'],
    dishes: ['chickenCurry', 'vegetables'], rating: 4.6, reviews: 298, popularity: 60, createdAt: '2026-10-05', isNew: true, heat: 4, tags: ['tamil'] },

  // ─── North Indian ───────────────────────────────────────────────
  { id: 'p28', slug: 'chole-masala', category: 'north-indian', type: 'blend', region: 'north', color: ['#5A2A1C', '#E5A52B'],
    name: { en: 'Chhole Masala', hi: 'छोले मसाला', mr: 'छोले मसाला' },
    short: { en: 'Dark, tangy Amritsari chole with anardana.', hi: 'अनारदाना के साथ गहरे, खट्टे अमृतसरी छोले।', mr: 'अनारदाण्यासह गडद, आंबट अमृतसरी छोले.' },
    packs: packs([50, 100, 200], 88, 10, 28), ingredients: ['coriander', 'pomegranateSeed', 'amchur', 'redChilli', 'cumin', 'blackPepper', 'blackCardamom', 'clove', 'cinnamon', 'bayLeaf', 'dryGinger', 'blackSalt'],
    dishes: ['dal', 'snacks'], rating: 4.8, reviews: 1655, popularity: 90, createdAt: '2025-01-16', bestseller: true, heat: 3, tags: ['chana', 'chhole', 'amritsari'] },
  { id: 'p29', slug: 'rajma-masala', category: 'north-indian', type: 'blend', region: 'north', color: ['#7B1F22', '#FFF8ED'],
    name: { en: 'Rajma Masala', hi: 'राजमा मसाला', mr: 'राजमा मसाला' },
    short: { en: 'Comforting Punjabi rajma for Sunday rajma-chawal.', hi: 'रविवार के राजमा-चावल के लिए पंजाबी राजमा मसाला।', mr: 'रविवारच्या राजमा-भातासाठी पंजाबी राजमा मसाला.' },
    packs: packs([50, 100, 200], 84, 10, 29), ingredients: ['coriander', 'redChilli', 'cumin', 'kasuriMethi', 'dryGinger', 'blackPepper', 'clove', 'cinnamon', 'bayLeaf', 'turmeric'],
    dishes: ['dal'], rating: 4.7, reviews: 820, popularity: 78, createdAt: '2025-02-05', heat: 2, tags: ['kidney beans'] },
  { id: 'p30', slug: 'paneer-masala', category: 'north-indian', type: 'blend', region: 'north', color: ['#C46A1F', '#A92324'],
    name: { en: 'Paneer Masala', hi: 'पनीर मसाला', mr: 'पनीर मसाला' },
    short: { en: 'Rich, mildly sweet blend for creamy paneer gravies.', hi: 'मलाईदार पनीर ग्रेवी के लिए समृद्ध, हल्का मीठा मसाला।', mr: 'मलईदार पनीर ग्रेव्हीसाठी समृद्ध, किंचित गोड मसाला.' },
    packs: packs([50, 100, 200], 92, 10, 30), ingredients: ['kashmiriChilli', 'coriander', 'kasuriMethi', 'cashew', 'cardamom', 'cumin', 'fennel', 'dryGinger', 'clove', 'cinnamon'],
    dishes: ['paneer', 'vegetables'], rating: 4.8, reviews: 1430, popularity: 88, createdAt: '2025-01-22', bestseller: true, heat: 2, tags: ['shahi paneer', 'kadai'] },
  { id: 'p31', slug: 'tandoori-masala', category: 'north-indian', type: 'blend', region: 'north', color: ['#B42A1E', '#E5A52B'],
    name: { en: 'Tandoori Masala', hi: 'तंदूरी मसाला', mr: 'तंदुरी मसाला' },
    short: { en: 'Smoky, vibrant marinade for tikkas and grills.', hi: 'टिक्का और ग्रिल के लिए धुएँदार, चटक मैरिनेड।', mr: 'टिक्का आणि ग्रिलसाठी धुरकट, रंगतदार मॅरिनेड.' },
    packs: packs([50, 100, 200], 90, 10, 31), ingredients: ['kashmiriChilli', 'coriander', 'cumin', 'garlic', 'dryGinger', 'kasuriMethi', 'blackPepper', 'clove', 'cinnamon', 'mace', 'salt'],
    dishes: ['paneer', 'chickenCurry', 'snacks'], rating: 4.7, reviews: 990, popularity: 81, createdAt: '2025-02-28', heat: 3, tags: ['tikka', 'bbq', 'grill'] },
  { id: 'p32', slug: 'dal-makhani-masala', category: 'north-indian', type: 'blend', region: 'north', color: ['#3F2A20', '#E5A52B'],
    name: { en: 'Dal Makhani Masala', hi: 'दाल मखनी मसाला', mr: 'दाल मखनी मसाला' },
    short: { en: 'Buttery, slow-simmered dhaba dal in a spoon.', hi: 'मक्खनी, धीमी आँच पर पकी ढाबा दाल का स्वाद।', mr: 'लोण्यासारखी, मंद आचेवर शिजलेली ढाबा डाळ.' },
    packs: packs([50, 100], 96, 10, 32), ingredients: ['kashmiriChilli', 'coriander', 'cumin', 'kasuriMethi', 'dryGinger', 'garlic', 'blackCardamom', 'clove', 'cinnamon'],
    dishes: ['dal'], rating: 4.6, reviews: 312, popularity: 62, createdAt: '2026-10-18', isNew: true, heat: 2, tags: ['makhni', 'black dal'] },

  // ─── Instant mixes ──────────────────────────────────────────────
  { id: 'p33', slug: 'pani-puri-masala', category: 'instant-mixes', type: 'mix', region: 'pan-india', color: ['#315C3B', '#A92324'],
    name: { en: 'Pani Puri Masala', hi: 'पानी पूरी मसाला', mr: 'पाणीपुरी मसाला' },
    short: { en: 'Just add water — tangy, minty street-style pani.', hi: 'बस पानी मिलाएँ — खट्टा, पुदीने वाला स्ट्रीट-स्टाइल पानी।', mr: 'फक्त पाणी घाला — आंबट, पुदिन्याचे स्ट्रीट-स्टाइल पाणी.' },
    packs: packs([50, 100], 80, 10, 33), ingredients: ['mint', 'blackSalt', 'cumin', 'amchur', 'blackPepper', 'dryGinger', 'redChilli', 'tamarind'],
    dishes: ['snacks'], rating: 4.7, reviews: 1180, popularity: 85, createdAt: '2025-03-20', bestseller: true, heat: 2, tags: ['golgappa', 'puchka'] },
  { id: 'p34', slug: 'jaljeera-mix', category: 'instant-mixes', type: 'mix', region: 'north', color: ['#2F6B4A', '#E5A52B'],
    name: { en: 'Jaljeera Mix', hi: 'जलजीरा मिक्स', mr: 'जलजीरा मिक्स' },
    short: { en: 'Cooling cumin-mint summer drink in seconds.', hi: 'सेकंडों में ठंडक देने वाला जीरा-पुदीना पेय।', mr: 'काही सेकंदांत थंडावा देणारे जिरे-पुदिना पेय.' },
    packs: packs([50, 100, 200], 70, 10, 34), ingredients: ['cumin', 'mint', 'blackSalt', 'amchur', 'blackPepper', 'dryGinger', 'sugar'],
    dishes: ['snacks'], rating: 4.5, reviews: 402, popularity: 60, createdAt: '2026-07-02', isNew: true, heat: 1, tags: ['drink', 'summer'] },
  { id: 'p35', slug: 'chai-masala', category: 'instant-mixes', type: 'mix', region: 'pan-india', color: ['#7A4A2A', '#E5A52B'],
    name: { en: 'Chai Masala', hi: 'चाय मसाला', mr: 'चहा मसाला' },
    short: { en: 'Ginger, cardamom and clove for the perfect cutting chai.', hi: 'परफ़ेक्ट कटिंग चाय के लिए अदरक, इलायची और लौंग।', mr: 'परफेक्ट कटिंग चहासाठी सुंठ, वेलची आणि लवंग.' },
    packs: packs([25, 50, 100], 150, 10, 35), ingredients: ['dryGinger', 'cardamom', 'clove', 'cinnamon', 'blackPepper', 'nutmeg'],
    dishes: ['snacks'], rating: 4.9, reviews: 1950, popularity: 93, createdAt: '2025-01-30', bestseller: true, heat: 1, tags: ['tea', 'chaha', 'chai'] },

  // ─── Ready-to-cook ──────────────────────────────────────────────
  { id: 'p36', slug: 'paneer-butter-masala-mix', category: 'ready-to-cook', type: 'mix', region: 'north', color: ['#D2691E', '#FFF8ED'],
    name: { en: 'Paneer Butter Masala Mix', hi: 'पनीर बटर मसाला मिक्स', mr: 'पनीर बटर मसाला मिक्स' },
    short: { en: 'Restaurant-style makhani gravy in 15 minutes.', hi: '15 मिनट में रेस्टोरेंट जैसी मखनी ग्रेवी।', mr: '15 मिनिटांत हॉटेलसारखी मखनी ग्रेव्ही.' },
    packs: packs([50, 100, 200], 120, 15, 36), ingredients: ['tomato', 'cashew', 'kashmiriChilli', 'kasuriMethi', 'sugar', 'salt', 'garlic', 'dryGinger', 'cardamom'],
    dishes: ['paneer'], rating: 4.6, reviews: 720, popularity: 77, createdAt: '2026-08-28', isNew: true, heat: 1, tags: ['makhani', 'gravy', 'butter'] },
  { id: 'p37', slug: 'instant-sambhar-mix', category: 'ready-to-cook', type: 'mix', region: 'south', color: ['#C77A2A', '#315C3B'],
    name: { en: 'Instant Sambhar Mix', hi: 'इंस्टेंट सांभर मिक्स', mr: 'इन्स्टंट सांबार मिक्स' },
    short: { en: 'Dal, tamarind and masala in one — ready in 10 minutes.', hi: 'दाल, इमली और मसाला एक साथ — 10 मिनट में तैयार।', mr: 'डाळ, चिंच आणि मसाला एकत्र — 10 मिनिटांत तयार.' },
    packs: packs([100, 200], 75, 12, 37), ingredients: ['toorDal', 'tamarind', 'coriander', 'redChilli', 'fenugreek', 'curryLeaves', 'asafoetida', 'turmeric', 'salt'],
    dishes: ['dal'], rating: 4.4, reviews: 280, popularity: 57, createdAt: '2026-10-22', isNew: true, heat: 2, tags: ['sambar'] },
  { id: 'p38', slug: 'misal-ready-to-cook-kit', category: 'ready-to-cook', type: 'mix', region: 'maharashtra', color: ['#A92324', '#FFF8ED'],
    name: { en: 'Misal Ready-to-Cook Kit', hi: 'मिसल रेडी-टू-कुक किट', mr: 'मिसळ रेडी-टू-कुक किट' },
    short: { en: 'Kat masala + sprouts seasoning for 4 servings.', hi: '4 सर्विंग के लिए कट मसाला + अंकुरित दाल का मसाला।', mr: '4 जणांसाठी कट मसाला + उसळ मसाला.' },
    packs: packs([100, 200], 110, 10, 38), ingredients: ['redChilli', 'dryCoconut', 'onion', 'garlic', 'coriander', 'clove', 'cinnamon', 'salt'],
    dishes: ['misal'], rating: 4.6, reviews: 214, popularity: 59, createdAt: '2026-10-28', isNew: true, heat: 4, tags: ['misal pav', 'kit'] },

  // ─── Combo packs ────────────────────────────────────────────────
  { id: 'p39', slug: 'maharashtrian-kitchen-combo', category: 'combo-packs', type: 'combo', region: 'maharashtra', color: ['#A92324', '#E5A52B'],
    name: { en: 'Maharashtrian Kitchen Combo', hi: 'महाराष्ट्रीयन किचन कॉम्बो', mr: 'महाराष्ट्रीय किचन कॉम्बो' },
    short: { en: 'Kanda Lasun + Goda + Misal + Pav Bhaji (100g each).', hi: 'कांदा लहसुन + गोडा + मिसल + पाव भाजी (हर एक 100 ग्राम)।', mr: 'कांदा लसूण + गोडा + मिसळ + पावभाजी (प्रत्येकी 100 ग्रॅ).' },
    packs: [{ size: '4 × 100g', grams: 400, price: 349, mrp: 420, stock: 60 }], includes: ['p17', 'p18', 'p19', 'p22'], ingredients: [], dishes: ['misal', 'pavBhaji', 'dal'],
    rating: 4.9, reviews: 640, popularity: 87, createdAt: '2025-05-01', bestseller: true, heat: 3, tags: ['gift', 'combo'] },
  { id: 'p40', slug: 'north-indian-essentials-combo', category: 'combo-packs', type: 'combo', region: 'north', color: ['#5A2A1C', '#E5A52B'],
    name: { en: 'North Indian Essentials Combo', hi: 'उत्तर भारतीय एसेंशियल्स कॉम्बो', mr: 'उत्तर भारतीय एसेन्शियल्स कॉम्बो' },
    short: { en: 'Garam + Chole + Rajma + Paneer Masala (100g each).', hi: 'गरम + छोले + राजमा + पनीर मसाला (हर एक 100 ग्राम)।', mr: 'गरम + छोले + राजमा + पनीर मसाला (प्रत्येकी 100 ग्रॅ).' },
    packs: [{ size: '4 × 100g', grams: 400, price: 359, mrp: 440, stock: 45 }], includes: ['p11', 'p28', 'p29', 'p30'], ingredients: [], dishes: ['paneer', 'dal', 'chickenCurry'],
    rating: 4.8, reviews: 512, popularity: 83, createdAt: '2025-05-10', heat: 2, tags: ['gift', 'combo', 'punjabi'] },
  { id: 'p41', slug: 'everyday-pure-spices-combo', category: 'combo-packs', type: 'combo', region: 'pan-india', color: ['#E5A52B', '#315C3B'],
    name: { en: 'Everyday Pure Spices Combo', hi: 'रोज़मर्रा शुद्ध मसाले कॉम्बो', mr: 'रोजचे शुद्ध मसाले कॉम्बो' },
    short: { en: 'Haldi + Mirch + Dhaniya + Jeera (200g each).', hi: 'हल्दी + मिर्च + धनिया + जीरा (हर एक 200 ग्राम)।', mr: 'हळद + तिखट + धणे + जिरे (प्रत्येकी 200 ग्रॅ).' },
    packs: [{ size: '4 × 200g', grams: 800, price: 399, mrp: 480, stock: 80 }], includes: ['p01', 'p02', 'p04', 'p05'], ingredients: [], dishes: ['dal', 'vegetables', 'chickenCurry'],
    rating: 4.8, reviews: 890, popularity: 89, createdAt: '2025-04-20', bestseller: true, heat: 2, tags: ['basic', 'combo', 'starter'] },
  { id: 'p42', slug: 'festive-gift-box', category: 'combo-packs', type: 'combo', region: 'pan-india', color: ['#8B1C1D', '#E5A52B'],
    name: { en: 'Festive Masala Gift Box', hi: 'त्योहारी मसाला गिफ़्ट बॉक्स', mr: 'सणासुदीचा मसाला गिफ्ट बॉक्स' },
    short: { en: 'Six bestsellers in a keepsake box — made for gifting.', hi: 'यादगार बॉक्स में छह बेस्टसेलर — उपहार के लिए।', mr: 'आठवणीच्या बॉक्समध्ये सहा बेस्टसेलर — भेट देण्यासाठी.' },
    packs: [{ size: '6 × 100g', grams: 600, price: 549, mrp: 699, stock: 30 }], includes: ['p11', 'p17', 'p22', 'p26', 'p13', 'p35'], ingredients: [], dishes: ['biryani', 'pavBhaji', 'snacks'],
    rating: 4.9, reviews: 302, popularity: 80, createdAt: '2026-10-01', isNew: true, heat: 2, tags: ['diwali', 'gift', 'combo', 'festival'] },
  // ─── From the Saanvi pack range ─────────────────────────────────
  { id: 'p43', slug: 'swad-chilli-powder', category: 'pure-spices', type: 'powder', region: 'pan-india', color: ['#C8202B', '#F0A830'],
    name: { en: 'Swad Chilli Powder (Stemless)', hi: 'स्वाद मिर्ची पाउडर (डंठल रहित)', mr: 'स्वाद मिरची पावडर (डंकी कट)' },
    short: { en: 'Stemless chillies, ground for bright colour and balanced heat.', hi: 'डंठल रहित मिर्च, चटक रंग और संतुलित तीखेपन के लिए पिसी।', mr: 'देठ काढलेल्या मिरच्या, उजळ रंग आणि संतुलित तिखटपणासाठी दळलेल्या.' },
    packs: packs([100, 200, 500], 52, 10, 43), ingredients: ['redChilli'], dishes: ['chickenCurry', 'vegetables', 'dal', 'misal'],
    rating: 4.7, reviews: 640, popularity: 84, createdAt: '2026-08-25', isNew: true, heat: 3, tags: ['mirchi', 'swad', 'tikhat', 'stemless'] },
  { id: 'p44', slug: 'byadgi-mirchi-powder', category: 'pure-spices', type: 'powder', region: 'south', color: ['#9E1B1F', '#F0A830'],
    name: { en: 'Byadgi Mirchi Powder (Stemless)', hi: 'ब्याडगी मिर्ची पाउडर (डंठल रहित)', mr: 'ब्याडगी मिरची पावडर (डंकी कट)' },
    short: { en: 'Deep-red Byadgi chillies — rich colour with gentle heat.', hi: 'गहरी लाल ब्याडगी मिर्च — भरपूर रंग, हल्का तीखापन।', mr: 'गडद लाल ब्याडगी मिरची — भरपूर रंग, सौम्य तिखटपणा.' },
    packs: packs([100, 200, 500], 72, 10, 44), ingredients: ['redChilli'], dishes: ['chickenCurry', 'paneer', 'pavBhaji', 'snacks'],
    rating: 4.8, reviews: 410, popularity: 82, createdAt: '2026-08-25', isNew: true, heat: 2, tags: ['byadgi', 'bedgi', 'mirchi', 'stemless'] },
];

export const defaultProducts = raw.map((p) => ({
  sku: `RR-${p.id.toUpperCase()}`,
  images: [],
  isNew: false,
  bestseller: false,
  active: true,
  festivals: [],
  ...p,
}));

/** Festival tagging (used by Festival Specials sections). */
const FESTIVAL_MAP = {
  diwali: ['p42', 'p11', 'p26', 'p35', 'p08', 'p40'],
  ganesh: ['p18', 'p39', 'p08', 'p20', 'p35'],
  gudipadwa: ['p18', 'p20', 'p39', 'p01', 'p09'],
  holi: ['p34', 'p33', 'p13', 'p35', 'p22'],
  navratri: ['p09', 'p05', 'p13', 'p08', 'p35'],
};
export const festivals = [
  { id: 'diwali', slug: 'diwali', color: '#A92324', name: { en: 'Diwali', hi: 'दिवाली', mr: 'दिवाळी' }, products: FESTIVAL_MAP.diwali, coupon: 'FESTIVE15' },
  { id: 'ganesh', slug: 'ganesh-chaturthi', color: '#E5A52B', name: { en: 'Ganesh Chaturthi', hi: 'गणेश चतुर्थी', mr: 'गणेश चतुर्थी' }, products: FESTIVAL_MAP.ganesh, coupon: 'FESTIVE15' },
  { id: 'gudipadwa', slug: 'gudi-padwa', color: '#315C3B', name: { en: 'Gudi Padwa', hi: 'गुड़ी पड़वा', mr: 'गुढीपाडवा' }, products: FESTIVAL_MAP.gudipadwa, coupon: 'WELCOME10' },
  { id: 'holi', slug: 'holi', color: '#C2462B', name: { en: 'Holi', hi: 'होली', mr: 'होळी' }, products: FESTIVAL_MAP.holi, coupon: 'SPICE20' },
  { id: 'navratri', slug: 'navratri', color: '#8B1C1D', name: { en: 'Navratri', hi: 'नवरात्रि', mr: 'नवरात्र' }, products: FESTIVAL_MAP.navratri, coupon: 'FESTIVE15' },
];

/** Spice Finder: what are you cooking → dish key used in product.dishes */
/** Festival → recipe ids (Festival pages). */
export const festivalRecipes = { diwali: ['r09', 'r06'], ganesh: ['r10', 'r03'], gudipadwa: ['r10', 'r01'], holi: ['r11', 'r12'], navratri: ['r03', 'r11'] };

export const spiceFinderOptions = ['paneer', 'biryani', 'pavBhaji', 'misal', 'dal', 'chickenCurry', 'vegetables', 'snacks'];

export const popularSearches = ['Garam Masala', 'Kanda Lasun', 'Pav Bhaji', 'Biryani', 'Turmeric', 'Chai Masala'];
