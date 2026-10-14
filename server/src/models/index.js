import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const userS = new Schema({ name: { type: String, required: true, trim: true, maxlength: 80 }, email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false }, phone: String, address: { line1: String, city: String, state: String, postalCode: String },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' } }, { timestamps: true });
const catS = new Schema({ name: { type: String, required: true, unique: true, trim: true }, slug: { type: String, unique: true } }, { timestamps: true });
catS.pre('validate', function (n) { if (!this.slug) this.slug = slugify(this.name); n(); });
const prodS = new Schema({ name: { type: String, required: true, trim: true, maxlength: 120 }, slug: { type: String, unique: true }, description: { type: String, default: '' },
  images: [String], category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true }, flavours: [String],
  sizes: { type: [{ label: { type: String, required: true }, price: { type: Number, required: true, min: 0 } }], validate: v => v.length > 0 },
  eggless: { type: Boolean, default: true }, available: { type: Boolean, default: true }, stock: { type: Number, default: 0, min: 0 },
  featured: { type: Boolean, default: false }, bestSeller: { type: Boolean, default: false } }, { timestamps: true });
prodS.index({ name: 'text' });
prodS.pre('validate', function (n) { if (!this.slug) this.slug = slugify(this.name) + '-' + Math.random().toString(36).slice(2, 6); n(); });
const orderS = new Schema({ orderNumber: { type: String, unique: true }, idempotencyKey: { type: String, unique: true, sparse: true }, user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [{ product: { type: Schema.Types.ObjectId, ref: 'Product' }, name: String, image: String, size: String, flavour: String, message: String, qty: Number, unitPrice: Number }],
  delivery: { name: String, email: String, phone: String, address: String, city: String, state: String, postalCode: String, date: Date, slot: String, notes: String },
  subtotal: Number, deliveryFee: Number, discount: Number, total: Number,
  paymentMethod: { type: String, enum: ['COD'], default: 'COD' }, paymentStatus: { type: String, enum: ['Unpaid', 'Paid', 'Refunded'], default: 'Unpaid' },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Preparing', 'Ready for Delivery', 'Out for Delivery', 'Delivered', 'Cancelled'], default: 'Pending', index: true },
  stockRestored: { type: Boolean, default: false } }, { timestamps: true });
const msgS = new Schema({ name: { type: String, required: true }, email: { type: String, required: true }, phone: String, subject: { type: String, required: true }, message: { type: String, required: true } }, { timestamps: true });
const newsS = new Schema({ email: { type: String, required: true, unique: true, lowercase: true } }, { timestamps: true });
export const User = models.User || model('User', userS), Category = models.Category || model('Category', catS), Product = models.Product || model('Product', prodS),
  Order = models.Order || model('Order', orderS), ContactMessage = models.ContactMessage || model('ContactMessage', msgS), NewsletterSubscriber = models.NewsletterSubscriber || model('NewsletterSubscriber', newsS);
