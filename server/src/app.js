import express from 'express'; import helmet from 'helmet'; import cors from 'cors'; import cookieParser from 'cookie-parser'; import { ZodError } from 'zod';
import auth from './routes/auth.js'; import { products, categories } from './routes/catalog.js'; import orders from './routes/orders.js'; import { admin, pub } from './routes/admin.js'; import { strip } from './utils/http.js';
export const app = express(); const allowed = () => (process.env.CLIENT_URL || 'http://localhost:5173').split(',');
app.use(helmet()); app.use(cors({ origin: (o, cb) => cb(null, !o || allowed().includes(o)), credentials: true })); app.use(express.json({ limit: '20kb' })); app.use(cookieParser());
app.use((req, res, next) => { if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers.origin && !allowed().includes(req.headers.origin)) return res.status(403).json({ success: false, message: 'Origin not allowed' });
  strip(req.body); strip(req.query); next(); }); // CSRF: SameSite=lax cookie + JSON-only bodies + Origin check
app.use('/api/auth', auth); app.use('/api/products', products); app.use('/api/categories', categories); app.use('/api/orders', orders); app.use('/api/admin', admin); app.use('/api', pub);
app.use('/api', (_q, res) => res.status(404).json({ success: false, message: 'Not found' }));
app.use((e, _q, res, _n) => { if (e instanceof ZodError) return res.status(400).json({ success: false, message: e.issues[0].path.join('.') + ': ' + e.issues[0].message });
  if (e.name === 'CastError') return res.status(404).json({ success: false, message: 'Not found' }); if (e.code === 11000) return res.status(409).json({ success: false, message: 'Already exists' });
  if (!e.status) console.error(e); res.status(e.status || 500).json({ success: false, message: e.status ? e.message : 'Something went wrong' }); });
