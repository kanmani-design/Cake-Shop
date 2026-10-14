import { Router } from 'express'; import { z } from 'zod'; import { Product, Order } from '../models/index.js'; import { h, fail, protect, adminOnly, page } from '../utils/http.js'; import { calcTotals } from '../utils/pricing.js';
const r = Router(), STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Ready for Delivery', 'Out for Delivery', 'Delivered', 'Cancelled'];
const schema = z.object({ idempotencyKey: z.string().min(8).max(64),
  items: z.array(z.object({ productId: z.string().regex(/^[a-f\d]{24}$/i), size: z.string(), flavour: z.string().max(40).optional(), message: z.string().max(60).optional(), qty: z.number().int().min(1).max(10) })).min(1).max(30),
  delivery: z.object({ name: z.string().trim().min(2).max(80), email: z.string().email(), phone: z.string().trim().min(8).max(20), address: z.string().trim().min(5).max(200), city: z.string().trim().min(2), state: z.string().trim().min(2),
    postalCode: z.string().trim().min(4).max(10), date: z.coerce.date(), slot: z.enum(['10am-1pm', '1pm-4pm', '4pm-7pm']), notes: z.string().max(300).optional() }), paymentMethod: z.literal('COD') });
const restore = async items => { for (const i of items) await Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } }); };
r.post('/', protect, h(async (req, res) => { const d = schema.parse(req.body);
  const dup = await Order.findOne({ idempotencyKey: d.idempotencyKey, user: req.user._id }); if (dup) return res.json({ success: true, order: dup, duplicate: true });
  const min = new Date(); min.setDate(min.getDate() + 1); min.setHours(0, 0, 0, 0); if (d.delivery.date < min) throw fail(400, 'Delivery must be at least one day ahead');
  const reserved = [], items = [];
  try { for (const it of d.items) { const p = await Product.findById(it.productId); if (!p || !p.available) throw fail(400, 'A cake in your cart is no longer available');
      const size = p.sizes.find(s => s.label === it.size); if (!size) throw fail(400, `Size not available for ${p.name}`);
      if (it.flavour && p.flavours.length && !p.flavours.includes(it.flavour)) throw fail(400, `Flavour not available for ${p.name}`);
      const ok = await Product.findOneAndUpdate({ _id: p._id, available: true, stock: { $gte: it.qty } }, { $inc: { stock: -it.qty } }); if (!ok) throw fail(409, `Only limited stock left for ${p.name}`);
      reserved.push({ product: p._id, qty: it.qty }); items.push({ product: p._id, name: p.name, image: p.images[0], size: size.label, flavour: it.flavour, message: it.message, qty: it.qty, unitPrice: size.price }); }
    const order = await Order.create({ orderNumber: 'SC' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase(), idempotencyKey: d.idempotencyKey,
      user: req.user._id, items, delivery: d.delivery, ...calcTotals(items), paymentMethod: 'COD' });
    res.status(201).json({ success: true, order }); } catch (e) { await restore(reserved); throw e; } }));
r.get('/my-orders', protect, h(async (req, res) => res.json({ success: true, items: await Order.find({ user: req.user._id }).sort('-createdAt') })));
r.get('/', protect, adminOnly, h(async (req, res) => { const { p, l, skip } = page(req.query), f = {}; if (STATUSES.includes(req.query.status)) f.status = req.query.status;
  if (req.query.q) f.orderNumber = new RegExp('^' + String(req.query.q).replace(/[^A-Za-z0-9]/g, ''), 'i');
  const [items, total] = await Promise.all([Order.find(f).populate('user', 'name email').sort('-createdAt').skip(skip).limit(l), Order.countDocuments(f)]); res.json({ success: true, items, total, page: p, pages: Math.ceil(total / l) }); }));
const own = async req => { const o = await Order.findById(req.params.id); if (!o) throw fail(404, 'Order not found');
  if (String(o.user) !== String(req.user._id) && req.user.role !== 'admin') throw fail(404, 'Order not found'); return o; };
r.get('/:id', protect, h(async (req, res) => res.json({ success: true, order: await own(req) })));
const cancel = async o => { if (!o.stockRestored) { await restore(o.items); o.stockRestored = true; } o.status = 'Cancelled'; await o.save(); };
r.patch('/:id/cancel', protect, h(async (req, res) => { const o = await own(req); if (!['Pending', 'Confirmed'].includes(o.status)) throw fail(400, 'This order can no longer be cancelled'); await cancel(o); res.json({ success: true, order: o }); }));
r.patch('/:id/status', protect, adminOnly, h(async (req, res) => { const { status } = z.object({ status: z.enum(STATUSES) }).parse(req.body); const o = await Order.findById(req.params.id); if (!o) throw fail(404, 'Order not found');
  if (o.status === 'Cancelled' || o.status === 'Delivered') throw fail(400, `Order is already ${o.status}`);
  if (status === 'Cancelled') await cancel(o); else { o.status = status; if (status === 'Delivered') o.paymentStatus = 'Paid'; await o.save(); } res.json({ success: true, order: o }); }));
export default r;
