/**
 * POLICY PAGES — PLACEHOLDER TEXT. Have these reviewed by a legal professional
 * before launch. Each page: { updated, sections: [{ title:{en,hi,mr}, body:{en,hi,mr} }] }
 */
const s = (en, hi, mr) => ({ en, hi, mr });

export const policyPages = {
  shipping: {
    updated: '2026-11-01',
    sections: [
      { title: s('Delivery areas', 'डिलीवरी क्षेत्र', 'डिलिव्हरी क्षेत्र'), body: s('We deliver to serviceable PIN codes across India. Check your PIN code on any product page or at checkout.', 'हम पूरे भारत में सेवा योग्य पिन कोड पर डिलीवरी करते हैं। किसी भी उत्पाद पेज या चेकआउट पर अपना पिन कोड जाँचें।', 'आम्ही संपूर्ण भारतातील सेवा उपलब्ध पिन कोडवर डिलिव्हरी करतो. कोणत्याही उत्पादन पानावर किंवा चेकआउटवेळी तुमचा पिन कोड तपासा.') },
      { title: s('Delivery time', 'डिलीवरी का समय', 'डिलिव्हरीचा कालावधी'), body: s('Standard delivery takes 4–6 working days. Express delivery (selected cities) takes 1–2 working days.', 'स्टैंडर्ड डिलीवरी में 4–6 कार्य दिवस लगते हैं। एक्सप्रेस डिलीवरी (चुनिंदा शहर) में 1–2 कार्य दिवस लगते हैं।', 'स्टँडर्ड डिलिव्हरीला 4–6 कामकाजाचे दिवस लागतात. एक्सप्रेस डिलिव्हरीला (निवडक शहरे) 1–2 कामकाजाचे दिवस लागतात.') },
      { title: s('Delivery charges', 'डिलीवरी शुल्क', 'डिलिव्हरी शुल्क'), body: s('Standard delivery is free on orders above ₹499; otherwise a ₹49 charge applies. Express delivery costs ₹99.', '₹499 से ऊपर के ऑर्डर पर स्टैंडर्ड डिलीवरी मुफ़्त है; अन्यथा ₹49 शुल्क लगता है। एक्सप्रेस डिलीवरी ₹99 है।', '₹499 पेक्षा जास्त ऑर्डरवर स्टँडर्ड डिलिव्हरी मोफत; अन्यथा ₹49 शुल्क. एक्सप्रेस डिलिव्हरी ₹99.') },
      { title: s('Order tracking', 'ऑर्डर ट्रैकिंग', 'ऑर्डर ट्रॅकिंग'), body: s('Track any order with its order ID on the Track Order page. You will also receive updates by email and SMS.', 'ऑर्डर ट्रैक पेज पर ऑर्डर आईडी से कोई भी ऑर्डर ट्रैक करें। आपको ईमेल और SMS से भी अपडेट मिलेंगे।', 'ऑर्डर ट्रॅक पानावर ऑर्डर आयडीने कोणतीही ऑर्डर ट्रॅक करा. तुम्हाला ईमेल आणि SMS नेही अपडेट मिळतील.') },
    ],
  },
  returns: {
    updated: '2026-11-01',
    sections: [
      { title: s('Return window', 'रिटर्न अवधि', 'परताव्याची मुदत'), body: s('Unopened products can be returned within 7 days of delivery.', 'बिना खुले उत्पाद डिलीवरी के 7 दिनों के भीतर लौटाए जा सकते हैं।', 'न उघडलेली उत्पादने डिलिव्हरीनंतर 7 दिवसांत परत करता येतात.') },
      { title: s('Damaged or wrong items', 'क्षतिग्रस्त या गलत वस्तुएँ', 'खराब किंवा चुकीच्या वस्तू'), body: s('If an item arrives damaged or is not what you ordered, share a photo within 48 hours and we will replace it free of cost.', 'यदि वस्तु क्षतिग्रस्त आए या ऑर्डर से अलग हो, तो 48 घंटों में फ़ोटो भेजें, हम मुफ़्त में बदल देंगे।', 'वस्तू खराब आली किंवा ऑर्डरपेक्षा वेगळी असेल तर 48 तासांत फोटो पाठवा, आम्ही मोफत बदलून देऊ.') },
      { title: s('Refunds', 'रिफ़ंड', 'रिफंड'), body: s('Approved refunds go back to the original payment method within 5–7 working days. COD refunds are made by bank transfer.', 'स्वीकृत रिफ़ंड 5–7 कार्य दिवसों में मूल भुगतान माध्यम पर लौटाए जाते हैं। COD रिफ़ंड बैंक ट्रांसफ़र से होते हैं।', 'मंजूर रिफंड 5–7 कामकाजाच्या दिवसांत मूळ पेमेंट पद्धतीवर परत जातात. COD रिफंड बँक ट्रान्सफरने होतात.') },
      { title: s('Non-returnable items', 'वापस न होने वाली वस्तुएँ', 'परत न होणाऱ्या वस्तू'), body: s('For hygiene reasons, opened food products cannot be returned unless they are damaged or defective.', 'स्वच्छता के कारण, खुले खाद्य उत्पाद तब तक वापस नहीं होते जब तक वे क्षतिग्रस्त या दोषपूर्ण न हों।', 'स्वच्छतेच्या कारणास्तव, उघडलेले खाद्यपदार्थ खराब किंवा सदोष असल्याशिवाय परत घेतले जात नाहीत.') },
    ],
  },
  privacy: {
    updated: '2026-11-01',
    sections: [
      { title: s('What we collect', 'हम क्या एकत्र करते हैं', 'आम्ही काय गोळा करतो'), body: s('Your name, contact details, delivery address and order history, so we can process and deliver your orders.', 'आपका नाम, संपर्क विवरण, डिलीवरी पता और ऑर्डर इतिहास, ताकि हम आपके ऑर्डर प्रोसेस और डिलीवर कर सकें।', 'तुमचे नाव, संपर्क तपशील, डिलिव्हरी पत्ता आणि ऑर्डर इतिहास, जेणेकरून आम्ही तुमच्या ऑर्डर्स प्रक्रिया करून पोहोचवू शकू.') },
      { title: s('How we use it', 'हम इसका उपयोग कैसे करते हैं', 'आम्ही त्याचा वापर कसा करतो'), body: s('To fulfil orders, provide support and — only with your permission — send offers and updates.', 'ऑर्डर पूरा करने, सहायता देने और — केवल आपकी अनुमति से — ऑफ़र और अपडेट भेजने के लिए।', 'ऑर्डर पूर्ण करण्यासाठी, मदत देण्यासाठी आणि — फक्त तुमच्या परवानगीने — ऑफर्स व अपडेट्स पाठवण्यासाठी.') },
      { title: s('Payments', 'भुगतान', 'पेमेंट'), body: s('Card and bank details are handled by our payment partner and are never stored on our servers.', 'कार्ड और बैंक विवरण हमारे भुगतान साझेदार द्वारा संभाले जाते हैं और हमारे सर्वर पर कभी संग्रहीत नहीं होते।', 'कार्ड आणि बँक तपशील आमच्या पेमेंट भागीदाराकडून हाताळले जातात आणि आमच्या सर्व्हरवर कधीही साठवले जात नाहीत.') },
      { title: s('Your choices', 'आपके विकल्प', 'तुमचे पर्याय'), body: s('You can update your details, unsubscribe from emails or request deletion of your account at any time.', 'आप कभी भी अपना विवरण बदल सकते हैं, ईमेल से अनसब्सक्राइब कर सकते हैं या खाता हटाने का अनुरोध कर सकते हैं।', 'तुम्ही कधीही तुमचा तपशील बदलू शकता, ईमेलमधून अनसबस्क्राइब करू शकता किंवा खाते हटवण्याची विनंती करू शकता.') },
    ],
  },
  terms: {
    updated: '2026-11-01',
    sections: [
      { title: s('Using this website', 'इस वेबसाइट का उपयोग', 'या वेबसाइटचा वापर'), body: s('By using this website you agree to these terms. Please read them carefully.', 'इस वेबसाइट का उपयोग करके आप इन शर्तों से सहमत होते हैं। कृपया इन्हें ध्यान से पढ़ें।', 'ही वेबसाइट वापरून तुम्ही या अटी मान्य करता. कृपया त्या काळजीपूर्वक वाचा.') },
      { title: s('Prices and availability', 'मूल्य और उपलब्धता', 'किंमत आणि उपलब्धता'), body: s('Prices include taxes and may change without notice. Orders are subject to stock availability.', 'मूल्य करों सहित हैं और बिना सूचना बदल सकते हैं। ऑर्डर स्टॉक उपलब्धता पर निर्भर हैं।', 'किमती करांसहित आहेत आणि सूचनेशिवाय बदलू शकतात. ऑर्डर्स स्टॉक उपलब्धतेवर अवलंबून आहेत.') },
      { title: s('Coupons', 'कूपन', 'कूपन'), body: s('One coupon can be used per order. Coupons have no cash value and may be withdrawn at any time.', 'प्रति ऑर्डर एक कूपन इस्तेमाल किया जा सकता है। कूपन का कोई नकद मूल्य नहीं है और इन्हें कभी भी वापस लिया जा सकता है।', 'प्रत्येक ऑर्डरवर एक कूपन वापरता येतो. कूपनला रोख मूल्य नाही आणि ते कधीही मागे घेतले जाऊ शकतात.') },
      { title: s('Contact', 'संपर्क', 'संपर्क'), body: s('Questions about these terms? Write to our customer care team from the Contact page.', 'इन शर्तों के बारे में प्रश्न? संपर्क पेज से हमारी ग्राहक सेवा टीम को लिखें।', 'या अटींबद्दल प्रश्न? संपर्क पानावरून आमच्या ग्राहक सेवा टीमला लिहा.') },
    ],
  },
};

