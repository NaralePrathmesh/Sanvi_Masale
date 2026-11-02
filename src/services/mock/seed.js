/**
 * DEMO seed data for customers and orders (fictional). Used by the mock admin
 * dashboard and the demo customer account. Replace with API calls in Phase 2.
 */
const daysAgo = (n, h = 10) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(h, 15, 0, 0); return d.toISOString(); };

export const demoCustomer = {
  id: 'c001', name: 'Priya Deshmukh', email: 'demo@saanvimasale.example', phone: '9876543210', joinedAt: daysAgo(210),
  addresses: [
    { id: 'a1', label: 'Home', name: 'Priya Deshmukh', phone: '9876543210', house: 'Flat 302, Shree Apartments', street: 'Karve Road', area: 'Kothrud', city: 'Pune', state: 'Maharashtra', pin: '411038', landmark: 'Near Karve Statue', isDefault: true },
    { id: 'a2', label: 'Office', name: 'Priya Deshmukh', phone: '9876543210', house: '5th Floor, Tech Park', street: 'Baner Road', area: 'Baner', city: 'Pune', state: 'Maharashtra', pin: '411045', landmark: '', isDefault: false },
  ],
};

export const demoCustomers = [
  { id: 'c001', name: 'Priya Deshmukh', email: 'demo@saanvimasale.example', phone: '9876543210', city: 'Pune', joinedAt: daysAgo(210) },
  { id: 'c002', name: 'Rohan Mehta', email: 'rohan.m@example.com', phone: '9822001122', city: 'Mumbai', joinedAt: daysAgo(160) },
  { id: 'c003', name: 'Kavya Reddy', email: 'kavya.r@example.com', phone: '9000112233', city: 'Hyderabad', joinedAt: daysAgo(120) },
  { id: 'c004', name: 'Amanpreet Kaur', email: 'aman.k@example.com', phone: '9811223344', city: 'Delhi', joinedAt: daysAgo(98) },
  { id: 'c005', name: 'Siddharth Joshi', email: 'sid.j@example.com', phone: '9767001234', city: 'Nashik', joinedAt: daysAgo(75) },
  { id: 'c006', name: 'Meera Nair', email: 'meera.n@example.com', phone: '9447001122', city: 'Bengaluru', joinedAt: daysAgo(44) },
  { id: 'c007', name: 'Vikram Shinde', email: 'vikram.s@example.com', phone: '9890011223', city: 'Kolhapur', joinedAt: daysAgo(30) },
  { id: 'c008', name: 'Ananya Ghosh', email: 'ananya.g@example.com', phone: '9830012345', city: 'Kolkata', joinedAt: daysAgo(12) },
];

const addr = (name, phone, city, state, pin, area) => ({ name, phone, house: '12, Demo Residency', street: 'Main Road', area, city, state, pin, landmark: '' });
const line = (productId, size, qty, price, mrp) => ({ productId, size, qty, price, mrp });

function order(id, customerId, customer, email, days, status, items, payment, address, coupon = null) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const mrpTotal = items.reduce((s, i) => s + i.mrp * i.qty, 0);
  const couponDiscount = coupon ? Math.round(subtotal * 0.1) : 0;
  const delivery = subtotal - couponDiscount >= 499 ? 0 : 49;
  const placedAt = daysAgo(days);
  const eta = new Date(placedAt); eta.setDate(eta.getDate() + 5);
  return {
    id, customerId, customer: { name: customer, email, phone: address.phone }, placedAt, status, items, payment, address,
    delivery: { method: 'standard', charge: delivery, eta: eta.toISOString() },
    totals: { subtotal, mrpTotal, savings: mrpTotal - subtotal, couponCode: coupon, couponDiscount, delivery, comboDiscount: 0, total: subtotal - couponDiscount + delivery },
    history: [{ status: 'placed', at: placedAt }], demo: true,
  };
}

