// Creates an admin account. Public registration no longer accepts type:"admin".
// Usage:  node scripts/create-admin.js "Admin Name" admin@example.com 'StrongPassword'
//    or:  NEW_ADMIN_NAME=.. NEW_ADMIN_EMAIL=.. NEW_ADMIN_PASSWORD=.. node scripts/create-admin.js
// Never overwrites an existing account.
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { userModel } from '../models/model.js'

const [, , argName, argEmail, argPass] = process.argv
const name = argName || process.env.NEW_ADMIN_NAME
const email = (argEmail || process.env.NEW_ADMIN_EMAIL || '').trim().toLowerCase()
const password = argPass || process.env.NEW_ADMIN_PASSWORD

if (!name || !email || !password || password.length < 8) {
    console.error('Provide name, email and a password of at least 8 characters.')
    process.exit(1)
}
await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/zentora')
const exists = await userModel.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') })
if (exists) {
    console.error(`An account with ${email} already exists (type: ${exists.type}). Nothing was changed.`)
    await mongoose.disconnect()
    process.exit(1)
}
await userModel.create({ name, email, type: 'admin', password: await bcrypt.hash(password, 10) })
console.log(`Admin created: ${email}`)
await mongoose.disconnect()
