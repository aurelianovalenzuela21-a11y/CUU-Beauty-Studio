import { business } from './salon';

const pad = (n) => String(n).padStart(2, '0');
const OFFSET_MIN = (() => {
  const m = /^([+-])(\d{2}):(\d{2})$/.exec(business.timezoneOffset);
  const v = Number(m[2]) * 60 + Number(m[3]);
  return m[1] === '-' ? -v : v;
})();

/** Fecha de hoy en Chihuahua (YYYY-MM-DD), sin importar la zona horaria del teléfono. */
export function todayInSalon() {
  const d = new Date(Date.now() + OFFSET_MIN * 60000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function addDays(iso, n) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export const weekdayOf = (iso) => new Date(`${iso}T12:00:00Z`).getUTCDay();

const fmt = (opts) => new Intl.DateTimeFormat('es-MX', { timeZone: 'UTC', ...opts });
const fWeekdayShort = fmt({ weekday: 'short' });
const fDay = fmt({ day: 'numeric' });
const fMonthShort = fmt({ month: 'short' });
const fLong = fmt({ weekday: 'long', day: 'numeric', month: 'long' });
const fMonthYear = fmt({ month: 'long', year: 'numeric' });

const d = (iso) => new Date(`${iso}T12:00:00Z`);
export const weekdayShort = (iso) => fWeekdayShort.format(d(iso)).replace('.', '');
export const dayNumber = (iso) => fDay.format(d(iso));
export const monthShort = (iso) => fMonthShort.format(d(iso)).replace('.', '');
export const longDate = (iso) => fLong.format(d(iso));
export const monthYear = (iso) => fMonthYear.format(d(iso));

export function to12h(hhmm) {
  let h = Number(hhmm.slice(0, 2));
  const suffix = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${hhmm.slice(3, 5)} ${suffix}`;
}

export function addMinutes(hhmm, min) {
  const t = Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5)) + min;
  return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
}

/** Enlace "Agregar a Google Calendar" para la clienta. */
export function googleCalendarLink({ title, date, start, end, details, location }) {
  const stamp = (t) => `${date.replace(/-/g, '')}T${t.replace(':', '')}00`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${stamp(start)}/${stamp(end)}`,
    ctz: 'America/Chihuahua',
    details,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
