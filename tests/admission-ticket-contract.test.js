const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('app.js', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');
const smoke = fs.readFileSync('tests/admission-ticket-smoke.html', 'utf8');

assert(app.includes('testDate:"Sat, Oct 3, 2026"'), 'admission ticket/test card must use the October 3, 2026 SAT date');
assert(app.includes('dob:""'), 'runtime state must retain date of birth');
assert(app.includes('function formatDob('), 'ticket must format stored date of birth');
assert(app.includes('id="setupDob"'), 'exam setup must collect date of birth for the admission ticket');
assert(!app.includes('max="2015-12-31"'), 'DOB field must not impose an arbitrary age cutoff');
assert(app.includes('Your SAT<br>Admission Ticket'), 'ticket must use the Bluebook-style title');
assert(app.includes('aria-label="Admission ticket QR code"'), 'ticket QR must be explicitly labelled');
assert(app.includes('ticket-masthead'), 'ticket must have a dedicated masthead');
assert(app.includes('ticket-main-head'), 'ticket must separate title and QR header content');
assert(app.includes('ticket-identity'), 'ticket must expose identity fields');
assert(app.includes('Registration Number'), 'ticket must show the registration number');
assert(app.includes('Location'), 'ticket must show the test location');
assert(app.includes('locAddress:'), 'ticket must keep a separate published center address');
assert(app.includes('Comments'), 'ticket must reserve a comments section');
assert(app.includes('function printAdmissionTicket('), 'ticket Print control must invoke a real print flow');
assert(app.includes('function emailAdmissionTicket('), 'ticket Email control must invoke a real email flow');
assert(css.includes('@media print{body.printing-ticket'), 'ticket must have print-only styling');
assert(!app.includes('sat-badge'), 'old generic SAT badge ticket treatment must be removed');
assert(!app.includes('ticket-grid'), 'old generic ticket grid treatment must be removed');
for (const token of ['.admit-ticket{', '.ticket-masthead{', '.ticket-main-head{', '.ticket-qr-frame{', '.ticket-identity{', '.ticket-details{', '.ticket-comments{']) {
  assert(css.includes(token), `ticket visual token missing: ${token}`);
}
assert(css.includes('@media(max-width:720px){.ticket-main-head'), 'ticket must have tablet/mobile responsive layout');
assert(css.includes('@media(max-width:460px){.ticket-main-head'), 'ticket must have narrow-phone responsive layout');
assert(index.includes('styles.css?v=23'), 'canonical stylesheet must remain loaded');

for (const marker of [
  'SAT Admission Ticket',
  'Sat, Oct 3, 2026',
  'Date of Birth',
  'Registration Number',
  'International Community School, Pakyi No. 1, Kumasi, Ghana',
  'Admission ticket QR code',
  'ADMISSION TICKET SMOKE COMPLETE'
]) {
  assert(smoke.includes(marker), `ticket smoke coverage missing: ${marker}`);
}

console.log('Admission ticket date, content, QR, visual structure, and responsive contract passed.');
