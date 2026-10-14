import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
export const h = fn => (req, res, next) => fn(req, res, next).catch(next);
export const fail = (status, message) => Object.assign(new Error(message), { status });
export const protect = h(async (req, _res, next) => {
  const t = req.cookies?.token; if (!t) throw fail(401, 'Please log in');
  let id; try { id = jwt.verify(t, process.env.JWT_SECRET).id; } catch { throw fail(401, 'Session expired') }
  const u = await User.findById(id); if (!u) throw fail(401, 'Account not found'); req.user = u; next();
});
export const adminOnly = (req, _res, next) => req.user?.role === 'admin' ? next() : next(fail(403, 'Admin access required'));
export const strip = o => { if (o && typeof o === 'object') for (const k of Object.keys(o)) { if (k.startsWith('$') || k.includes('.')) delete o[k]; else strip(o[k]); } };
export const page = q => { const p = Math.max(1, parseInt(q.page) || 1), l = Math.min(50, Math.max(1, parseInt(q.limit) || 12)); return { p, l, skip: (p - 1) * l }; };
