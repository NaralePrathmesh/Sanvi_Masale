/**
 * DEMO RECIPES. `products` lists the masala product ids used (Cook & Shop).
 * `image` → set a real path (e.g. '/images/recipes/misal.jpg'); null shows an illustration.
 * `art` sets the colours of the placeholder dish illustration.
 */
export const recipeCategories = ['breakfast', 'lunch', 'dinner', 'snacks', 'maharashtrian', 'punjabi', 'south-indian', 'festival'];

export const recipes = [
  {
    id: 'r01', slug: 'puneri-misal-pav', categories: ['breakfast', 'maharashtrian'], prep: 20, cook: 30, difficulty: 'medium', serves: 4,
    products: ['p19', 'p17', 'p01'], art: { curry: '#C0392B', garnish: '#E5A52B', bowl: '#5A3A28' }, image: null,
    name: { en: 'Puneri Misal Pav', hi: 'पुणेरी मिसल पाव', mr: 'पुणेरी मिसळ पाव' },
    desc: { en: 'Spicy sprouted moth usal topped with fiery kat, farsan and onions.', hi: 'तीखी अंकुरित मटकी उसल, ऊपर से तेज़ कट, फरसाण और प्याज़।', mr: 'झणझणीत मोड आलेल्या मटकीची उसळ, वरून तर्री, फरसाण आणि कांदा.' },
    ingredients: {
      en: ['2 cups sprouted moth beans', '2 onions, chopped', '2 tomatoes, chopped', '2 tbsp Misal Masala', '1 tbsp Kanda Lasun Masala', '½ tsp turmeric', 'Farsan, lemon, coriander, pav to serve'],
      hi: ['2 कप अंकुरित मटकी', '2 प्याज़, कटे हुए', '2 टमाटर, कटे हुए', '2 बड़े चम्मच मिसल मसाला', '1 बड़ा चम्मच कांदा लहसुन मसाला', '½ छोटा चम्मच हल्दी', 'परोसने के लिए फरसाण, नींबू, धनिया, पाव'],
      mr: ['2 वाट्या मोड आलेली मटकी', '2 कांदे, चिरलेले', '2 टोमॅटो, चिरलेले', '2 मोठे चमचे मिसळ मसाला', '1 मोठा चमचा कांदा लसूण मसाला', '½ लहान चमचा हळद', 'वाढण्यासाठी फरसाण, लिंबू, कोथिंबीर, पाव'],
    },
    steps: {
      en: ['Pressure-cook the sprouts with turmeric and salt for 2 whistles.', 'Sauté onions till golden, add tomatoes and cook till soft.', 'Add Misal Masala and Kanda Lasun Masala; roast for a minute in oil.', 'Add cooked sprouts and 3 cups water; simmer 10 minutes to form the kat (tarri).', 'Serve in a bowl topped with farsan, onion, coriander and lemon, with pav.'],
      hi: ['मटकी को हल्दी और नमक के साथ 2 सीटी तक प्रेशर कुक करें।', 'प्याज़ को सुनहरा भूनें, टमाटर डालकर नरम होने तक पकाएँ।', 'मिसल मसाला और कांदा लहसुन मसाला डालकर तेल में एक मिनट भूनें।', 'पकी मटकी और 3 कप पानी डालें; 10 मिनट उबालकर कट (तर्री) बनाएँ।', 'कटोरी में फरसाण, प्याज़, धनिया और नींबू डालकर पाव के साथ परोसें।'],
      mr: ['मटकी हळद आणि मीठ घालून 2 शिट्ट्या कुकरमध्ये शिजवा.', 'कांदा सोनेरी परता, टोमॅटो घालून मऊ होईपर्यंत शिजवा.', 'मिसळ मसाला आणि कांदा लसूण मसाला घालून तेलात एक मिनिट परता.', 'शिजलेली मटकी आणि 3 वाट्या पाणी घाला; 10 मिनिटे उकळून तर्री तयार करा.', 'वाटीत फरसाण, कांदा, कोथिंबीर आणि लिंबू घालून पावासोबत वाढा.'],
    },
  },
  {
    id: 'r02', slug: 'mumbai-pav-bhaji', categories: ['snacks', 'dinner', 'maharashtrian'], prep: 15, cook: 30, difficulty: 'easy', serves: 4,
    products: ['p22', 'p03'], art: { curry: '#D9502A', garnish: '#315C3B', bowl: '#9AA0A6' }, image: null,
    name: { en: 'Mumbai Pav Bhaji', hi: 'मुंबई पाव भाजी', mr: 'मुंबई पावभाजी' },
    desc: { en: 'Buttery mashed vegetable bhaji with toasted pav — straight from Juhu beach.', hi: 'मक्खन वाली मसली सब्ज़ियों की भाजी और सिके पाव — सीधे जुहू बीच से।', mr: 'लोणी घातलेली स्मॅश केलेल्या भाज्यांची भाजी आणि भाजलेले पाव — थेट जुहू चौपाटीवरून.' },
    ingredients: {
      en: ['3 potatoes, boiled', '1 cup cauliflower & peas, boiled', '1 capsicum, chopped', '3 tomatoes, chopped', '2½ tbsp Pav Bhaji Masala', '1 tsp Kashmiri Chilli Powder', '3 tbsp butter, pav, lemon'],
      hi: ['3 आलू, उबले', '1 कप गोभी और मटर, उबले', '1 शिमला मिर्च, कटी', '3 टमाटर, कटे', '2½ बड़े चम्मच पाव भाजी मसाला', '1 छोटा चम्मच कश्मीरी मिर्च', '3 बड़े चम्मच मक्खन, पाव, नींबू'],
      mr: ['3 बटाटे, उकडलेले', '1 वाटी फ्लॉवर आणि मटार, उकडलेले', '1 ढोबळी मिरची, चिरलेली', '3 टोमॅटो, चिरलेले', '2½ मोठे चमचे पावभाजी मसाला', '1 लहान चमचा काश्मिरी मिरची', '3 मोठे चमचे लोणी, पाव, लिंबू'],
    },
    steps: {
      en: ['Melt butter on a tawa, sauté capsicum and tomatoes until mushy.', 'Add Pav Bhaji Masala and Kashmiri chilli; cook 2 minutes.', 'Add boiled vegetables and mash well with a masher, adding water as needed.', 'Simmer 8–10 minutes; finish with butter and lemon.', 'Toast pav in butter with a pinch of masala and serve hot.'],
      hi: ['तवे पर मक्खन पिघलाएँ, शिमला मिर्च और टमाटर गलने तक भूनें।', 'पाव भाजी मसाला और कश्मीरी मिर्च डालकर 2 मिनट पकाएँ।', 'उबली सब्ज़ियाँ डालें और ज़रूरत अनुसार पानी डालकर अच्छी तरह मसलें।', '8–10 मिनट पकाएँ; मक्खन और नींबू डालकर पूरा करें।', 'पाव को मक्खन और चुटकी मसाले के साथ सेकें और गरम परोसें।'],
      mr: ['तव्यावर लोणी वितळवा, ढोबळी मिरची आणि टोमॅटो मऊ होईपर्यंत परता.', 'पावभाजी मसाला आणि काश्मिरी मिरची घालून 2 मिनिटे शिजवा.', 'उकडलेल्या भाज्या घाला आणि गरजेनुसार पाणी घालून नीट स्मॅश करा.', '8–10 मिनिटे शिजवा; लोणी आणि लिंबू घालून पूर्ण करा.', 'पाव लोणी आणि चिमूटभर मसाल्यासह भाजून गरम वाढा.'],
    },
  },
  {
    id: 'r03', slug: 'kanda-poha', categories: ['breakfast', 'maharashtrian'], prep: 10, cook: 15, difficulty: 'easy', serves: 3,
    products: ['p01', 'p02', 'p07'], art: { curry: '#E5C04A', garnish: '#315C3B', bowl: '#FFFFFF' }, image: null,
    name: { en: 'Kanda Poha', hi: 'कांदा पोहा', mr: 'कांदे पोहे' },
    desc: { en: 'Soft flattened rice tempered with onion, turmeric and peanuts.', hi: 'प्याज़, हल्दी और मूंगफली के तड़के वाला नरम पोहा।', mr: 'कांदा, हळद आणि शेंगदाण्यांची फोडणी दिलेले मऊ पोहे.' },
    ingredients: {
      en: ['2 cups thick poha', '1 onion, chopped', '¼ cup peanuts', '½ tsp Whole Cumin Seeds', '½ tsp Turmeric Powder', '¼ tsp Red Chilli Powder', 'Curry leaves, lemon, coriander'],
      hi: ['2 कप मोटा पोहा', '1 प्याज़, कटा', '¼ कप मूंगफली', '½ छोटा चम्मच साबुत जीरा', '½ छोटा चम्मच हल्दी पाउडर', '¼ छोटा चम्मच लाल मिर्च पाउडर', 'करी पत्ता, नींबू, धनिया'],
      mr: ['2 वाट्या जाड पोहे', '1 कांदा, चिरलेला', '¼ वाटी शेंगदाणे', '½ लहान चमचा जिरे', '½ लहान चमचा हळद', '¼ लहान चमचा लाल तिखट', 'कढीपत्ता, लिंबू, कोथिंबीर'],
    },
    steps: {
      en: ['Rinse poha, drain and rest for 5 minutes.', 'Fry peanuts in oil; add cumin and curry leaves.', 'Add onion and sauté till translucent; add turmeric and chilli.', 'Fold in poha with salt and a pinch of sugar; cover and steam 2 minutes.', 'Finish with lemon juice and coriander.'],
      hi: ['पोहा धोकर पानी निकाल दें और 5 मिनट रखें।', 'तेल में मूंगफली तलें; जीरा और करी पत्ता डालें।', 'प्याज़ डालकर पारदर्शी होने तक भूनें; हल्दी और मिर्च डालें।', 'नमक और चुटकी भर चीनी के साथ पोहा मिलाएँ; ढककर 2 मिनट भाप दें।', 'नींबू का रस और धनिया डालकर परोसें।'],
      mr: ['पोहे धुऊन निथळून 5 मिनिटे ठेवा.', 'तेलात शेंगदाणे तळा; जिरे आणि कढीपत्ता घाला.', 'कांदा घालून पारदर्शक होईपर्यंत परता; हळद आणि तिखट घाला.', 'मीठ आणि चिमूटभर साखर घालून पोहे मिसळा; झाकून 2 मिनिटे वाफ आणा.', 'लिंबाचा रस आणि कोथिंबीर घालून वाढा.'],
    },
  },
  {
    id: 'r04', slug: 'amritsari-chole', categories: ['lunch', 'punjabi'], prep: 15, cook: 40, difficulty: 'medium', serves: 4,
    products: ['p28', 'p11'], art: { curry: '#5A2A1C', garnish: '#E5A52B', bowl: '#8C6A4A' }, image: null,
    name: { en: 'Amritsari Chole', hi: 'अमृतसरी छोले', mr: 'अमृतसरी छोले' },
    desc: { en: 'Dark, tangy chickpea curry — the star of every Punjabi Sunday.', hi: 'गहरी, खट्टी चने की करी — हर पंजाबी रविवार की शान।', mr: 'गडद, आंबट छोल्यांची करी — प्रत्येक पंजाबी रविवारची शान.' },
    ingredients: {
      en: ['1½ cups kabuli chana, soaked overnight', '2 onions, finely chopped', '2 tomatoes, puréed', '1 tbsp ginger-garlic paste', '2½ tbsp Chole Masala', '½ tsp Garam Masala', '1 tea bag (for colour)'],
      hi: ['1½ कप काबुली चना, रात भर भिगोया', '2 प्याज़, बारीक कटे', '2 टमाटर, प्यूरी', '1 बड़ा चम्मच अदरक-लहसुन पेस्ट', '2½ बड़े चम्मच छोले मसाला', '½ छोटा चम्मच गरम मसाला', '1 टी बैग (रंग के लिए)'],
      mr: ['1½ वाटी काबुली चणे, रात्रभर भिजवलेले', '2 कांदे, बारीक चिरलेले', '2 टोमॅटो, प्युरी', '1 मोठा चमचा आले-लसूण पेस्ट', '2½ मोठे चमचे छोले मसाला', '½ लहान चमचा गरम मसाला', '1 टी बॅग (रंगासाठी)'],
    },
    steps: {
      en: ['Pressure-cook chana with the tea bag and salt until very soft; discard the tea bag.', 'Sauté onions till deep brown, add ginger-garlic paste.', 'Add tomato purée and Chole Masala; cook until oil separates.', 'Add chana with its water, mash a few, simmer 15 minutes.', 'Finish with Garam Masala, ginger juliennes and serve with bhature.'],
      hi: ['चने को टी बैग और नमक के साथ बहुत नरम होने तक पकाएँ; टी बैग निकाल दें।', 'प्याज़ को गहरा भूरा भूनें, अदरक-लहसुन पेस्ट डालें।', 'टमाटर प्यूरी और छोले मसाला डालें; तेल छूटने तक पकाएँ।', 'चने पानी सहित डालें, कुछ मसलें, 15 मिनट पकाएँ।', 'गरम मसाला, अदरक के लच्छे डालकर भटूरे के साथ परोसें।'],
      mr: ['चणे टी बॅग आणि मीठ घालून खूप मऊ होईपर्यंत शिजवा; टी बॅग काढून टाका.', 'कांदा गडद तपकिरी परता, आले-लसूण पेस्ट घाला.', 'टोमॅटो प्युरी आणि छोले मसाला घाला; तेल सुटेपर्यंत शिजवा.', 'पाण्यासकट चणे घाला, थोडे स्मॅश करा, 15 मिनिटे शिजवा.', 'गरम मसाला, आल्याचे काप घालून भटुऱ्यांसोबत वाढा.'],
    },
  },
  {
    id: 'r05', slug: 'rajma-chawal', categories: ['lunch', 'punjabi'], prep: 10, cook: 45, difficulty: 'easy', serves: 4,
    products: ['p29', 'p05'], art: { curry: '#7B1F22', garnish: '#FFF8ED', bowl: '#C9A26B' }, image: null,
    name: { en: 'Rajma Chawal', hi: 'राजमा चावल', mr: 'राजमा भात' },
    desc: { en: 'Creamy kidney beans in onion-tomato gravy with steamed rice.', hi: 'प्याज़-टमाटर ग्रेवी में मलाईदार राजमा, उबले चावल के साथ।', mr: 'कांदा-टोमॅटो ग्रेव्हीतील मलईदार राजमा, वाफवलेल्या भातासोबत.' },
    ingredients: {
      en: ['1 cup rajma, soaked overnight', '2 onions, chopped', '3 tomatoes, puréed', '1 tbsp ginger-garlic paste', '2 tbsp Rajma Masala', '½ tsp Cumin Powder', 'Butter and coriander'],
      hi: ['1 कप राजमा, रात भर भिगोया', '2 प्याज़, कटे', '3 टमाटर, प्यूरी', '1 बड़ा चम्मच अदरक-लहसुन पेस्ट', '2 बड़े चम्मच राजमा मसाला', '½ छोटा चम्मच जीरा पाउडर', 'मक्खन और धनिया'],
      mr: ['1 वाटी राजमा, रात्रभर भिजवलेला', '2 कांदे, चिरलेले', '3 टोमॅटो, प्युरी', '1 मोठा चमचा आले-लसूण पेस्ट', '2 मोठे चमचे राजमा मसाला', '½ लहान चमचा जिरे पावडर', 'लोणी आणि कोथिंबीर'],
    },
    steps: {
      en: ['Pressure-cook rajma with salt for 6–7 whistles.', 'Sauté onions till golden; add ginger-garlic paste.', 'Add tomato purée, Rajma Masala and cumin; cook till thick.', 'Add rajma and simmer 15 minutes, mashing a few beans.', 'Finish with butter and coriander; serve with rice.'],
      hi: ['राजमा को नमक के साथ 6–7 सीटी तक पकाएँ।', 'प्याज़ सुनहरा भूनें; अदरक-लहसुन पेस्ट डालें।', 'टमाटर प्यूरी, राजमा मसाला और जीरा डालें; गाढ़ा होने तक पकाएँ।', 'राजमा डालें और कुछ दाने मसलते हुए 15 मिनट पकाएँ।', 'मक्खन और धनिया डालें; चावल के साथ परोसें।'],
      mr: ['राजमा मीठ घालून 6–7 शिट्ट्या शिजवा.', 'कांदा सोनेरी परता; आले-लसूण पेस्ट घाला.', 'टोमॅटो प्युरी, राजमा मसाला आणि जिरे घाला; घट्ट होईपर्यंत शिजवा.', 'राजमा घाला आणि काही दाणे स्मॅश करत 15 मिनिटे शिजवा.', 'लोणी आणि कोथिंबीर घाला; भातासोबत वाढा.'],
    },
  },
  {
    id: 'r06', slug: 'paneer-butter-masala', categories: ['dinner', 'punjabi', 'festival'], prep: 15, cook: 25, difficulty: 'medium', serves: 4,
    products: ['p30', 'p03', 'p11'], art: { curry: '#D2691E', garnish: '#FFF8ED', bowl: '#B08D57' }, image: null,
    name: { en: 'Paneer Butter Masala', hi: 'पनीर बटर मसाला', mr: 'पनीर बटर मसाला' },
    desc: { en: 'Soft paneer in a velvety tomato-cashew makhani gravy.', hi: 'मखमली टमाटर-काजू मखनी ग्रेवी में नरम पनीर।', mr: 'मखमली टोमॅटो-काजू मखनी ग्रेव्हीतील मऊ पनीर.' },
    ingredients: {
      en: ['250g paneer, cubed', '4 tomatoes', '12 cashews', '2 tbsp butter', '2 tbsp Paneer Masala', '1 tsp Kashmiri Chilli Powder', '¼ tsp Garam Masala, cream, kasuri methi'],
      hi: ['250 ग्राम पनीर, टुकड़े', '4 टमाटर', '12 काजू', '2 बड़े चम्मच मक्खन', '2 बड़े चम्मच पनीर मसाला', '1 छोटा चम्मच कश्मीरी मिर्च', '¼ छोटा चम्मच गरम मसाला, क्रीम, कसूरी मेथी'],
      mr: ['250 ग्रॅ पनीर, तुकडे', '4 टोमॅटो', '12 काजू', '2 मोठे चमचे लोणी', '2 मोठे चमचे पनीर मसाला', '1 लहान चमचा काश्मिरी मिरची', '¼ लहान चमचा गरम मसाला, क्रीम, कसुरी मेथी'],
    },
    steps: {
      en: ['Boil tomatoes and cashews for 5 minutes; blend smooth.', 'Melt butter, add Paneer Masala and Kashmiri chilli, stir 30 seconds.', 'Pour in the purée; simmer 10 minutes until glossy.', 'Add paneer, a splash of cream and crushed kasuri methi.', 'Sprinkle Garam Masala and serve with naan.'],
      hi: ['टमाटर और काजू 5 मिनट उबालें; चिकना पीस लें।', 'मक्खन पिघलाएँ, पनीर मसाला और कश्मीरी मिर्च डालकर 30 सेकंड चलाएँ।', 'प्यूरी डालें; चमकदार होने तक 10 मिनट पकाएँ।', 'पनीर, थोड़ी क्रीम और मसली कसूरी मेथी डालें।', 'गरम मसाला छिड़कें और नान के साथ परोसें।'],
      mr: ['टोमॅटो आणि काजू 5 मिनिटे उकळा; बारीक वाटा.', 'लोणी वितळवा, पनीर मसाला आणि काश्मिरी मिरची घालून 30 सेकंद ढवळा.', 'प्युरी घाला; चकचकीत होईपर्यंत 10 मिनिटे शिजवा.', 'पनीर, थोडी क्रीम आणि चुरलेली कसुरी मेथी घाला.', 'गरम मसाला भुरभुरून नानसोबत वाढा.'],
    },
  },
  {
    id: 'r07', slug: 'udupi-sambhar', categories: ['lunch', 'south-indian'], prep: 15, cook: 30, difficulty: 'easy', serves: 4,
    products: ['p24', 'p01'], art: { curry: '#B5541E', garnish: '#315C3B', bowl: '#6B6B6B' }, image: null,
    name: { en: 'Udupi Sambhar', hi: 'उडुपी सांभर', mr: 'उडुपी सांबार' },
    desc: { en: 'Tangy toor dal stew with drumsticks, vegetables and a curry-leaf tadka.', hi: 'सहजन, सब्ज़ियों और करी पत्ते के तड़के वाली खट्टी अरहर दाल।', mr: 'शेवग्याच्या शेंगा, भाज्या आणि कढीपत्त्याच्या फोडणीची आंबट तूर डाळ.' },
    ingredients: {
      en: ['¾ cup toor dal', '2 cups mixed vegetables (drumstick, pumpkin, brinjal)', 'Lemon-sized tamarind', '2 tbsp Sambhar Masala', '½ tsp Turmeric Powder', 'Mustard seeds, curry leaves, hing', '1 tsp jaggery'],
      hi: ['¾ कप अरहर दाल', '2 कप मिली-जुली सब्ज़ियाँ (सहजन, कद्दू, बैंगन)', 'नींबू जितनी इमली', '2 बड़े चम्मच सांभर मसाला', '½ छोटा चम्मच हल्दी', 'राई, करी पत्ता, हींग', '1 छोटा चम्मच गुड़'],
      mr: ['¾ वाटी तूर डाळ', '2 वाट्या मिश्र भाज्या (शेवगा, भोपळा, वांगे)', 'लिंबाएवढी चिंच', '2 मोठे चमचे सांबार मसाला', '½ लहान चमचा हळद', 'मोहरी, कढीपत्ता, हिंग', '1 लहान चमचा गूळ'],
    },
    steps: {
      en: ['Cook toor dal with turmeric until mushy; whisk smooth.', 'Boil vegetables in tamarind water with salt and jaggery.', 'Add Sambhar Masala and the dal; simmer 10 minutes.', 'Temper mustard, curry leaves and hing in oil; pour over.', 'Serve hot with rice, idli or dosa.'],
      hi: ['अरहर दाल को हल्दी के साथ गलने तक पकाएँ; फेंटकर चिकना करें।', 'सब्ज़ियों को इमली के पानी में नमक और गुड़ के साथ उबालें।', 'सांभर मसाला और दाल डालें; 10 मिनट पकाएँ।', 'तेल में राई, करी पत्ता और हींग का तड़का लगाकर ऊपर डालें।', 'चावल, इडली या डोसा के साथ गरम परोसें।'],
      mr: ['तूर डाळ हळद घालून मऊ शिजवा; घोटून एकजीव करा.', 'भाज्या चिंचेच्या पाण्यात मीठ आणि गूळ घालून उकळा.', 'सांबार मसाला आणि डाळ घाला; 10 मिनिटे उकळा.', 'तेलात मोहरी, कढीपत्ता आणि हिंगाची फोडणी करून वर ओता.', 'भात, इडली किंवा डोशासोबत गरम वाढा.'],
    },
  },
  {
    id: 'r08', slug: 'pepper-rasam', categories: ['dinner', 'south-indian'], prep: 10, cook: 15, difficulty: 'easy', serves: 3,
    products: ['p25', 'p06'], art: { curry: '#C2462B', garnish: '#315C3B', bowl: '#8C8C8C' }, image: null,
    name: { en: 'Pepper Rasam', hi: 'काली मिर्च रसम', mr: 'मिरी रसम' },
    desc: { en: 'A thin, peppery tamarind-tomato broth — comfort in a cup.', hi: 'पतला, कालीमिर्च वाला इमली-टमाटर शोरबा — कप में सुकून।', mr: 'पातळ, मिरीदार चिंच-टोमॅटो सार — कपभर दिलासा.' },
    ingredients: {
      en: ['2 tomatoes, crushed', 'Small lemon-sized tamarind', '1½ tbsp Rasam Powder', '½ tsp Black Pepper Powder', '¼ cup cooked toor dal water', 'Mustard, curry leaves, ghee', 'Coriander leaves'],
      hi: ['2 टमाटर, मसले', 'छोटे नींबू जितनी इमली', '1½ बड़े चम्मच रसम पाउडर', '½ छोटा चम्मच काली मिर्च पाउडर', '¼ कप पकी अरहर दाल का पानी', 'राई, करी पत्ता, घी', 'धनिया पत्ती'],
      mr: ['2 टोमॅटो, कुस्करलेले', 'लहान लिंबाएवढी चिंच', '1½ मोठे चमचे रसम पावडर', '½ लहान चमचा काळी मिरी पावडर', '¼ वाटी शिजलेल्या तूर डाळीचे पाणी', 'मोहरी, कढीपत्ता, तूप', 'कोथिंबीर'],
    },
    steps: {
      en: ['Simmer tamarind water with tomatoes, salt and Rasam Powder for 8 minutes.', 'Add dal water and pepper; bring to a froth — do not boil hard.', 'Temper mustard and curry leaves in ghee; add to rasam.', 'Garnish with coriander.', 'Serve with hot rice or sip as a soup.'],
      hi: ['इमली के पानी में टमाटर, नमक और रसम पाउडर डालकर 8 मिनट पकाएँ।', 'दाल का पानी और काली मिर्च डालें; झाग आने दें — तेज़ न उबालें।', 'घी में राई और करी पत्ते का तड़का लगाकर रसम में डालें।', 'धनिया से सजाएँ।', 'गरम चावल के साथ परोसें या सूप की तरह पिएँ।'],
      mr: ['चिंचेच्या पाण्यात टोमॅटो, मीठ आणि रसम पावडर घालून 8 मिनिटे उकळा.', 'डाळीचे पाणी आणि मिरी घाला; फेस येऊ द्या — जोरात उकळू नका.', 'तुपात मोहरी आणि कढीपत्त्याची फोडणी करून रसममध्ये घाला.', 'कोथिंबिरीने सजवा.', 'गरम भातासोबत वाढा किंवा सूपसारखे प्या.'],
    },
  },
  {
    id: 'r09', slug: 'hyderabadi-veg-biryani', categories: ['dinner', 'festival', 'lunch'], prep: 30, cook: 40, difficulty: 'hard', serves: 5,
    products: ['p26', 'p08', 'p11'], art: { curry: '#E0A040', garnish: '#A92324', bowl: '#5A3A28' }, image: null,
    name: { en: 'Dum Veg Biryani', hi: 'दम वेज बिरयानी', mr: 'दम व्हेज बिर्याणी' },
    desc: { en: 'Layered basmati and spiced vegetables, sealed and slow-cooked on dum.', hi: 'परतदार बासमती और मसालेदार सब्ज़ियाँ, दम पर धीमी आँच में पकी।', mr: 'थरांचा बासमती आणि मसालेदार भाज्या, दमावर मंद आचेवर शिजवलेल्या.' },
    ingredients: {
      en: ['2 cups basmati rice, soaked', '3 cups mixed vegetables', '1 cup curd', '2 onions, fried crisp', '3 tbsp Biryani Masala', '4 Green Cardamom pods', 'Saffron milk, mint, ghee, ½ tsp Garam Masala'],
      hi: ['2 कप बासमती चावल, भिगोए', '3 कप मिली-जुली सब्ज़ियाँ', '1 कप दही', '2 प्याज़, कुरकुरे तले', '3 बड़े चम्मच बिरयानी मसाला', '4 हरी इलायची', 'केसर दूध, पुदीना, घी, ½ छोटा चम्मच गरम मसाला'],
      mr: ['2 वाट्या बासमती तांदूळ, भिजवलेले', '3 वाट्या मिश्र भाज्या', '1 वाटी दही', '2 कांदे, कुरकुरीत तळलेले', '3 मोठे चमचे बिर्याणी मसाला', '4 हिरव्या वेलच्या', 'केशर दूध, पुदिना, तूप, ½ लहान चमचा गरम मसाला'],
    },
    steps: {
      en: ['Marinate vegetables in curd, Biryani Masala and half the fried onions for 20 minutes.', 'Par-boil rice with cardamom and salt until 70% done; drain.', 'Cook the marinated vegetables in ghee for 8 minutes.', 'Layer rice over vegetables; top with saffron milk, mint, onions and Garam Masala.', 'Seal and cook on low heat (dum) for 20 minutes; rest 5 minutes before serving.'],
      hi: ['सब्ज़ियों को दही, बिरयानी मसाला और आधे तले प्याज़ में 20 मिनट मैरिनेट करें।', 'चावल को इलायची और नमक के साथ 70% तक उबालें; पानी निकालें।', 'मैरिनेट सब्ज़ियों को घी में 8 मिनट पकाएँ।', 'सब्ज़ियों पर चावल की परत लगाएँ; ऊपर केसर दूध, पुदीना, प्याज़ और गरम मसाला डालें।', 'ढक्कन सील कर धीमी आँच (दम) पर 20 मिनट पकाएँ; परोसने से पहले 5 मिनट रखें।'],
      mr: ['भाज्या दही, बिर्याणी मसाला आणि अर्ध्या तळलेल्या कांद्यात 20 मिनिटे मुरवा.', 'तांदूळ वेलची आणि मीठ घालून 70% शिजवा; पाणी काढा.', 'मुरवलेल्या भाज्या तुपात 8 मिनिटे शिजवा.', 'भाज्यांवर भाताचा थर द्या; वर केशर दूध, पुदिना, कांदा आणि गरम मसाला घाला.', 'झाकण बंद करून मंद आचेवर (दम) 20 मिनिटे शिजवा; वाढण्यापूर्वी 5 मिनिटे ठेवा.'],
    },
  },
  {
    id: 'r10', slug: 'masale-bhaat', categories: ['festival', 'maharashtrian', 'lunch'], prep: 15, cook: 25, difficulty: 'medium', serves: 4,
    products: ['p18', 'p20', 'p02'], art: { curry: '#B5762E', garnish: '#315C3B', bowl: '#E8E0D0' }, image: null,
    name: { en: 'Masale Bhaat', hi: 'मसाले भात', mr: 'मसाले भात' },
    desc: { en: 'Wedding-feast spiced rice with ivy gourd and Goda masala.', hi: 'शादी की दावत वाला मसालेदार चावल, तोंडली और गोडा मसाले के साथ।', mr: 'लग्नाच्या पंगतीतला तोंडली आणि गोडा मसाल्याचा मसालेभात.' },
    ingredients: {
      en: ['1½ cups ambemohar or short-grain rice', '1 cup tondli (ivy gourd), sliced', '2 tbsp Goda Masala', '1 tsp Kala Masala', '½ tsp Red Chilli Powder', 'Cashews, mustard, hing, curry leaves', 'Fresh coconut and coriander'],
      hi: ['1½ कप आंबेमोहर या छोटे दाने का चावल', '1 कप तोंडली (कुंदरू), कटी', '2 बड़े चम्मच गोडा मसाला', '1 छोटा चम्मच काला मसाला', '½ छोटा चम्मच लाल मिर्च पाउडर', 'काजू, राई, हींग, करी पत्ता', 'ताज़ा नारियल और धनिया'],
      mr: ['1½ वाटी आंबेमोहर किंवा लहान दाण्याचा तांदूळ', '1 वाटी तोंडली, चिरलेली', '2 मोठे चमचे गोडा मसाला', '1 लहान चमचा काळा मसाला', '½ लहान चमचा लाल तिखट', 'काजू, मोहरी, हिंग, कढीपत्ता', 'ओले खोबरे आणि कोथिंबीर'],
    },
    steps: {
      en: ['Wash rice and drain for 20 minutes.', 'Temper mustard, hing, curry leaves and cashews in ghee.', 'Add tondli and sauté 3 minutes; add Goda, Kala Masala and chilli.', 'Add rice, roast briefly, then 3 cups hot water and salt; cook covered till done.', 'Garnish with coconut, coriander and a drizzle of ghee.'],
      hi: ['चावल धोकर 20 मिनट पानी निकालने रखें।', 'घी में राई, हींग, करी पत्ता और काजू का तड़का लगाएँ।', 'तोंडली डालकर 3 मिनट भूनें; गोडा, काला मसाला और मिर्च डालें।', 'चावल डालें, थोड़ा भूनें, फिर 3 कप गरम पानी और नमक डालकर ढककर पकाएँ।', 'नारियल, धनिया और थोड़ा घी डालकर सजाएँ।'],
      mr: ['तांदूळ धुऊन 20 मिनिटे निथळत ठेवा.', 'तुपात मोहरी, हिंग, कढीपत्ता आणि काजूची फोडणी करा.', 'तोंडली घालून 3 मिनिटे परता; गोडा, काळा मसाला आणि तिखट घाला.', 'तांदूळ घाला, थोडा परता, मग 3 वाट्या गरम पाणी आणि मीठ घालून झाकून शिजवा.', 'ओले खोबरे, कोथिंबीर आणि थोडे तूप घालून सजवा.'],
    },
  },
  {
    id: 'r11', slug: 'street-pani-puri', categories: ['snacks'], prep: 20, cook: 10, difficulty: 'easy', serves: 4,
    products: ['p33', 'p13'], art: { curry: '#4F8A4A', garnish: '#E5A52B', bowl: '#C9A26B' }, image: null,
    name: { en: 'Street-Style Pani Puri', hi: 'स्ट्रीट-स्टाइल पानी पूरी', mr: 'स्ट्रीट-स्टाइल पाणीपुरी' },
    desc: { en: 'Crisp puris, spiced potato and tangy-minty pani — party in a bite.', hi: 'कुरकुरी पूरियाँ, मसालेदार आलू और खट्टा-पुदीना पानी — एक कौर में पार्टी।', mr: 'कुरकुरीत पुऱ्या, मसालेदार बटाटा आणि आंबट-पुदिन्याचे पाणी — एका घासात पार्टी.' },
    ingredients: {
      en: ['30 ready puris', '2 potatoes, boiled & mashed', '½ cup boiled chickpeas or moong', '3 tbsp Pani Puri Masala', '1 tsp Chaat Masala', '1 litre chilled water', 'Sweet tamarind chutney, boondi'],
      hi: ['30 तैयार पूरियाँ', '2 आलू, उबले और मसले', '½ कप उबले चने या मूंग', '3 बड़े चम्मच पानी पूरी मसाला', '1 छोटा चम्मच चाट मसाला', '1 लीटर ठंडा पानी', 'मीठी इमली चटनी, बूंदी'],
      mr: ['30 तयार पुऱ्या', '2 बटाटे, उकडून कुस्करलेले', '½ वाटी उकडलेले चणे किंवा मूग', '3 मोठे चमचे पाणीपुरी मसाला', '1 लहान चमचा चाट मसाला', '1 लिटर थंड पाणी', 'गोड चिंचेची चटणी, बुंदी'],
    },
    steps: {
      en: ['Whisk Pani Puri Masala into chilled water; add boondi and chill.', 'Mix potatoes and chickpeas with Chaat Masala and salt.', 'Crack a hole in each puri and fill with the potato mix.', 'Add a little sweet chutney.', 'Dip in pani and eat immediately.'],
      hi: ['ठंडे पानी में पानी पूरी मसाला फेंटें; बूंदी डालकर ठंडा करें।', 'आलू और चने में चाट मसाला और नमक मिलाएँ।', 'हर पूरी में छेद करके आलू का मिश्रण भरें।', 'थोड़ी मीठी चटनी डालें।', 'पानी में डुबोकर तुरंत खाएँ।'],
      mr: ['थंड पाण्यात पाणीपुरी मसाला फेटा; बुंदी घालून थंड करा.', 'बटाटा आणि चण्यांमध्ये चाट मसाला आणि मीठ मिसळा.', 'प्रत्येक पुरीला भोक पाडून बटाट्याचे मिश्रण भरा.', 'थोडी गोड चटणी घाला.', 'पाण्यात बुडवून लगेच खा.'],
    },
  },
  {
    id: 'r12', slug: 'tandoori-paneer-tikka', categories: ['snacks', 'punjabi', 'festival'], prep: 40, cook: 15, difficulty: 'medium', serves: 4,
    products: ['p31', 'p13'], art: { curry: '#B42A1E', garnish: '#315C3B', bowl: '#28231F' }, image: null,
    name: { en: 'Tandoori Paneer Tikka', hi: 'तंदूरी पनीर टिक्का', mr: 'तंदुरी पनीर टिक्का' },
    desc: { en: 'Smoky, charred paneer and peppers in a hung-curd marinade.', hi: 'गाढ़े दही के मैरिनेड में धुएँदार, सिके पनीर और शिमला मिर्च।', mr: 'घट्ट दह्याच्या मॅरिनेडमध्ये धुरकट, भाजलेले पनीर आणि ढोबळी मिरची.' },
    ingredients: {
      en: ['300g paneer, large cubes', '1 capsicum and 1 onion, in squares', '¾ cup hung curd', '2 tbsp Tandoori Masala', '1 tbsp mustard oil', '1 tsp lemon juice', 'Chaat Masala to finish'],
      hi: ['300 ग्राम पनीर, बड़े टुकड़े', '1 शिमला मिर्च और 1 प्याज़, चौकोर', '¾ कप गाढ़ा दही', '2 बड़े चम्मच तंदूरी मसाला', '1 बड़ा चम्मच सरसों तेल', '1 छोटा चम्मच नींबू रस', 'ऊपर से चाट मसाला'],
      mr: ['300 ग्रॅ पनीर, मोठे तुकडे', '1 ढोबळी मिरची आणि 1 कांदा, चौकोनी', '¾ वाटी घट्ट दही', '2 मोठे चमचे तंदुरी मसाला', '1 मोठा चमचा मोहरीचे तेल', '1 लहान चमचा लिंबाचा रस', 'वरून चाट मसाला'],
    },
    steps: {
      en: ['Whisk curd, Tandoori Masala, mustard oil, lemon and salt.', 'Coat paneer and vegetables; marinate 30 minutes.', 'Thread onto skewers.', 'Grill or bake at 220°C for 12–15 minutes, turning once, until charred.', 'Sprinkle Chaat Masala and serve with mint chutney.'],
      hi: ['दही, तंदूरी मसाला, सरसों तेल, नींबू और नमक फेंटें।', 'पनीर और सब्ज़ियों पर लगाएँ; 30 मिनट मैरिनेट करें।', 'सींखों में पिरोएँ।', '220°C पर 12–15 मिनट ग्रिल या बेक करें, एक बार पलटें।', 'चाट मसाला छिड़कें और पुदीना चटनी के साथ परोसें।'],
      mr: ['दही, तंदुरी मसाला, मोहरीचे तेल, लिंबू आणि मीठ फेटा.', 'पनीर आणि भाज्यांना लावा; 30 मिनिटे मुरवा.', 'सळ्यांमध्ये ओवा.', '220°C वर 12–15 मिनिटे ग्रिल किंवा बेक करा, एकदा उलटा.', 'चाट मसाला भुरभुरून पुदिना चटणीसोबत वाढा.'],
    },
  },
];
