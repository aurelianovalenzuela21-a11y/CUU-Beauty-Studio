const express = require('express');
const path = require('path');
const axios = require('axios');
const studio = require('./shared/studio.json');

const app = express();
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'dist');

// Google Calendar access lives in n8n (its "Google Calendar account" connection), so this
// server holds no Google credentials. N8N_BOOKING_KEY must match the key in the n8n
// "CUU Beauty reservar (web)" workflow.
const N8N_BASE = process.env.N8N_BASE_URL || 'https://n8n.cuustudio.com/webhook';
const N8N_BOOKING_KEY = process.env.N8N_BOOKING_KEY;

// Chihuahua has no DST since 2022, so a fixed offset is exact.
const TZ_OFFSET = studio.timezoneOffset;

// Server-only data: never shipped to the browser.
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

// ---------- Calendar (through n8n) ----------

async function listBusy(staffId, date) {
    const { data } = await axios.get(`${N8N_BASE}/cuu-beauty-disponibilidad`, {
        params: { staff: staffId, date },
        timeout: 15000
    });
    return (data.events || [])
        .filter(e => e.start?.dateTime && e.end?.dateTime)
        .map(e => ({ start: e.start.dateTime, end: e.end.dateTime }));
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
    if (!DATE_RE.test(date || '') || !staffById[staffId]) {
        return res.status(400).json({ error: 'Parámetros inválidos' });
    }
    try {
        res.set('Cache-Control', 'no-store');
        res.json({ busy: await listBusy(staffId, date) });
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

    try {
        // n8n re-checks the calendar, creates the event and only then sends the
        // WhatsApp / email notifications.
        const { status, data } = await axios.post(`${N8N_BASE}/cuu-beauty-reservar`, {
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
        }, {
            headers: { 'x-cuu-key': N8N_BOOKING_KEY || '' },
            timeout: 30000,
            validateStatus: () => true
        });

        if (status === 200 && data?.success) {
            return res.json({ success: true, eventId: data.eventId });
        }
        if (status === 409) {
            return res.status(409).json({ error: 'Alguien acaba de reservar ese horario. Elige otro, por favor.' });
        }
        console.error('Booking error from n8n:', status, JSON.stringify(data));
        res.status(503).json({ error: 'No pudimos guardar tu cita en este momento.' });
    } catch (error) {
        console.error('Booking error:', error.message);
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