/** DEMO store locations (placeholder addresses). */
export const stores = [
  { id: 'pune', flagship: true, city: s('Pune', 'पुणे', 'पुणे'), name: s('Flagship Store, Kothrud', 'फ़्लैगशिप स्टोर, कोथरूड', 'फ्लॅगशिप स्टोअर, कोथरूड'), address: 'Shop 4, Karve Road, Kothrud, Pune 411038', phone: '+91 98765 43210', hours: '9:00 AM – 9:00 PM' },
  { id: 'mumbai', city: s('Mumbai', 'मुंबई', 'मुंबई'), name: s('Dadar Spice Counter', 'दादर मसाला काउंटर', 'दादर मसाला काउंटर'), address: 'Ranade Road, Dadar West, Mumbai 400028', phone: '+91 98765 43211', hours: '10:00 AM – 9:00 PM' },
  { id: 'kolhapur', city: s('Kolhapur', 'कोल्हापुर', 'कोल्हापूर'), name: s('Mahadwar Road Store', 'महाद्वार रोड स्टोर', 'महाद्वार रोड स्टोअर'), address: 'Mahadwar Road, Kolhapur 416012', phone: '+91 98765 43212', hours: '9:30 AM – 8:30 PM' },
  { id: 'nashik', city: s('Nashik', 'नासिक', 'नाशिक'), name: s('College Road Store', 'कॉलेज रोड स्टोर', 'कॉलेज रोड स्टोअर'), address: 'College Road, Nashik 422005', phone: '+91 98765 43213', hours: '10:00 AM – 8:30 PM' },
];
