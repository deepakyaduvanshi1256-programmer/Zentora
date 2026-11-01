import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import http from 'http';
import router from './router/router.js';
import { initSocketServer } from './socketServer.js';
import dbconnect from './config/db.js';

const app = express()

// Render / most hosts sit behind a reverse proxy: needed so rate limiting sees the real client IP.
app.set('trust proxy', 1)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })) // uploads are fetched cross-origin by the app

// ---------------- CORS ----------------
// Allowed browser origins = CORS_ORIGINS (comma separated) + FRONTEND_URL + the Capacitor Android WebView origins.
// If neither CORS_ORIGINS nor FRONTEND_URL is set the API stays open (previous behaviour) and warns,
// so an existing deployment doesn't break the moment this update is deployed.
const configuredOrigins = [
    ...(process.env.CORS_ORIGINS || '').split(','),
    process.env.FRONTEND_URL || ''
].map((o) => o.trim().replace(/\/+$/, '')).filter(Boolean)
const nativeAppOrigins = ['https://localhost', 'http://localhost', 'capacitor://localhost']
if (configuredOrigins.length === 0) {
    console.warn('[security] CORS is open to all origins. Set FRONTEND_URL (and/or CORS_ORIGINS) to restrict it.')
}
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || configuredOrigins.length === 0) return callback(null, true) // non-browser clients / open mode
        if (configuredOrigins.includes(origin) || nativeAppOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true)
        return callback(new Error('Origin not allowed by CORS'))
    }
}))

// ---------------- Rate limiting (JSON shape matches the rest of the API) ----------------
const limitHandler = (message) => (req, res) => res.status(429).json({ code: 429, success: false, message, result: '', error: true })
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: 'draft-7', legacyHeaders: false, handler: limitHandler('Too many requests. Please slow down.') })
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false, handler: limitHandler('Too many login/registration attempts. Try again in a few minutes.') })
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false, handler: limitHandler('Too many messages sent. Try again later.') })

app.get('/health', (req, res) => res.json({ ok: true })) // cheap uptime check (not rate limited)
app.use(apiLimiter)
app.use(['/login', '/register'], authLimiter)
app.use('/contact', contactLimiter)

app.use(express.json())
app.use("/uploads", express.static("uploads"))
app.use(router)

if (!process.env.JWT_SECRET) {
    console.warn('[security] JWT_SECRET is not set — using the insecure built-in development secret. Set JWT_SECRET in your host environment.')
}
dbconnect()
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);
initSocketServer(server);
server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
