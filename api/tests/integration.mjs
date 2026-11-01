// End-to-end test of the notification/email system against a RUNNING API + the local SMTP sink.
//
//   1. start MongoDB (any TEST database — the script refuses non-"test" database names)
//   2. node tests/smtp-sink.mjs                         (terminal A)
//   3. API with SMTP_HOST=127.0.0.1 SMTP_PORT=2525 MONGO_URI=.../zentora_test ADMIN_EMAIL=env-admin@example.test node index.js   (terminal B)
//   4. MONGO_URI=.../zentora_test node tests/integration.mjs  (terminal C)
//
// It proves the real HTTP -> controller -> Nodemailer -> SMTP wire path. It does NOT prove Gmail delivery.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { userModel } from '../models/model.js'

const BASE = process.env.API_URL || 'http://127.0.0.1:3999'
const MONGO = process.env.MONGO_URI || ''
const MAILS = process.env.MAILS_FILE || path.join(path.dirname(fileURLToPath(import.meta.url)), 'mails.jsonl')
const ENV_ADMIN = process.env.ADMIN_EMAIL || 'env-admin@example.test'
if (!/test/i.test(MONGO.split('/').pop() || '')) { console.error('Refusing to run: MONGO_URI must point at a database whose name contains "test".'); process.exit(2) }

