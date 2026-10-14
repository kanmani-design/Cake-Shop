import { useEffect, useState } from 'react'; import { api, errMsg } from '../api'; import { ProductCard, State } from '../components/ui';
export default function Shop({ title, category }) {
  const [f, setF] = useState({ q: '', sort: '', maxPrice: '', page: 1 }), [d, setD] = useState(), [err, setErr] = useState(''), [load, setLoad] = useState(true);
  useEffect(() => { setF(x => ({ ...x, page: 1 })); }, [category]);
  useEffect(() => { setLoad(true); setErr(''); const t = setTimeout(() => api.get('/products', { params: { ...f, category, limit: 8 } }).then(r => setD(r.data)).catch(e => setErr(errMsg(e))).finally(() => setLoad(false)), 250); return () => clearTimeout(t); }, [f, category]);
  const set = k => e => setF({ ...f, [k]: e.target.value, page: k === 'page' ? e.target.value : 1 });
  return <div className="wrap py-10"><h1 className="text-4xl">{title}</h1>
    <div className="mt-6 grid gap-3 sm:grid-cols-3"><div><label htmlFor="q" className="sr-only">Search</label><input id="q" className="input" placeholder="Search cakes" value={f.q} onChange={set('q')} /></div>
      <div><label htmlFor="mp" className="sr-only">Max price</label><select id="mp" className="input" value={f.maxPrice} onChange={set('maxPrice')}><option value="">Any price</option>{[1000, 2000, 5000].map(v => <option key={v} value={v}>Up to ₹{v}</option>)}</select></div>
      <div><label htmlFor="so" className="sr-only">Sort</label><select id="so" className="input" value={f.sort} onChange={set('sort')}><option value="">Newest</option><option value="popular">Most popular</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select></div></div>
    <div className="mt-8"><State loading={load} error={err} empty={d && !d.items.length && 'No cakes match your search. Try a different name or price.'} n={8}><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{d?.items.map(p => <ProductCard key={p._id} p={p} />)}</div>
      {d?.pages > 1 && <div className="mt-8 flex items-center justify-center gap-4"><button className="btn-soft" disabled={f.page <= 1} onClick={() => setF({ ...f, page: f.page - 1 })}>Previous</button><span>Page {d.page} of {d.pages}</span><button className="btn-soft" disabled={f.page >= d.pages} onClick={() => setF({ ...f, page: f.page + 1 })}>Next</button></div>}</State></div></div>;
}
