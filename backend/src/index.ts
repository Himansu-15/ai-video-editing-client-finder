import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env';
import { connectDb } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import { authenticate, authorizeAdmin } from './middleware/auth';

import { AuthController } from './controllers/authController';
import { LeadsController } from './controllers/leadsController';
import { ScraperController } from './controllers/scraperController';
import { SettingsController } from './controllers/settingsController';
import { AdminController } from './controllers/adminController';

const app = express();

// Establish DB connection
connectDb();

// Middleware config
app.use(helmet());
app.use(cors({
  origin: '*', // for development flexibility, configure appropriately in prod
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Health Check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// 1. Auth routes (with rate limiting)
app.post('/api/auth/signup', authLimiter, AuthController.signup);
app.post('/api/auth/login', authLimiter, AuthController.login);
app.get('/api/auth/me', authenticate, AuthController.me);

// 2. Leads routes
// Note: Place '/export' before '/:id' to prevent route parameter collision!
app.get('/api/leads/export', authenticate, LeadsController.exportLeads);
app.get('/api/leads', authenticate, LeadsController.listLeads);
app.patch('/api/leads/:id', authenticate, LeadsController.updateLead);
app.delete('/api/leads/:id', authenticate, LeadsController.deleteLead);
app.post('/api/leads/:id/email', authenticate, LeadsController.generateEmail);

// 3. Scraper routes
app.post('/api/scraper', authenticate, apiLimiter, ScraperController.startScrape);
app.get('/api/scraper/history', authenticate, ScraperController.getSearchHistory);

// 4. Settings routes
app.get('/api/settings', authenticate, SettingsController.getSettings);
app.post('/api/settings', authenticate, SettingsController.updateSettings);

// 5. Admin routes (Admin only)
app.get('/api/admin/stats', authenticate, authorizeAdmin, AdminController.getGlobalStats);

// Centralized Error Handler
app.use(errorHandler);

// Run the server
const server = app.listen(env.PORT, () => {
  console.log(`🚀 Express server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

// Export app and server for integration tests
export { app, server };
export default app;
