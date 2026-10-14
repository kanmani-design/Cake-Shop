import 'dotenv/config'; import mongoose from 'mongoose'; import bcrypt from 'bcryptjs'; import { User, Category, Product } from '../models/index.js';
const U = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;
const img = { choc: U('photo-1578985545062-69928b1d9587'), a: U('photo-1464349095431-e9a21285b5f3'), b: U('photo-1535141192574-5d4897c12636'), c: U('photo-1558301211-0d8c8ddee6ec'), d: U('photo-1621303837174-89787a7d4729') };
await mongoose.connect(process.env.MONGODB_URI); await Promise.all([Category.deleteMany(), Product.deleteMany()]);
const cats = Object.fromEntries((await Category.create(['Birthday', 'Wedding', 'Chocolate', 'Custom'].map(name => ({ name })))).map(c => [c.name, c._id]));
const S = (a, b, c) => [{ label: '500 g', price: a }, { label: '1 kg', price: b }, { label: '2 kg', price: c }];
const L = ['Vanilla', 'Chocolate', 'Strawberry', 'Butterscotch'];
const rows = [['Rainbow Celebration Cake', 'Birthday', S(650, 1200, 2300), [img.a], 1, 1], ['Strawberry Dream Cake', 'Birthday', S(700, 1300, 2500), [img.b], 0, 1], ['Classic Birthday Vanilla', 'Birthday', S(550, 1000, 1900), [img.c], 0, 0],
  ['Tiered Blush Wedding Cake', 'Wedding', S(2200, 4200, 8000), [img.d], 1, 0], ['White Floral Wedding Cake', 'Wedding', S(2000, 3900, 7500), [img.a], 1, 0], ['Truffle Chocolate Cake', 'Chocolate', S(750, 1400, 2700), [img.choc], 1, 1],
  ['Dark Chocolate Ganache', 'Chocolate', S(800, 1500, 2900), [img.choc], 0, 1], ['Photo Print Custom Cake', 'Custom', S(900, 1700, 3200), [img.c], 0, 0], ['Design-Your-Own Cake', 'Custom', S(1000, 1900, 3600), [img.d], 1, 0]];
await Product.create(rows.map(([name, c, sizes, images, featured, bestSeller]) => ({ name, category: cats[c], sizes, images, flavours: L, featured: !!featured, bestSeller: !!bestSeller, stock: 25,
  description: `${name}: baked fresh to order with real butter, cream and seasonal ingredients. Egg and eggless options available.` })));
const { ADMIN_EMAIL: e, ADMIN_PASSWORD: p } = process.env;
if (e && p && !(await User.exists({ email: e.toLowerCase() }))) { await User.create({ name: 'Admin', email: e, password: await bcrypt.hash(p, 12), role: 'admin' }); console.log('Admin created:', e); }
console.log('Seeded.'); await mongoose.disconnect();
