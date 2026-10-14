import { useState } from 'react'; import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'; import { ShoppingBag, Menu, X, Instagram, Facebook, Phone, Mail } from 'lucide-react'; import { useStore } from '../store';
export const BRAND = { name: 'Sweet Crumbs Bakery', phone: '+91 98765 43210', email: 'hello@sweetcrumbs.example', address: '12 Bakers Lane, Coimbatore' };
const links = [['/shop', 'All Cakes'], ['/birthday-cakes', 'Birthday'], ['/wedding-cakes', 'Wedding'], ['/chocolate-cakes', 'Chocolate'], ['/custom-cakes', 'Custom']];
export default function Layout() {
  const { count, user, logout } = useStore(), [open, setOpen] = useState(false), nav = useNavigate(); const cls = ({ isActive }) => 'py-2 ' + (isActive ? 'font-bold underline underline-offset-8' : 'hover:text-cocoa-700');
  return <div className="flex min-h-screen flex-col">
    <header className="sticky top-0 z-30 border-b border-blush-100 bg-cream/95 backdrop-blur"><div className="wrap flex h-16 items-center justify-between gap-4">
      <Link to="/" className="font-display text-xl font-bold">{BRAND.name}</Link>
      <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">{links.map(([to, t]) => <NavLink key={to} to={to} className={cls}>{t}</NavLink>)}</nav>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-3 sm:flex">{user ? <><Link to="/account" className="hover:underline">{user.name.split(' ')[0]}</Link>{user.role === 'admin' && <Link to="/admin" className="hover:underline">Admin</Link>}<button onClick={async () => { await logout(); nav('/'); }} className="hover:underline">Log out</button></> : <Link to="/login" className="hover:underline">Log in</Link>}</div>
        <Link to="/cart" aria-label={`Cart, ${count} items`} className="relative rounded-full bg-blush-100 p-2.5"><ShoppingBag size={20} />{count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cocoa-700 px-1 text-xs text-white">{count}</span>}</Link>
        <button className="lg:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div></div>
      {open && <nav aria-label="Mobile" className="wrap flex flex-col border-t border-blush-100 pb-4 lg:hidden" onClick={() => setOpen(false)}>{links.map(([to, t]) => <NavLink key={to} to={to} className={cls}>{t}</NavLink>)}
        {user ? <><NavLink to="/account" className={cls}>My account</NavLink>{user.role === 'admin' && <NavLink to="/admin" className={cls}>Admin</NavLink>}<button className="py-2 text-left" onClick={logout}>Log out</button></> : <NavLink to="/login" className={cls}>Log in</NavLink>}</nav>}</header>
    <main className="flex-1"><Outlet /></main>
    <footer className="mt-16 bg-cocoa-900 text-cream"><div className="wrap grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
      <div><p className="font-display text-xl text-white">{BRAND.name}</p><p className="mt-2 text-sm text-blush-100">Cakes baked fresh to order, delivered with care.</p><div className="mt-4 flex gap-3"><a href="https://instagram.com" aria-label="Instagram"><Instagram /></a><a href="https://facebook.com" aria-label="Facebook"><Facebook /></a></div></div>
      <div><p className="mb-2 font-medium text-white">Shop</p>{links.map(([to, t]) => <Link key={to} to={to} className="block py-0.5 text-sm hover:underline">{t}</Link>)}</div>
      <div><p className="mb-2 font-medium text-white">Company</p>{[['/about', 'About us'], ['/contact', 'Contact'], ['/faq', 'FAQ'], ['/privacy', 'Privacy policy'], ['/terms', 'Terms and conditions']].map(([to, t]) => <Link key={to} to={to} className="block py-0.5 text-sm hover:underline">{t}</Link>)}</div>
      <div className="space-y-2 text-sm"><p className="font-medium text-white">Visit us</p><p className="flex gap-2"><Phone size={16} />{BRAND.phone}</p><p className="flex gap-2"><Mail size={16} />{BRAND.email}</p><p>{BRAND.address}</p></div></div></footer></div>;
}