let pass = 0, failN = 0
const check = (name, cond, extra = '') => { cond ? pass++ : failN++; console.log(`${cond ? '  PASS' : '  FAIL'}  ${name}${cond ? '' : '  <-- ' + extra}`) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const api = async (method, url, body, token) => {
  const res = await fetch(BASE + url, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
  let json = {}; try { json = await res.json() } catch {}
  return { http: res.status, ...json }
}
const mails = () => fs.readFileSync(MAILS, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
const mailsTo = (addr) => mails().filter((m) => m.envelopeTo.includes(addr))
const waitMail = async (pred, ms = 12000) => { const t = Date.now(); while (Date.now() - t < ms) { const f = mails().filter(pred); if (f.length) return f; await sleep(250) } return [] }
const settle = () => sleep(2500) // let background email work finish before asserting "nothing was sent"

const RUN = Date.now().toString(36)
const em = (n) => `${n}.${RUN}@example.test`
const PW = 'Passw0rd!x'
const section = (t) => console.log(`\n== ${t}`)

await mongoose.connect(MONGO)
const adminEmail = em('admin')
await userModel.create({ name: 'Test Admin', email: adminEmail, type: 'admin', password: await bcrypt.hash(PW, 10) })

section('Registration validation & security')
let r = await api('POST', '/register', { type: 'admin', name: 'Evil', email: em('evil'), password: PW })
check('self-registering as admin is rejected', r.code === 400 && !r.success, JSON.stringify(r))
r = await api('POST', '/register', { type: 'user', name: 'X', email: 'not-an-email', password: PW })
check('invalid email rejected', r.code === 400)
r = await api('POST', '/register', { type: 'user', name: 'X', email: em('short'), password: '123' })
check('short password rejected', r.code === 400)

section('Registration emails + admin alerts')
const reg = async (type, name) => api('POST', '/register', { type, name, email: em(name.toLowerCase()), password: PW })
const A = em('alice'), B = em('bob'), C = em('carol'), D = em('dave'), E = em('erin')
for (const [t, n] of [['user', 'Alice'], ['client', 'Bob'], ['client', 'Carol'], ['user', 'Dave'], ['user', 'Erin']]) {
  r = await reg(t, n); check(`register ${n} (${t})`, r.success === true, JSON.stringify(r))
}
let m = await waitMail((x) => x.envelopeTo.includes(A) && /Welcome/.test(x.subject))
check('welcome email delivered to new user (HTML + text)', m.length === 1 && m[0].hasHtml && /Welcome to Freelancing 24x7/.test(m[0].subject), JSON.stringify(m.map(x => x.subject)))
m = await waitMail((x) => x.envelopeTo.includes(adminEmail) && /registered/.test(x.subject) && x.html.includes(A))
check('admin (DB account) emailed about Alice registering', m.length === 1, JSON.stringify(m.map(x => x.subject)))
m = await waitMail((x) => x.envelopeTo.includes(ENV_ADMIN) && /registered/.test(x.subject) && x.html.includes(B))
check('ADMIN_EMAIL address emailed about Bob registering', m.length === 1)
r = await reg('user', 'Alice')
check('duplicate registration rejected', r.code === 400)
r = await api('POST', '/register', { type: 'user', name: 'Alice2', email: A.toUpperCase(), password: PW })
check('duplicate with different letter case rejected', r.code === 400)

section('Login')
const login = async (email) => (await api('POST', '/login', { email, password: PW })).result?.token
const tA = await login(A), tB = await login(B), tC = await login(C), tD = await login(D), tE = await login(E), tAdmin = await login(adminEmail)
check('all six accounts can log in', [tA, tB, tC, tD, tE, tAdmin].every(Boolean))
r = await api('POST', '/login', { email: A, password: 'wrong' }); check('wrong password rejected', r.success === false)
r = await api('POST', '/login', { email: A.toUpperCase(), password: PW }); check('login is case-insensitive on email', r.success === true)
const dId = (await api('GET', '/profile', null, tD)).result._id
r = await api('POST', '/admin-toggle-block-user', { userId: dId, isBlocked: true }, tAdmin)
check('admin can block Dave', r.success === true)
m = await waitMail((x) => x.envelopeTo.includes(D) && /blocked/.test(x.subject))
check('blocked user still receives the account-status email', m.length === 1, JSON.stringify(m.map(x => x.subject)))
r = await api('POST', '/login', { email: D, password: PW }); check('blocked user cannot log in', r.code === 403)
r = await api('POST', '/admin-toggle-block-user', { userId: (await api('GET', '/profile', null, tAdmin)).result._id, isBlocked: true }, tAdmin)
check('admin cannot block an admin account', r.code === 403)

section('Project posted -> eligible recipients, admin, in-app')
const title1 = `Build <script>alert(1)</script> website ${RUN}`
const t0 = Date.now()
r = await api('POST', '/client-post-project', { title: title1, des: 'Need a MERN site', budget: '5000', duration: '2 weeks' }, tB)
const postMs = Date.now() - t0
check('project posted (HTTP response not blocked by email work)', r.success === true && postMs < 2000, `${postMs}ms ${JSON.stringify(r)}`)
const projectId = r.result?._id
await waitMail((x) => x.envelopeTo.includes(E) && /New project/.test(x.subject)); await settle()
const np = mails().filter((x) => /New project:/.test(x.subject) && x.subject.includes(RUN))
const npTo = np.flatMap((x) => x.envelopeTo).filter((a) => a.includes(RUN)).sort()
check('broadcast went to Alice, Carol, Erin only (not owner Bob, blocked Dave, admins)', JSON.stringify(npTo) === JSON.stringify([A, C, E].sort()), JSON.stringify(npTo))
check('every broadcast email has exactly ONE recipient and no cc/bcc (no address exposure)', np.every((x) => x.envelopeTo.length === 1 && !x.cc && !x.bcc && !/,/.test(x.to || '')))
check('project email contains title, budget, deadline and a details link', np.every((x) => /5000/.test(x.html) && /2 weeks/.test(x.html) && /https:\/\/app\.example\.test\//.test(x.html)))
check('HTML in the project title is escaped inside the email', np.every((x) => !x.html.includes('<script>alert(1)') && x.html.includes('&lt;script&gt;')))
check('owner got a "Project posted" confirmation', mailsTo(B).some((x) => /Project posted/.test(x.subject)))
check('admin account got a separate project email', mailsTo(adminEmail).some((x) => /Project posted/.test(x.subject)))
check('ADMIN_EMAIL got a separate project email', mailsTo(ENV_ADMIN).some((x) => /Project posted/.test(x.subject)))
const notifs = async (t) => (await api('GET', '/notifications', null, t)).result
check('Alice has an in-app "new_project" notification', (await notifs(tA)).notifications.some((n) => n.type === 'new_project'))
check('owner Bob has NO new_project in-app notification', !(await notifs(tB)).notifications.some((n) => n.type === 'new_project'))
check('admin has an in-app notification about the project', (await notifs(tAdmin)).notifications.some((n) => n.message.includes('posted a new project')))

section('Bids: submit / accept / reject + ownership')
r = await api('POST', '/developer-place-bid', { projectId, amount: '4500', duration: '10 days', proposal: 'I can do it' }, tA)
check('Alice bid placed', r.success === true, JSON.stringify(r)); const bidA = r.result?._id
r = await api('POST', '/developer-place-bid', { projectId, amount: '4000', duration: '12 days', proposal: 'Cheaper' }, tE)
check('Erin bid placed', r.success === true); const bidE = r.result?._id
m = await waitMail((x) => x.envelopeTo.includes(B) && /New bid/.test(x.subject))
check('client notified by email of the bid (amount included)', m.length >= 1 && /4500/.test(m[0].html))
check('freelancer got a bid-submitted confirmation', (await waitMail((x) => x.envelopeTo.includes(A) && /Bid submitted/.test(x.subject))).length === 1)
check('client has in-app bid_received notification', (await notifs(tB)).notifications.some((n) => n.type === 'bid_received'))
r = await api('POST', '/client-accept-bid', { bidId: bidA }, tC); check("another client CANNOT accept Bob's project bid", r.code === 403, JSON.stringify(r))
r = await api('POST', '/client-reject-bid', { bidId: bidA }, tC); check("another client CANNOT reject Bob's project bid", r.code === 403, JSON.stringify(r))
r = await api('POST', '/client-reject-bid', { bidId: bidE }, tB); check('owner rejects Erin', r.success === true)
m = await waitMail((x) => x.envelopeTo.includes(E) && /Bid update/.test(x.subject))
check('rejected freelancer emailed', m.length === 1)
check('rejected freelancer has in-app bid_rejected', (await notifs(tE)).notifications.some((n) => n.type === 'bid_rejected'))
r = await api('POST', '/client-reject-bid', { bidId: bidE }, tB); check('already-rejected bid cannot be rejected again', r.code === 400)
r = await api('POST', '/client-accept-bid', { bidId: bidA }, tB); check('owner accepts Alice', r.success === true, JSON.stringify(r))
m = await waitMail((x) => x.envelopeTo.includes(A) && /accepted/.test(x.subject))
check('accepted freelancer emailed', m.length === 1)
check('accepted freelancer has in-app bid_accepted', (await notifs(tA)).notifications.some((n) => n.type === 'bid_accepted'))
r = await api('POST', '/client-accept-bid', { bidId: bidA }, tB); check('accepting twice is refused', r.code === 400)
r = await api('POST', '/admin-delete-bid', { bidId: bidA }, tAdmin); check('admin cannot delete the accepted bid of an active project', r.code === 400)
r = await api('POST', '/admin-delete-bid', { bidId: bidE }, tAdmin); check('admin can delete a rejected bid', r.success === true)

section('Profile update email + preferences')
const before = mailsTo(A).length
r = await api('POST', '/update-profile', { name: 'Alice Updated', bio: 'Full-stack dev' }, tA); check('profile updated', r.success === true)
m = await waitMail((x) => x.envelopeTo.includes(A) && /profile was updated/i.test(x.subject))
check('profile-updated email lists the changed fields', m.length === 1 && /name/.test(m[0].html) && /bio/.test(m[0].html))
await api('POST', '/update-profile', { name: 'Alice Updated' }, tA); await settle()
check('saving with NO changes sends no email', mailsTo(A).filter((x) => /profile was updated/i.test(x.subject)).length === 1)
await api('POST', '/update-profile', { emailPrefs: { profile: false } }, tA)
await api('POST', '/update-profile', { bio: 'changed again' }, tA); await settle()
check('user who opted out of profile emails gets none', mailsTo(A).filter((x) => /profile was updated/i.test(x.subject)).length === 1)

section('In-app notification management')
let n = await notifs(tA)
check('unread count is reported', n.unreadCount > 0, JSON.stringify(n.unreadCount))
r = await api('POST', '/notifications-mark-read', { notificationId: n.notifications[0]._id }, tA); check('mark one as read', r.success === true)
r = await api('POST', '/notifications-mark-all-read', {}, tA); check('mark all as read', r.success === true && (await notifs(tA)).unreadCount === 0)
const delId = n.notifications[0]._id
r = await api('POST', '/notifications-delete', { notificationId: delId }, tA); check('delete one notification', r.success === true)
check('deleted notification is gone', !(await notifs(tA)).notifications.some((x) => x._id === delId))
r = await api('POST', '/notifications-delete', { notificationId: delId }, tB); check("cannot delete someone else's notification", r.code === 404)
r = await api('POST', '/notifications-delete-read', {}, tA); check('clear all read notifications', r.success === true && (await notifs(tA)).notifications.length === 0)

section('Admin: settings, logs, activity, access control')
r = await api('GET', '/admin-email-logs', null, tA); check('non-admin is forbidden from email logs', r.http === 403)
r = await api('GET', '/admin-email-settings', null, tAdmin); check('admin can read settings (SMTP password never returned)', r.success && r.result.types.length > 5 && !JSON.stringify(r).includes('"pass"'))
r = await api('POST', '/admin-email-settings', { disabledTypes: ['new_project', 'nonsense'] }, tAdmin); check('unknown email type rejected', r.code === 400)
r = await api('POST', '/admin-email-settings', { disabledTypes: ['new_project'] }, tAdmin); check('admin disables the new_project email type', r.success === true)
const cnt0 = mails().filter((x) => /New project:/.test(x.subject)).length
r = await api('POST', '/client-post-project', { title: `Second project ${RUN}`, des: 'x', budget: '100', duration: '1 day' }, tB); check('project still posts while emails are disabled', r.success === true)
await settle()
check('no new_project emails were sent while disabled', mails().filter((x) => /New project:/.test(x.subject)).length === cnt0)
r = await api('GET', '/admin-email-logs?status=skipped&type=new_project', null, tAdmin)
check('delivery log records the skips as disabled_by_admin', r.success && r.result.logs.length > 0 && r.result.logs.every((l) => l.reason === 'disabled_by_admin'), JSON.stringify(r.result?.logs?.[0]))
await api('POST', '/admin-email-settings', { disabledTypes: [] }, tAdmin)
r = await api('GET', '/admin-email-logs?status=sent', null, tAdmin); check('delivery log has sent entries + 7-day stats', r.success && r.result.logs.length > 0 && r.result.stats7d.sent > 0)
r = await api('POST', '/admin-email-test', { send: true }, tAdmin)
check('admin SMTP test: handshake OK and real test email sent', r.result?.smtpOk === true && r.result?.sent === true, JSON.stringify(r))
check('test email actually arrived at the SMTP server', (await waitMail((x) => x.envelopeTo.includes(adminEmail) && /SMTP test/.test(x.subject))).length === 1)
r = await api('GET', '/admin-activity', null, tAdmin); check('admin activity feed returns items', r.success && r.result.length > 0)

section('Duplicate-notification prevention (service level)')
// this process talks to the same local SMTP sink the API uses
Object.assign(process.env, { SMTP_HOST: '127.0.0.1', SMTP_PORT: '2525', SMTP_SECURE: 'false', SMTP_USER: 'tester', SMTP_PASS: 'tester', SMTP_FROM: 'noreply@example.test' })
const { sendEmail } = await import('../services/email.service.js')
const dk = `dupe:${RUN}`
const first = await sendEmail({ to: A, type: 'general', subject: 'dupe test', html: '<p>x</p>', text: 'x', dedupeKey: dk })
const second = await sendEmail({ to: A, type: 'general', subject: 'dupe test', html: '<p>x</p>', text: 'x', dedupeKey: dk })
check('first send succeeds, identical second send is skipped as duplicate', first.ok === true && second.skipped === 'duplicate', JSON.stringify({ first, second }))
const bad = await sendEmail({ to: 'a@b.com\nBcc: victim@x.com', type: 'general', subject: 's', html: 'x', text: 'x' })
check('header-injection style address is refused', bad.skipped === 'invalid_email')

section('API rate limiting')
let limited = 0
for (let i = 0; i < 40; i++) { const x = await api('POST', '/login', { email: 'nobody@example.test', password: 'x' }); if (x.http === 429) limited++ }
check('login endpoint returns HTTP 429 after repeated attempts', limited > 0, `limited=${limited}`)

await mongoose.disconnect()
console.log(`\n${pass} passed, ${failN} failed`)
process.exit(failN ? 1 : 0)