export const demoOrders = [
  order('RR260001', 'c001', 'Priya Deshmukh', 'demo@saanvimasale.example', 28, 'delivered', [line('p17', '200g', 1, 165, 190), line('p18', '100g', 2, 90, 100), line('p01', '200g', 1, 80, 90)], 'upi', addr('Priya Deshmukh', '9876543210', 'Pune', 'Maharashtra', '411038', 'Kothrud'), 'WELCOME10'),
  order('RR260002', 'c002', 'Rohan Mehta', 'rohan.m@example.com', 21, 'delivered', [line('p22', '100g', 2, 85, 95), line('p13', '100g', 1, 80, 90)], 'card', addr('Rohan Mehta', '9822001122', 'Mumbai', 'Maharashtra', '400050', 'Bandra West')),
  order('RR260003', 'c003', 'Kavya Reddy', 'kavya.r@example.com', 14, 'delivered', [line('p26', '200g', 1, 205, 235), line('p24', '200g', 1, 145, 160)], 'netbanking', addr('Kavya Reddy', '9000112233', 'Hyderabad', 'Telangana', '500081', 'Madhapur')),
  order('RR260004', 'c004', 'Amanpreet Kaur', 'aman.k@example.com', 9, 'shipped', [line('p40', '4 × 100g', 1, 359, 440), line('p11', '100g', 1, 95, 110)], 'cod', addr('Amanpreet Kaur', '9811223344', 'Delhi', 'Delhi', '110017', 'Malviya Nagar'), 'FESTIVE15'),
  order('RR260005', 'c001', 'Priya Deshmukh', 'demo@saanvimasale.example', 4, 'out_for_delivery', [line('p35', '50g', 2, 80, 90), line('p42', '6 × 100g', 1, 549, 699)], 'upi', addr('Priya Deshmukh', '9876543210', 'Pune', 'Maharashtra', '411038', 'Kothrud')),
  order('RR260006', 'c005', 'Siddharth Joshi', 'sid.j@example.com', 3, 'processing', [line('p39', '4 × 100g', 1, 349, 420)], 'upi', addr('Siddharth Joshi', '9767001234', 'Nashik', 'Maharashtra', '422005', 'College Road')),
  order('RR260007', 'c006', 'Meera Nair', 'meera.n@example.com', 2, 'confirmed', [line('p08', '50g', 1, 225, 255), line('p06', '100g', 1, 160, 180), line('p25', '100g', 1, 80, 90)], 'card', addr('Meera Nair', '9447001122', 'Bengaluru', 'Karnataka', '560034', 'Koramangala')),
  order('RR260008', 'c007', 'Vikram Shinde', 'vikram.s@example.com', 1, 'placed', [line('p21', '200g', 2, 175, 195), line('p17', '500g', 1, 380, 430)], 'cod', addr('Vikram Shinde', '9890011223', 'Kolhapur', 'Maharashtra', '416003', 'Rajarampuri')),
  order('RR260009', 'c008', 'Ananya Ghosh', 'ananya.g@example.com', 0, 'placed', [line('p11', '200g', 1, 180, 205), line('p30', '100g', 1, 90, 100)], 'netbanking', addr('Ananya Ghosh', '9830012345', 'Kolkata', 'West Bengal', '700019', 'Ballygunge')),
];

/** Demo monthly sales for the dashboard chart (INR). */
export const demoMonthlySales = [
  { month: 'Jun', sales: 182000, orders: 412 }, { month: 'Jul', sales: 205000, orders: 455 },
  { month: 'Aug', sales: 238000, orders: 520 }, { month: 'Sep', sales: 296000, orders: 640 },
  { month: 'Oct', sales: 352000, orders: 760 }, { month: 'Nov', sales: 318000, orders: 690 },
];

export const DEMO_ADMIN = { email: 'admin@saanvimasale.example', password: 'admin123' };
export const DEMO_CUSTOMER_LOGIN = { email: 'demo@saanvimasale.example', password: 'demo123' };
