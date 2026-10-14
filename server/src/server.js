import 'dotenv/config'; import mongoose from 'mongoose'; import { app } from './app.js';
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) { console.error('Set a JWT_SECRET of 16+ characters in server/.env'); process.exit(1); }
await mongoose.connect(process.env.MONGODB_URI); app.listen(process.env.PORT || 5000, () => console.log('API running on port ' + (process.env.PORT || 5000)));
