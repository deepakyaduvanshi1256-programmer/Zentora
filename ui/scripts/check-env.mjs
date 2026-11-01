// Fails the Android build early if the API address was not provided (otherwise the APK would silently talk to localhost).
import fs from 'fs'
const fromFile = fs.existsSync('.env.production') && /^VITE_API_URL=\s*\S+/m.test(fs.readFileSync('.env.production', 'utf8'))
const url = process.env.VITE_API_URL || ''
if (!url && !fromFile) { console.error('\nVITE_API_URL is not set. Example:\n  VITE_API_URL=https://your-api.onrender.com npm run build:android\n'); process.exit(1) }
if (url && !/^https:\/\//.test(url)) { console.error(`\nVITE_API_URL must be an https:// address for the Android app (got "${url}").\n`); process.exit(1) }
console.log('API address OK' + (url ? `: ${url}` : ' (from .env.production)'))
