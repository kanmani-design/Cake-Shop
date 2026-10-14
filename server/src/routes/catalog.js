import { Router } from 'express'; import { z } from 'zod'; import { Product, Category } from '../models/index.js'; import { h, fail, protect, adminOnly, page } from '../utils/http.js';
export const products = Router(), categories = Router();
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), isId = s => /^[a-f\d]{24}$/i.test(s);
const body = z.object({ name: z.string().trim().min(2).max(120), description: z.string().max(3000).optional(), images: z.array(z.string().url()).max(8).optional(), category: z.string().regex(/^[a-f\d]{24}$/i),
  flavours: z.array(z.string().max(40)).max(20).optional(), sizes: z.array(z.object({ label: z.string().min(1).max(40), price: z.number().min(0) })).min(1), eggless: z.boolean().optional(),
  available: z.boolean().optional(), stock: z.number().int().min(0).optional(), featured: z.boolean().optional(), bestSeller: z.boolean().optional() });
products.get('/', h(async (req, res) => { const q = req.query, f = {}, { p, l, skip } = page(q);
  if (q.q) f.name = new RegExp(esc(String(q.q).slice(0, 60)), 'i');
  if (q.category) { const c = await Category.findOne({ slug: String(q.category) }); f.category = c?._id || null; }
  if (q.minPrice || q.maxPrice) f['sizes.0.price'] = { ...(q.minPrice && { $gte: +q.minPrice || 0 }), ...(q.maxPrice && { $lte: +q.maxPrice || 1e9 }) };
  const sort = { price_asc: { 'sizes.0.price': 1 }, price_desc: { 'sizes.0.price': -1 }, popular: { bestSeller: -1, featured: -1 } }[q.sort] || { createdAt: -1 };
  const [items, total] = await Promise.all([Product.find(f).populate('category', 'name slug').sort(sort).skip(skip).limit(l), Product.countDocuments(f)]);
  res.json({ success: true, items, total, page: p, pages: Math.ceil(total / l) }); }));
products.get('/featured', h(async (_q, res) => { const sel = { available: true }, pop = 'name slug';
  const [bestSellers, newArrivals, featured] = await Promise.all([Product.find({ ...sel, bestSeller: true }).limit(4).populate('category', pop), Product.find(sel).sort({ createdAt: -1 }).limit(4).populate('category', pop), Product.find({ ...sel, featured: true }).limit(4).populate('category', pop)]);
  res.json({ success: true, bestSellers, newArrivals, featured }); }));
products.get('/:id', h(async (req, res) => { const k = req.params.id; const p = await Product.findOne(isId(k) ? { _id: k } : { slug: k }).populate('category', 'name slug');
  if (!p) throw fail(404, 'Cake not found'); res.json({ success: true, product: p }); }));
products.post('/', protect, adminOnly, h(async (req, res) => res.status(201).json({ success: true, product: await Product.create(body.parse(req.body)) })));
products.put('/:id', protect, adminOnly, h(async (req, res) => { const p = await Product.findByIdAndUpdate(req.params.id, body.partial().parse(req.body), { new: true, runValidators: true });
  if (!p) throw fail(404, 'Cake not found'); res.json({ success: true, product: p }); }));
products.delete('/:id', protect, adminOnly, h(async (req, res) => { if (!(await Product.findByIdAndDelete(req.params.id))) throw fail(404, 'Cake not found'); res.json({ success: true }); }));
const cat = z.object({ name: z.string().trim().min(2).max(60) });
categories.get('/', h(async (_q, res) => res.json({ success: true, items: await Category.find().sort('name') })));
categories.post('/', protect, adminOnly, h(async (req, res) => res.status(201).json({ success: true, category: await Category.create(cat.parse(req.body)) })));
categories.put('/:id', protect, adminOnly, h(async (req, res) => { const c = await Category.findById(req.params.id); if (!c) throw fail(404, 'Not found'); c.name = cat.parse(req.body).name; c.slug = undefined; await c.save(); res.json({ success: true, category: c }); }));
categories.delete('/:id', protect, adminOnly, h(async (req, res) => { if (await Product.exists({ category: req.params.id })) throw fail(409, 'Category still has cakes'); await Category.findByIdAndDelete(req.params.id); res.json({ success: true }); }));
