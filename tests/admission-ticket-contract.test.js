const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('app.js', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');
const smoke = fs.readFileSync('tests/admission-ticket-smoke.html', 'utf8');

assert(app.includes('testDate:"Sat, Oct 3, 2026"'), 'admission ticket/test card must use the October 3, 2026 SAT date');
assert(!app.includes('Sep 12, 2026'), 'obsolete September 12, 2026 test date must be removed');
assert(app.includes('dob:""'), 'runtime state must retain date of birth');
assert(app.includes('function formatDob('), 'ticket must format stored date of birth');
assert(app.includes('id="setupDob"'), 'exam setup must collect date of birth for the admission ticket');
assert(!app.includes('max="2015-12-31"'), 'DOB field must not impose an arbitrary age cutoff');
assert(app.includes('function admissionTicketPage('), 'admission ticket must have a dedicated page renderer');
assert(app.includes('case"ticket":return shell(admissionTicketPage())'), 'admission ticket must be an explicit runtime screen');
assert(app.includes('s.screen="ticket"'), 'setup completion must route to the explicit ticket screen');
assert(app.includes('if(s.screen==="ticket")'), 'ticket controls must bind only on the ticket screen');
assert(app.includes('if(x.screen==="setup"&&Number(x.setupStep||1)>5)'), 'legacy setup-step ticket state must migrate to the ticket screen');
assert(app.includes('Your SAT<br>Admission Ticket'), 'ticket must use the Bluebook-style title');
assert(app.includes('Digital SAT October 2026 - Admission Ticket'), 'ticket page must use the current outer admission-ticket heading');
assert(app.includes('id="doneTicketBtn"'), 'ticket page must expose a Done action');
assert(app.includes('aria-label="Admission ticket QR code"'), 'ticket QR must be explicitly labelled');
assert(app.includes('const rows=['), 'ticket QR must use a deterministic encoded matrix');
assert(app.includes('const rows=') && app.includes('n=rows.length') && app.includes('x+4'), 'ticket QR must render a fixed matrix with a four-module quiet zone');
assert(app.includes('ticket-masthead'), 'ticket must have a dedicated masthead');
assert(app.includes('ticket-main-head'), 'ticket must separate title and QR header content');
assert(app.includes('ticket-registration'), 'ticket registration number must occupy its own block');
assert(app.includes('ticket-date'), 'ticket date must occupy its own block');
assert(app.includes('ticket-times'), 'ticket arrival and doors-close fields must share the time row');
assert(app.includes('ticket-location'), 'ticket location must occupy its own block');
assert(app.includes('admission-ticket-page'), 'ticket must use a standalone page surface');
assert(app.includes('doneTicketBtn'), 'ticket page must bind its Done action');
assert(app.includes('ticket-identity'), 'ticket must expose identity fields');
assert(app.includes('Registration Number'), 'ticket must show the registration number');
assert(app.includes('Location'), 'ticket must show the test location');
assert(app.includes('locAddress:'), 'ticket must keep a separate published center address');
assert(app.includes('!(s.dob||"").trim()'), 'exam setup must require a date of birth before continuing');
assert(app.includes('Comments'), 'ticket must reserve a comments section');
assert(app.includes('function printAdmissionTicket('), 'ticket Print control must invoke a real print flow');
assert(app.includes('function emailAdmissionTicket('), 'ticket Email control must invoke a real email flow');
assert(css.includes('@media print{body.printing-ticket'), 'ticket must have print-only styling');
assert(!app.includes('sat-badge'), 'old generic SAT badge ticket treatment must be removed');
assert(!app.includes('ticket-grid'), 'old generic ticket grid treatment must be removed');
assert(!css.includes('.ticket-grid'), 'old generic ticket grid CSS must be removed');
for (const token of ['.admit-ticket{', '.ticket-masthead{', '.ticket-main-head{', '.ticket-qr-frame{', '.ticket-identity{', '.ticket-details{', '.ticket-comments{']) {
  assert(css.includes(token), `ticket visual token missing: ${token}`);
}
assert(css.includes('@media(max-width:720px){.admission-ticket-page'), 'ticket must have tablet/mobile responsive layout');
assert(css.includes('@media(max-width:460px){.admission-ticket-page'), 'ticket must have narrow-phone responsive layout');
assert(css.includes('grid-template-columns:minmax(270px,1.02fr) minmax(330px,1.34fr) minmax(190px,.76fr)'), 'ticket must use the wide three-column landscape geometry');
assert(css.includes('@page{size:landscape'), 'ticket print layout must preserve landscape orientation');

assert(index.includes('styles.css?v=28'), 'canonical stylesheet must remain loaded at current asset generation');

for (const marker of [
  'Your SAT\\s*Admission Ticket',
  'October 3 date renders',
  'date of birth renders',
  'registration number renders',
  'location venue renders',
  'location address renders',
  'QR has substantial matrix',
  'ADMISSION TICKET SMOKE COMPLETE'
]) {
  assert(smoke.includes(marker), `ticket smoke coverage missing: ${marker}`);
}

console.log('Admission ticket date, content, QR, visual structure, and responsive contract passed.');
