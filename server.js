const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const studio = require('./shared/studio.json');

const app = express();
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'dist');

const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
// In most hosting dashboards env vars can't contain real newlines, so the key is stored
// with literal "\n" sequences and converted back here.
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.cuustudio.com/webhook/book-appointment';

// Chihuahua has no DST since 2022, so a fixed offset is exact.
const TZ_OFFSET = studio.timezoneOffset;
const TZ_NAME = 'America/Chihuahua';

// Server-only data: never shipped to the browser.
const CALENDARS = {
    ailyn: '2a1a8b53eb4e0896c7e717689677d776fc03e9559b2406c81e34689d4e3e9fdf@group.calendar.google.com',
    arely: '1468b98a1bf3fe6cb42b42724d855262a389cd402811bb15a7d2abbc77fd2ffd@group.calendar.google.com',
    jazmine: 'aa433317bf9b7f844e6e09a2b45369d3e63f66f91832d06894f6a228dcaecffc@group.calendar.google.com',
    bere: 'af5ab4ac8f7c0cb8a18dedda14cbaa3261247bde24733aba37d2dda6486345ce@group.calendar.google.com'
};
const STAFF_EMAILS = {
    ailyn: 'ailyn332112@gmail.com',
    jazmine: 'Jazminechavez62@gmail.com',
    bere: '',
    arely: 'diana30d@gmail.com'
};

const staffById = Object.fromEntries(studio.staff.map(s => [s.id, s]));

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

// Hashed build assets never change, so let browsers cache them for a year.
app.use('/assets', express.static(path.join(DIST, 'assets'), { immutable: true, maxAge: '1y' }));
app.use(express.static(DIST, { maxAge: '1d', index: false }));

// ---------- Google Calendar ----------

let cachedToken = null;

async function getGoogleAccessToken() {
    if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
        throw new Error('Missing GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY environment variables');
    }
    const now = Math.floor(Date.now() / 1000);
    if (cachedToken && cachedToken.expiresAt - 60 > now) return cachedToken.value;

    const assertion = jwt.sign({
        iss: GOOGLE_CLIENT_EMAIL,
        scope: 'https://www.googleapis.com/auth/calendar',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
    }, GOOGLE_PRIVATE_KEY, { algorithm: 'RS256' });

    const { data } = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion
    }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

    cachedToken = { value: data.access_token, expiresAt: now + (data.expires_in || 3600) };
    return cachedToken.value;
}

async function listBusy(calendarId, date) {
    const token = await getGoogleAccessToken();
    const params = new URLSearchParams({
        timeMin: `${date}T00:00:00${TZ_OFFSET}`,
        timeMax: `${date}T23:59:59${TZ_OFFSET}`,
        singleEvents: 'true',
        maxResults: '100'
    });
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`;
    const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
    return (data.items || [])
        .filter(item => item.status !== 'cancelled' && item.start?.dateTime && item.end?.dateTime)
        .map(item => ({ start: item.start.dateTime, end: item.end.dateTime }));
}

// ---------- Helpers ----------

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

function addMinutes(time, minutes) {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + minutes;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function to12h(time) {
    const [h, m] = time.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
}

function clean(value, max) {
    return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

// Minimal in-memory rate limit for bookings (per IP).
const hits = new Map();
function rateLimited(ip, limit = 8, windowMs = 10 * 60 * 1000) {
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter(t => now - t < windowMs);
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 5000) hits.clear();
    return recent.length > limit;
}

// ---------- API ----------

app.get('/get-availability', async (req, res) => {
    const { date, staffId } = req.query;
    const calendarId = CALENDARS[staffId];
    if (!DATE_RE.test(date || '') || !calendarId) {
        return res.status(400).json({ error: 'Parámetros inválidos' });
    }
    try {
        res.set('Cache-Control', 'no-store');
        res.json({ busy: await listBusy(calendarId, date) });
    } catch (error) {
        console.error('Availability error:', error.response ? JSON.stringify(error.response.data) : error.message);
        res.status(503).json({ error: 'No pudimos consultar la agenda' });
    }
});

app.post('/create-event', async (req, res) => {
    const body = req.body || {};

    // Honeypot: real users never fill this hidden field.
    if (body.website) return res.json({ success: true });
    if (rateLimited(req.ip)) {
        return res.status(429).json({ error: 'Demasiados intentos. Intenta de nuevo en unos minutos.' });
    }

    const staff = staffById[body.staffId];
    const service = staff?.services.find(s => s.id === body.serviceId);
    const { date, time } = body;
    const customerName = clean(body.customerName, 80);
    const customerEmail = clean(body.customerEmail, 120);
    let customerPhone = clean(body.customerPhone, 30).replace(/\D/g, '');
    if (customerPhone.length === 10) customerPhone = '52' + customerPhone;

    if (!staff || !service || !DATE_RE.test(date || '') || !TIME_RE.test(time || '')) {
        return res.status(400).json({ error: 'Datos de la cita incompletos' });
    }
    if (customerName.length < 2 || customerPhone.length < 10 || !/^\S+@\S+\.\S+$/.test(customerEmail)) {
        return res.status(400).json({ error: 'Revisa tu nombre, teléfono y correo' });
    }

    const start = new Date(`${date}T${time}:00${TZ_OFFSET}`);
    const weekday = new Date(`${date}T12:00:00${TZ_OFFSET}`).getUTCDay();
    if (!(staff.schedule[weekday] || []).includes(time) || start.getTime() < Date.now()) {
        return res.status(400).json({ error: 'Ese horario no está disponible' });
    }

    const endTime = addMinutes(time, service.minutes);
    const end = new Date(`${date}T${endTime}:00${TZ_OFFSET}`);
    const calendarId = CALENDARS[staff.id];

    try {
        const busy = await listBusy(calendarId, date);
        const overlaps = busy.some(b => start < new Date(b.end) && end > new Date(b.start));
        if (overlaps) {
            return res.status(409).json({ error: 'Alguien acaba de reservar ese horario. Elige otro, por favor.' });
        }

        const token = await getGoogleAccessToken();
        const { data: event } = await axios.post(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
            {
                summary: `${customerName} - ${service.name}`,
                description: `Cliente: ${customerName}\nTeléfono: +${customerPhone}\nEmail: ${customerEmail}\nServicio: ${service.name} (${service.minutes} min)\nReservado desde cuubeauty.com`,
                start: { dateTime: `${date}T${time}:00`, timeZone: TZ_NAME },
                end: { dateTime: `${date}T${endTime}:00`, timeZone: TZ_NAME }
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // Notifications (email / WhatsApp) go through n8n. A failure here must not undo a saved booking.
        axios.post(N8N_WEBHOOK_URL, {
            staffId: staff.id,
            staffName: staff.name,
            staffEmail: STAFF_EMAILS[staff.id] || '',
            staffWhatsapp: staff.whatsapp,
            serviceId: service.id,
            serviceName: service.name,
            date,
            time: to12h(time),
            time24Start: time,
            time24End: endTime,
            customerName,
            customerPhone: '+' + customerPhone,
            customerEmail,
            timestamp: new Date().toISOString()
        }, { timeout: 10000 }).catch(err => console.error('n8n webhook error:', err.message));

        res.json({ success: true, eventId: event.id });
    } catch (error) {
        console.error('Booking error:', error.response ? JSON.stringify(error.response.data) : error.message);
        res.status(503).json({ error: 'No pudimos guardar tu cita en este momento.' });
    }
});

// Any other route: serve the React app (client-side routing).
app.use((req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
