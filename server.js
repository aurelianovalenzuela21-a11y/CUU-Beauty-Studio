/*
 * CUU Beauty Studio — servidor de producción (Hostinger, Node 22).
 *
 * Sin dependencias externas: sirve el build de Vite (dist/) y expone la API de citas.
 *
 *   GET  /api/availability?staff=ailyn&service=s1&date=2026-10-01
 *   POST /api/book
 *   GET  /api/health
 *
 * La cita se registra enviando los datos al webhook de n8n "CUU Beauty agenda y whatsapp",
 * que es quien crea el evento en Google Calendar y manda confirmaciones (correo / WhatsApp).
 * La disponibilidad se lee del calendario de cada especialista (vía n8n o, si se configura,
 * directamente con una cuenta de servicio de Google).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const salon = require('./src/data/salon.json');

const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'dist');
const TZ = salon.business.timezoneOffset; // Chihuahua: UTC-6 todo el año (sin horario de verano)

const BOOKING_WEBHOOK_URL = process.env.BOOKING_WEBHOOK_URL || 'https://n8n.cuustudio.com/webhook/book-appointment';
const AVAILABILITY_WEBHOOK_URL = process.env.AVAILABILITY_WEBHOOK_URL || 'https://n8n.cuustudio.com/webhook/cuu-beauty-disponibilidad';
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

// Calendarios de Google de cada especialista (solo se usan con la cuenta de servicio opcional).
const CALENDARS = {
  ailyn: '2a1a8b53eb4e0896c7e717689677d776fc03e9559b2406c81e34689d4e3e9fdf@group.calendar.google.com',
  arely: '1468b98a1bf3fe6cb42b42724d855262a389cd402811bb15a7d2abbc77fd2ffd@group.calendar.google.com',
  jazmine: 'aa433317bf9b7f844e6e09a2b45369d3e63f66f91832d06894f6a228dcaecffc@group.calendar.google.com',
  bere: 'af5ab4ac8f7c0cb8a18dedda14cbaa3261247bde24733aba37d2dda6486345ce@group.calendar.google.com',
};

/* ------------------------------------------------------------------ utilidades de fecha */

const pad = (n) => String(n).padStart(2, '0');
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

/** Fecha y hora actuales en Chihuahua como { date: 'YYYY-MM-DD', minutes }. */
function nowInSalon() {
  const offsetMin = parseOffset(TZ);
  const local = new Date(Date.now() + offsetMin * 60000);
  return {
    date: `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`,
    minutes: local.getUTCHours() * 60 + local.getUTCMinutes(),
  };
}
function parseOffset(off) {
  const m = /^([+-])(\d{2}):(\d{2})$/.exec(off);
  const v = Number(m[2]) * 60 + Number(m[3]);
  return m[1] === '-' ? -v : v;
}
const toMinutes = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
const fromMinutes = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
/** '14:00' -> '02:00 PM' (formato que ya usan los correos de n8n). */
function to12h(hhmm) {
  let h = Number(hhmm.slice(0, 2));
  const suffix = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${pad(h)}:${hhmm.slice(3, 5)} ${suffix}`;
}
const instant = (date, hhmm) => new Date(`${date}T${hhmm}:00${TZ}`).getTime();
function weekday(date) {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}
function daysBetween(a, b) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

/* ------------------------------------------------------------------ datos del salón */

function findStaff(id) {
  return salon.staff.find((s) => s.id === id);
}
function findService(staff, id) {
  return staff && staff.services.find((s) => s.id === id);
}

/* ------------------------------------------------------------------ disponibilidad */

// Citas confirmadas por este servidor recientemente. Cubren los segundos/minutos que tarda n8n
// en crear el evento en Google Calendar, para que nadie pueda tomar el mismo horario mientras tanto.
const recentBookings = []; // { staff, start, end, at }
const RECENT_TTL = 30 * 60 * 1000;

const busyCache = new Map(); // `${staff}|${date}` -> { at, busy }
const BUSY_CACHE_MS = 45 * 1000;

async function fetchJson(url, options = {}, timeoutMs = 7000) {
  const res = await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${new URL(url).host}`);
  return res.json();
}

