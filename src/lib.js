import { useEffect, useState } from 'react';
import studio from '../shared/studio.json';

export { studio };
export const staffList = studio.staff;
export const findStaff = (id) => staffList.find(s => s.id === id);

// ---------- WhatsApp ----------

export function waLink(text, number = studio.whatsapp) {
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

// ---------- Time (always in Chihuahua time, whatever the visitor's device says) ----------

const TZ = studio.timezoneOffset;

export function studioInstant(dateStr, time = '00:00') {
  return new Date(`${dateStr}T${time}:00${TZ}`);
}

// "Today" in Chihuahua as yyyy-mm-dd
export function studioToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chihuahua' }).format(new Date());
}

export function addDaysStr(dateStr, days) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weekdayOf(dateStr) {
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay();
}

export function formatDate(dateStr, opts) {
  return new Intl.DateTimeFormat('es-MX', { timeZone: 'UTC', ...opts }).format(new Date(`${dateStr}T12:00:00Z`));
}

export function formatTime(time) {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'p.m.' : 'a.m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function formatMinutes(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

// ---------- Tiny router (History API) ----------

export function navigate(to) {
  const url = new URL(to, window.location.origin);
  const samePage = url.pathname === window.location.pathname;
  if (url.pathname + url.hash !== window.location.pathname + window.location.hash) {
    window.history.pushState({}, '', url.pathname + url.search + url.hash);
  }
  window.dispatchEvent(new Event('app:navigate'));
  scrollToHash(url.hash, samePage);
}

export function scrollToHash(hash, smooth = true) {
  if (!hash) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    return;
  }
  // Wait for the new view to render before scrolling.
  requestAnimationFrame(() => {
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'start' });
  });
}

export function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const update = () => setPath(window.location.pathname);
    window.addEventListener('popstate', update);
    window.addEventListener('app:navigate', update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('app:navigate', update);
    };
  }, []);
  return path;
}

// Reveal-on-scroll for elements with the .reveal class
export function useReveal(key) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [key]);
}
