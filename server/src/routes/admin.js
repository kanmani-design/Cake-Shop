import { Router } from 'express'; import { z } from 'zod'; import rateLimit from 'express-rate-limit';
import { Order, Product, ContactMessage, NewsletterSubscriber } from '../models/index.js'; import { h, protect, adminOnly, page } from '../utils/http.js';
export const admin = Router(), pub = Router(); admin.use(protect, adminOnly);
const valid = { status: { $ne: 'Cancelled' } };
admin.get('/dashboard', h(async (_q, res) => { const [orders, pending, products, rev, byStatus, recent] = await Promise.all([Order.countDocuments(), Order.countDocuments({ status: 'Pending' }), Product.countDocuments(),
  Order.aggregate([{ $match: valid }, { $group: { _id: null, t: { $sum: '$total' } } }]), Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]), Order.find().sort('-createdAt').limit(5)]);
  res.json({ success: true, totalOrders: orders, pendingOrders: pending, totalProducts: products, totalRevenue: rev[0]?.t || 0, byStatus, recent }); }));
admin.get('/sales-summary', h(async (_q, res) => { const from = new Date(Date.now() - 30 * 864e5);
  res.json({ success: true, items: await Order.aggregate([{ $match: { ...valid, createdAt: { $gte: from } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } }, { $sort: { _id: 1 } }]) }); }));
admin.get('/recent-orders', h(async (_q, res) => res.json({ success: true, items: await Order.find().sort('-createdAt').limit(10).populate('user', 'name email') })));
admin.get('/messages', h(async (req, res) => { const { skip, l } = page(req.query); res.json({ success: true, items: await ContactMessage.find().sort('-createdAt').skip(skip).limit(l) }); }));
admin.get('/subscribers', h(async (req, res) => { const { skip, l } = page(req.query); res.json({ success: true, items: await NewsletterSubscriber.find().sort('-createdAt').skip(skip).limit(l) }); }));
const lim = rateLimit({ windowMs: 15 * 60e3, limit: 10, standardHeaders: true, legacyHeaders: false });
pub.post('/contact', lim, h(async (req, res) => { const d = z.object({ name: z.string().trim().min(2).max(80), email: z.string().email(), phone: z.string().max(20).optional(), subject: z.string().trim().min(3).max(120), message: z.string().trim().min(10).max(2000) }).parse(req.body);
  await ContactMessage.create(d); res.status(201).json({ success: true, message: 'Thanks, we have received your message.' }); }));
pub.post('/newsletter/subscribe', lim, h(async (req, res) => { const { email } = z.object({ email: z.string().email() }).parse(req.body);
  await NewsletterSubscriber.updateOne({ email: email.toLowerCase() }, { email }, { upsert: true }); res.status(201).json({ success: true, message: 'You are subscribed.' }); }));