let googleToken = null; // { token, exp }
async function googleAccessToken() {
  if (googleToken && googleToken.exp > Date.now() + 60000) return googleToken.token;
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: GOOGLE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(unsigned), GOOGLE_PRIVATE_KEY).toString('base64url');
  const data = await fetchJson('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
  });
  googleToken = { token: data.access_token, exp: Date.now() + data.expires_in * 1000 };
  return googleToken.token;
}

/** Convierte eventos de Google Calendar a rangos ocupados [start, end) en milisegundos. */
function eventsToBusy(events, date) {
  const busy = [];
  for (const ev of events || []) {
    if (!ev || ev.status === 'cancelled' || ev.transparency === 'transparent') continue;
    const s = ev.start || {};
    const e = ev.end || {};
    if (s.dateTime && e.dateTime) {
      busy.push([Date.parse(s.dateTime), Date.parse(e.dateTime)]);
    } else if (s.date) {
      // Evento de día completo (vacaciones, día libre...): bloquea todo el día.
      busy.push([instant(date, '00:00'), instant(date, '23:59')]);
    }
  }
  return busy.filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
}

/**
 * Rangos ocupados de una especialista en un día. Devuelve null si no se pudo consultar
 * el calendario (en ese caso se muestran los horarios base sin verificar).
 */
