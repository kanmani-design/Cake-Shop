import { createContext, useContext, useEffect, useState, useCallback } from 'react'; import { api } from './api';
const Ctx = createContext(); export const useStore = () => useContext(Ctx);
const load = () => { try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; } };
export function StoreProvider({ children }) {
  const [user, setUser] = useState(null), [ready, setReady] = useState(false), [items, setItems] = useState(load);
  useEffect(() => { api.get('/auth/me').then(r => setUser(r.data.user)).catch(() => {}).finally(() => setReady(true)); }, []);
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(items)); }, [items]);
  const key = i => [i.productId, i.size, i.flavour, i.message].join('|');
  const add = useCallback(it => setItems(c => { const k = key(it), f = c.find(x => key(x) === k); return f ? c.map(x => key(x) === k ? { ...x, qty: Math.min(10, x.qty + it.qty) } : x) : [...c, it]; }), []);
  const setQty = (k, q) => setItems(c => c.map(x => key(x) === k ? { ...x, qty: Math.max(1, Math.min(10, q)) } : x));
  const remove = k => setItems(c => c.filter(x => key(x) !== k));
  const auth = async (path, data) => { const r = await api.post('/auth/' + path, data); setUser(r.data.user); return r.data.user; };
  const logout = async () => { await api.post('/auth/logout'); setUser(null); };
  return <Ctx.Provider value={{ user, ready, items, key, add, setQty, remove, clear: () => setItems([]), count: items.reduce((s, i) => s + i.qty, 0), login: d => auth('login', d), register: d => auth('register', d), logout }}>{children}</Ctx.Provider>;
}
