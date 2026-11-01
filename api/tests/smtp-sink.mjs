// Local SMTP capture server for the integration test: accepts mail on 127.0.0.1:2525 and appends
// each parsed message to tests/mails.jsonl. Nothing leaves your machine.
import { SMTPServer } from 'smtp-server'
import { simpleParser } from 'mailparser'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'mails.jsonl')
fs.writeFileSync(out, '')
const server = new SMTPServer({
  authOptional: true, allowInsecureAuth: true, disabledCommands: ['STARTTLS'], secure: false,
  onAuth(auth, session, cb) { cb(null, { user: auth.username }) },
  onData(stream, session, cb) {
    simpleParser(stream).then((m) => {
      fs.appendFileSync(out, JSON.stringify({
        envelopeTo: session.envelope.rcptTo.map((r) => r.address), to: m.to?.text, cc: m.cc?.text || null, bcc: m.bcc?.text || null,
        subject: m.subject, hasHtml: Boolean(m.html), text: m.text?.slice(0, 300), html: m.html
      }) + '\n'); cb()
    }).catch(cb)
  }
})
server.listen(2525, '127.0.0.1', () => console.log('SMTP sink listening on 127.0.0.1:2525'))
