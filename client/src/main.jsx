import React from 'react'; import ReactDOM from 'react-dom/client'; import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './index.css'; import { StoreProvider, useStore } from './store'; import Layout from './components/Layout';
import Home from './pages/Home'; import Shop from './pages/Shop'; import Product from './pages/Product'; import { Cart, Checkout } from './pages/Cart'; import { Login, Register } from './pages/Auth';
import { Account, Orders, OrderDetail } from './pages/Orders'; import Admin from './pages/Admin'; import { About, Contact, FAQ, Legal, NotFound } from './pages/Info';
const Guard = ({ children, admin }) => { const { user, ready } = useStore(), loc = useLocation(); if (!ready) return <p className="wrap py-20">Loading…</p>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />; if (admin && user.role !== 'admin') return <Navigate to="/" replace />; return children; };
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><StoreProvider><Routes><Route element={<Layout />}>
  <Route index element={<Home />} /><Route path="shop" element={<Shop title="All Cakes" />} />
  {[['birthday', 'Birthday Cakes'], ['wedding', 'Wedding Cakes'], ['chocolate', 'Chocolate Cakes'], ['custom', 'Custom Cakes']].map(([s, t]) => <Route key={s} path={`${s}-cakes`} element={<Shop title={t} category={s} />} />)}
  <Route path="cakes/:id" element={<Product />} /><Route path="cart" element={<Cart />} /><Route path="checkout" element={<Guard><Checkout /></Guard>} />
  <Route path="login" element={<Login />} /><Route path="register" element={<Register />} /><Route path="account" element={<Guard><Account /></Guard>} /><Route path="orders" element={<Guard><Orders /></Guard>} /><Route path="orders/:id" element={<Guard><OrderDetail /></Guard>} />
  <Route path="admin" element={<Guard admin><Admin /></Guard>} /><Route path="about" element={<About />} /><Route path="contact" element={<Contact />} /><Route path="faq" element={<FAQ />} />
  <Route path="privacy" element={<Legal kind="privacy" />} /><Route path="terms" element={<Legal kind="terms" />} /><Route path="*" element={<NotFound />} /></Route></Routes></StoreProvider></BrowserRouter></React.StrictMode>);
