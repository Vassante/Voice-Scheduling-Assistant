/**
 * n8n Code Node Logic
 * Purpose: Parses Vapi payload, generates RFC 5545 .ics file, and prepares SendGrid payload.
 */

const data = $input.first().json;

// 1. Robust VAPI parsing
let args;
const rawArgs = 
  data?.body?.message?.toolCalls?.[0]?.function?.arguments ||
  data?.body?.toolCallList?.[0]?.function?.arguments ||
  data?.body?.toolWithToolCallList?.[0]?.toolCall?.function?.arguments;

if (rawArgs) {
  args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
} else {
  args = data?.body || data;
}

if (!args?.datetime) {
  throw new Error(`datetime missing. Full args: ${JSON.stringify(args)}`);
}

// 2. Clean inputs
const name = (args.name || 'Guest').trim();
const email = (args.email || '').trim();
const datetime = args.datetime.trim();
const durationMinutes = parseInt(args.duration) || 60;
const timezone = (args.timezone || 'America/Chicago').trim();
const title = (args.title || `Meeting with ${name}`).trim();

// 3. Time Parsing
const [datePart, timePart] = datetime.split('T');
const [year, month, day] = datePart.split('-');
const [hour, minute] = timePart.split(':');

const startTotalMinutes = parseInt(hour) * 60 + parseInt(minute);
const endTotalMinutes = startTotalMinutes + durationMinutes;
const endHour = String(Math.floor(endTotalMinutes / 60) % 24).padStart(2, '0');
const endMinute = String(endTotalMinutes % 60).padStart(2, '0');

const dtStart = `${year}${month}${day}T${hour}${minute}00`;
const dtEnd = `${year}${month}${day}T${endHour}${endMinute}00`;

// 4. Build ICS with strict CRLF (RFC 5545 Compliance)
const icsLines = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Voice Scheduler//EN',
  'METHOD:REQUEST',
  'BEGIN:VEVENT',
  `UID:${Date.now()}@voicescheduler`,
  `DTSTAMP:${dtStart}Z`,
  `SUMMARY:${title}`,
  `DTSTART;TZID=${timezone}:${dtStart}`,
  `DTEND;TZID=${timezone}:${dtEnd}`,
  `ORGANIZER;CN=${name}:mailto:${email}`,
  `ATTENDEE;CN=${name};RSVP=TRUE:mailto:${email}`,
  'STATUS:CONFIRMED',
  'SEQUENCE:0',
  'BEGIN:VALARM',
  'TRIGGER:-PT15M',
  'ACTION:DISPLAY',
  'DESCRIPTION:Reminder',
  'END:VALARM',
  'END:VEVENT',
  'END:VCALENDAR'
];

const icsString = icsLines.join('\r\n');
const icsBase64 = Buffer.from(icsString, 'utf8').toString('base64');

// 5. Build Deep Links
const gcalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dtStart}/${dtEnd}&ctz=${encodeURIComponent(timezone)}`;

// 6. Refined SendGrid Payload
const sendgridPayload = {
  personalizations: [{
    to: [{ email: email }],
    subject: `Your Meeting: ${title}`
  }],
  from: { email: "vxk230045@utdallas.edu" },
  content: [{
    type: "text/html",
    value: `<p>Hi ${name},</p><p>Your meeting is confirmed. Please see the attached calendar invite.</p><p><a href="${gcalLink}">Add to Google Calendar</a></p>`
  }],
  attachments: [{
    content: icsBase64,
    filename: "invite.ics",
    type: "text/calendar; method=REQUEST",
    disposition: "attachment"
  }]
};

return [{ json: { sendgridPayload } }];