async function getBusy(staffId, date) {
  const key = `${staffId}|${date}`;
  const cached = busyCache.get(key);
  if (cached && Date.now() - cached.at < BUSY_CACHE_MS) return cached.busy;

  let busy = null;
  const timeMin = `${date}T00:00:00${TZ}`;
  const timeMax = `${date}T23:59:59${TZ}`;
  try {
    if (GOOGLE_CLIENT_EMAIL && GOOGLE_PRIVATE_KEY) {
      const token = await googleAccessToken();
      const url =
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDARS[staffId])}/events` +
        `?singleEvents=true&maxResults=100&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`;
      const data = await fetchJson(url, { headers: { Authorization: `Bearer ${token}` } });
      busy = eventsToBusy(data.items, date);
    } else if (AVAILABILITY_WEBHOOK_URL) {
      const url = `${AVAILABILITY_WEBHOOK_URL}?staff=${encodeURIComponent(staffId)}&date=${date}`;
      const data = await fetchJson(url);
      const events = Array.isArray(data) ? data : data.events;
      if (!Array.isArray(events)) throw new Error('Respuesta de disponibilidad inválida');
      busy = eventsToBusy(events, date);
    }
  } catch (err) {
    console.error(`[disponibilidad] ${staffId} ${date}: ${err.message}`);
    busy = null;
  }

  if (busy) busyCache.set(key, { at: Date.now(), busy });
  return busy;
}

function localBusy(staffId) {
  const cutoff = Date.now() - RECENT_TTL;
  while (recentBookings.length && recentBookings[0].at < cutoff) recentBookings.shift();
  return recentBookings.filter((b) => b.staff === staffId).map((b) => [b.start, b.end]);
}

/** Horarios del día con su estado. */
async function computeSlots(staff, service, date) {
  const now = nowInSalon();
  const offset = daysBetween(now.date, date);
  const base = (offset < 0 || offset > salon.business.bookingWindowDays) ? [] : (staff.schedule[String(weekday(date))] || []);
  if (!base.length) return { verified: true, slots: [] };

  const calendarBusy = await getBusy(staff.id, date);
  const busy = [...(calendarBusy || []), ...localBusy(staff.id)];

  const slots = base.map((time) => {
    const start = instant(date, time);
    const end = start + service.minutes * 60000;
    let available = true;
    if (offset === 0 && toMinutes(time) < now.minutes + salon.business.minLeadMinutes) available = false;
    if (available && busy.some(([a, b]) => start < b && a < end)) available = false;
    return { time, label: to12h(time), available };
  });
  return { verified: calendarBusy !== null, slots };
}

/* ------------------------------------------------------------------ API */

const rateBuckets = new Map(); // ip -> [timestamps]
function rateLimited(ip, limit, windowMs) {
  const now = Date.now();
  const list = (rateBuckets.get(ip) || []).filter((t) => now - t < windowMs);
  list.push(now);
  rateBuckets.set(ip, list);
  if (rateBuckets.size > 5000) rateBuckets.clear();
  return list.length > limit;
}
function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '';
}

function sendJson(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(json),
  });
  res.end(json);
}

function readBody(req, limit = 20000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('too large'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function handleAvailability(req, res, url) {
  const staff = findStaff(url.searchParams.get('staff'));
  const service = findService(staff, url.searchParams.get('service'));
  const date = url.searchParams.get('date') || '';
  if (!staff || !service || !DATE_RE.test(date)) return sendJson(res, 400, { error: 'Parámetros inválidos' });
  const result = await computeSlots(staff, service, date);
  sendJson(res, 200, { date, staff: staff.id, service: service.id, ...result });
}

async function handleBook(req, res) {
  if (rateLimited(clientIp(req), 8, 10 * 60 * 1000)) {
    return sendJson(res, 429, { error: 'Demasiados intentos. Espera unos minutos o escríbenos por WhatsApp.' });
  }
  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return sendJson(res, 400, { error: 'Solicitud inválida' });
  }

  // Campo trampa para bots: las personas nunca lo ven ni lo llenan.
  if (body.company) return sendJson(res, 200, { ok: true });

  const staff = findStaff(body.staffId);
  const service = findService(staff, body.serviceId);
  const date = String(body.date || '');
  const time = String(body.time || '');
  const name = String(body.name || '').trim().replace(/\s+/g, ' ').slice(0, 80);
  const email = String(body.email || '').trim().slice(0, 120);
  let phone = String(body.phone || '').replace(/\D/g, '');
  if (phone.length === 10) phone = `52${phone}`;
  if (phone.length === 13 && phone.startsWith('521')) phone = `52${phone.slice(3)}`;

  const errors = {};
  if (!staff || !service) errors.service = 'Elige especialista y servicio.';
  if (!DATE_RE.test(date) || !TIME_RE.test(time)) errors.slot = 'Elige fecha y hora.';
  if (name.length < 3) errors.name = 'Escribe tu nombre completo.';
  if (!/^52\d{10}$/.test(phone)) errors.phone = 'Escribe un WhatsApp de 10 dígitos.';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Revisa tu correo.';
  if (Object.keys(errors).length) return sendJson(res, 422, { error: 'Revisa los datos marcados.', fields: errors });

  // Volver a revisar el horario justo antes de confirmar (evita citas dobles).
  busyCache.delete(`${staff.id}|${date}`);
  const { slots } = await computeSlots(staff, service, date);
  const slot = slots.find((s) => s.time === time);
  if (!slot) return sendJson(res, 409, { error: 'Ese horario no está disponible ese día. Elige otro.' });
  if (!slot.available) return sendJson(res, 409, { error: 'Ese horario se acaba de ocupar. Elige otro, por favor.', code: 'taken' });

  const endTime = fromMinutes(toMinutes(time) + service.minutes);
  // Mismos campos que enviaba la versión anterior del sitio: el flujo de n8n depende de ellos.
  const payload = {
    staffId: staff.id,
    staffName: staff.name,
    staffEmail: staff.email || '',
    staffWhatsapp: staff.whatsapp || '',
    serviceId: service.id,
    serviceName: service.name,
    date,
    time: to12h(time),
    time24Start: time,
    time24End: endTime,
    customerName: name,
    customerPhone: `+${phone}`,
    customerEmail: email,
    timestamp: new Date().toISOString(),
    source: 'cuubeauty.com',
  };

  try {
    const r = await fetch(BOOKING_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12000),
    });
    if (!r.ok) throw new Error(`n8n respondió ${r.status}`);
  } catch (err) {
    console.error(`[cita] No se pudo registrar ${staff.name} ${date} ${time}: ${err.message}`);
    return sendJson(res, 502, {
      error: 'No pudimos registrar tu cita en este momento. Escríbenos por WhatsApp y te agendamos enseguida.',
      code: 'upstream',
    });
  }

  recentBookings.push({ staff: staff.id, start: instant(date, time), end: instant(date, endTime), at: Date.now() });
  busyCache.delete(`${staff.id}|${date}`);
  console.log(`[cita] ${staff.name} · ${service.name} · ${date} ${time}`);
  sendJson(res, 200, { ok: true, booking: { staff: staff.name, service: service.name, date, time, endTime } });
}

/* ------------------------------------------------------------------ archivos estáticos + SEO por ruta */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
};
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.svg', '.txt', '.xml', '.webmanifest']);

const fileCache = new Map(); // ruta -> { raw, gz, br, mtime }
function loadFile(file) {
  const stat = fs.statSync(file);
  const hit = fileCache.get(file);
  if (hit && hit.mtime === stat.mtimeMs) return hit;
  const raw = fs.readFileSync(file);
  const entry = { raw, mtime: stat.mtimeMs, gz: null, br: null };
  if (COMPRESSIBLE.has(path.extname(file)) && raw.length > 1024) {
    entry.br = zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 10 } });
    entry.gz = zlib.gzipSync(raw, { level: 9 });
  }
  fileCache.set(file, entry);
  return entry;
}

function send(req, res, status, body, ext, cacheControl) {
  const headers = {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': cacheControl,
    Vary: 'Accept-Encoding',
  };
  const accept = req.headers['accept-encoding'] || '';
  let payload = body.raw;
  if (body.br && /\bbr\b/.test(accept)) {
    payload = body.br;
    headers['Content-Encoding'] = 'br';
  } else if (body.gz && /\bgzip\b/.test(accept)) {
    payload = body.gz;
    headers['Content-Encoding'] = 'gzip';
  }
  headers['Content-Length'] = payload.length;
  res.writeHead(status, headers);
  res.end(req.method === 'HEAD' ? undefined : payload);
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const DEFAULT_META = {
  title: 'CUU Beauty Studio | Uñas, pedicura spa y faciales en Chihuahua',
  description:
    'Agenda en línea tu cita en CUU Beauty Studio, centro de Chihuahua: manicura rusa, gelish, acrílico, pedicura spa, faciales, cejas HD y lifting de pestañas con especialistas.',
};
function routeMeta(pathname) {
  if (pathname === '/') return DEFAULT_META;
  if (pathname === '/cursos')
    return {
      title: 'Curso de manicura profesional en Chihuahua | CUU Beauty Academy',
      description: 'Curso presencial de 7 días (21 horas): manicura rusa, gel semipermanente, builder gel, polygel, acrílico escultural y efectos de tendencia. Cupo limitado.',
    };
  if (pathname === '/cursos/temario')
    return {
      title: 'Temario del curso de manicura (7 días) | CUU Beauty Academy',
      description: 'Temario día por día del curso completo de manicura profesional de CUU Beauty Studio en Chihuahua.',
    };
  const m = /^\/equipo\/([a-z]+)$/.exec(pathname);
  const staff = m && findStaff(m[1]);
  if (staff)
    return {
      title: `${staff.name}, ${staff.role.toLowerCase()} | CUU Beauty Studio Chihuahua`,
      description: `Agenda con ${staff.name} en CUU Beauty Studio: ${staff.services.map((s) => s.name).join(', ')}.`,
    };
  return null;
}

let indexTemplate = null;
function renderIndex(pathname) {
  const file = path.join(DIST, 'index.html');
  const stat = fs.statSync(file);
  if (!indexTemplate || indexTemplate.mtime !== stat.mtimeMs) {
    indexTemplate = { html: fs.readFileSync(file, 'utf8'), mtime: stat.mtimeMs, rendered: new Map() };
  }
  const meta = routeMeta(pathname);
  const key = meta ? pathname : '404';
  if (!indexTemplate.rendered.has(key)) {
    const m = meta || { title: 'Página no encontrada | CUU Beauty Studio', description: DEFAULT_META.description };
    const canonical = `${salon.business.url}${pathname === '/' ? '/' : pathname}`;
    const html = indexTemplate.html
      .replace(/<title>[^<]*<\/title>/, `<title>${esc(m.title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(m.description)}`)
      .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(m.title)}`)
      .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(m.description)}`)
      .replace(/(<meta property="og:url" content=")[^"]*/, `$1${canonical}`)
      .replace(/(<link rel="canonical" href=")[^"]*/, `$1${canonical}`)
      .replace('<meta name="robots" content="index,follow" />', meta ? '<meta name="robots" content="index,follow" />' : '<meta name="robots" content="noindex" />');
    const raw = Buffer.from(html);
    indexTemplate.rendered.set(key, { raw, gz: zlib.gzipSync(raw), br: zlib.brotliCompressSync(raw) });
  }
  return { status: meta ? 200 : 404, body: indexTemplate.rendered.get(key) };
}

function serveStatic(req, res, pathname) {
  let rel;
  try {
    rel = decodeURIComponent(pathname);
  } catch {
    rel = '/';
  }
  const file = path.normalize(path.join(DIST, rel));
  if (file.startsWith(DIST + path.sep) && path.extname(file)) {
    try {
      if (fs.statSync(file).isFile()) {
        const ext = path.extname(file).toLowerCase();
        const cache = rel.startsWith('/assets/')
          ? 'public, max-age=31536000, immutable'
          : /\.(webp|avif|jpg|jpeg|png|svg|woff2|ico)$/.test(ext)
            ? 'public, max-age=2592000'
            : 'public, max-age=3600';
        return send(req, res, 200, loadFile(file), ext, cache);
      }
    } catch {
      /* no existe: cae al 404 */
    }
    return send(req, res, 404, { raw: Buffer.from('No encontrado') }, '.txt', 'no-store');
  }

  // Redirecciones de rutas antiguas y normalización de barra final.
  if (pathname !== '/' && pathname.endsWith('/')) {
    res.writeHead(301, { Location: pathname.replace(/\/+$/, '') || '/' });
    return res.end();
  }
  const { status, body } = renderIndex(pathname);
  send(req, res, status, body, '.html', 'no-cache');
}

/* ------------------------------------------------------------------ servidor */

const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  let url;
  try {
    url = new URL(req.url, 'http://localhost');
  } catch {
    res.writeHead(400);
    return res.end();
  }
  const { pathname } = url;

  try {
    if (pathname === '/api/health') return sendJson(res, 200, { ok: true, time: new Date().toISOString() });
    if (pathname === '/api/availability' && req.method === 'GET') {
      if (rateLimited(`a:${clientIp(req)}`, 120, 60 * 1000)) return sendJson(res, 429, { error: 'Demasiadas consultas' });
      return await handleAvailability(req, res, url);
    }
    if (pathname === '/api/book' && req.method === 'POST') return await handleBook(req, res);
    if (pathname.startsWith('/api/')) return sendJson(res, 404, { error: 'No encontrado' });
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      return res.end();
    }
    serveStatic(req, res, pathname);
  } catch (err) {
    console.error('[servidor]', err);
    if (!res.headersSent) sendJson(res, 500, { error: 'Error interno' });
    else res.end();
  }
});

server.listen(PORT, () => {
  const source = GOOGLE_CLIENT_EMAIL && GOOGLE_PRIVATE_KEY ? 'Google (cuenta de servicio)' : 'n8n';
  console.log(`Server is listening on port ${PORT} · disponibilidad vía ${source}`);
});

module.exports = { computeSlots, to12h, nowInSalon };
