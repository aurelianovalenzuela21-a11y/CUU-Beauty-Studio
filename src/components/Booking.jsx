import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Clock, Loader2, MessageCircle, RefreshCw } from 'lucide-react';
import {
  staffList, findStaff, waLink, studioToday, addDaysStr, weekdayOf, studioInstant,
  formatDate, formatTime, formatMinutes,
} from '../lib.js';

const STEPS = ['Especialista', 'Servicio', 'Fecha y hora', 'Tus datos'];
const DAYS_AHEAD = 21;
const EMPTY_FORM = { name: '', phone: '', email: '' };

export default function Booking({ preselect }) {
  const [step, setStep] = useState(1);
  const [staffId, setStaffId] = useState(null);
  const [serviceId, setServiceId] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [busy, setBusy] = useState([]);
  const [availability, setAvailability] = useState('idle'); // idle | loading | ok | error
  const [refreshKey, setRefreshKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [result, setResult] = useState(null); // { ok: boolean, message?: string }

  const staff = staffId ? findStaff(staffId) : null;
  const service = staff?.services.find(s => s.id === serviceId) || null;

  // Coming from "Agendar con X" elsewhere on the site
  useEffect(() => {
    if (preselect?.staffId && findStaff(preselect.staffId)) {
      resetFrom(1);
      setStaffId(preselect.staffId);
      setStep(2);
    }
  }, [preselect]);

  const today = studioToday();
  const days = useMemo(() => {
    return Array.from({ length: DAYS_AHEAD }, (_, i) => {
      const d = addDaysStr(today, i);
      const slots = staff ? staff.schedule[weekdayOf(d)] || [] : [];
      return { date: d, open: slots.length > 0 };
    });
  }, [today, staff]);

  useEffect(() => {
    if (!date || !staffId) return;
    let cancelled = false;
    setAvailability('loading');
    fetch(`/get-availability?date=${date}&staffId=${staffId}`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then(data => {
        if (cancelled) return;
        setBusy((data.busy || []).map(b => ({ start: new Date(b.start), end: new Date(b.end) })));
        setAvailability('ok');
      })
      .catch(() => {
        if (cancelled) return;
        setBusy([]);
        setAvailability('error');
      });
    return () => { cancelled = true; };
  }, [date, staffId, refreshKey]);

  const slots = useMemo(() => {
    if (!staff || !date) return [];
    const minutes = service?.minutes || 60;
    const cutoff = Date.now() + 30 * 60 * 1000;
    return (staff.schedule[weekdayOf(date)] || []).map(t => {
      const start = studioInstant(date, t);
      const end = new Date(start.getTime() + minutes * 60000);
      const past = start.getTime() < cutoff;
      const taken = busy.some(b => start < b.end && end > b.start);
      return { time: t, disabled: past || taken };
    });
  }, [staff, service, date, busy]);

  function resetFrom(n) {
    if (n <= 1) setStaffId(null);
    if (n <= 2) setServiceId(null);
    if (n <= 3) { setDate(null); setTime(null); setBusy([]); setAvailability('idle'); }
    setNotice(null);
  }

  function goTo(n) {
    setStep(n);
    setNotice(null);
    document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);
    try {
      const res = await fetch('/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId, serviceId, date, time,
          customerName: form.name,
          customerPhone: form.phone,
          customerEmail: form.email,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setResult({ ok: true });
      } else if (res.status === 409 || res.status === 400) {
        setTime(null);
        setRefreshKey(k => k + 1);
        setStep(res.status === 409 ? 3 : 4);
        setNotice(data.error || 'Revisa los datos de tu cita.');
      } else {
        setResult({ ok: false, message: data.error });
      }
    } catch {
      setResult({ ok: false });
    } finally {
      setSubmitting(false);
    }
  }

  function startOver() {
    resetFrom(1);
    setForm(EMPTY_FORM);
    setResult(null);
    goTo(1);
  }

  const summaryText = staff && service && date && time
    ? `Hola ${staff.name}, quiero agendar ${service.name} el ${formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })} a las ${formatTime(time)}. Mi nombre es ${form.name}.`
    : '';

  return (
    <div className="booking">
      {!result && (
        <ol className="booking-steps" aria-label="Pasos para agendar">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const state = step === n ? 'current' : step > n ? 'done' : '';
            return (
              <li key={label} className={state} aria-current={step === n ? 'step' : undefined}>
                <span className="booking-step-dot">{step > n ? <Check size={14} /> : n}</span>
                <span className="booking-step-label">{label}</span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="booking-body">
        {notice && <div className="booking-notice" role="alert">{notice}</div>}

        {result?.ok && (
          <div className="booking-result fade-in">
            <div className="booking-result-icon"><Check size={34} /></div>
            <h3>¡Tu cita está agendada!</h3>
            <p>
              <strong>{service.name}</strong> con {staff.name}<br />
              {formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })} · {formatTime(time)}
            </p>
            <p className="small">Te enviaremos la confirmación por WhatsApp y correo. Si necesitas cambiarla, escríbele a {staff.name}.</p>
            <div className="btn-row center">
              <a className="btn btn-ghost" href={waLink(`Hola ${staff.name}, acabo de agendar ${service.name} desde la web.`, staff.whatsapp)} target="_blank" rel="noreferrer">
                <MessageCircle size={18} /> Escribir a {staff.name}
              </a>
              <button className="btn btn-primary" onClick={startOver}>Agendar otra cita</button>
            </div>
          </div>
        )}

        {result && !result.ok && (
          <div className="booking-result fade-in">
            <div className="booking-result-icon warn">!</div>
            <h3>No pudimos confirmar tu cita en línea</h3>
            <p>{result.message || 'Hubo un problema de conexión.'} Tu horario no se ha guardado todavía: envíanos tus datos por WhatsApp y te la confirmamos enseguida.</p>
            <div className="btn-row center">
              <a className="btn btn-primary" href={waLink(summaryText, staff.whatsapp)} target="_blank" rel="noreferrer">
                <MessageCircle size={18} /> Agendar por WhatsApp
              </a>
              <button className="btn btn-ghost" onClick={() => { setResult(null); setStep(4); }}>
                <RefreshCw size={16} /> Intentar de nuevo
              </button>
            </div>
          </div>
        )}

        {!result && step === 1 && (
          <div className="fade-in">
            <h3 className="booking-title">¿Con quién te gustaría agendar?</h3>
            <div className="pick-staff">
              {staffList.map(s => (
                <button
                  key={s.id}
                  className={`pick-staff-card ${staffId === s.id ? 'selected' : ''}`}
                  onClick={() => { if (s.id !== staffId) resetFrom(2); setStaffId(s.id); goTo(2); }}
                >
                  <img src={s.image} alt="" width="72" height="72" loading="lazy" />
                  <span className="pick-staff-name">{s.name}</span>
                  <span className="pick-staff-role">{s.role}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!result && step === 2 && staff && (
          <div className="fade-in">
            <StaffHeader staff={staff} subtitle="Elige tu servicio" />
            <div className="pick-list">
              {staff.services.map(s => (
                <button
                  key={s.id}
                  className={`pick-row ${serviceId === s.id ? 'selected' : ''}`}
                  onClick={() => { if (s.id !== serviceId) { setTime(null); } setServiceId(s.id); goTo(3); }}
                >
                  <span>
                    <span className="pick-row-title">{s.name}</span>
                    <span className="pick-row-meta"><Clock size={14} /> {formatMinutes(s.minutes)}</span>
                  </span>
                  {serviceId === s.id ? <Check size={20} /> : <ChevronRight size={20} />}
                </button>
              ))}
            </div>
            <div className="booking-nav">
              <button className="btn btn-ghost" onClick={() => goTo(1)}><ArrowLeft size={16} /> Cambiar especialista</button>
            </div>
          </div>
        )}

        {!result && step === 3 && staff && service && (
          <div className="fade-in">
            <StaffHeader staff={staff} subtitle={`${service.name} · ${formatMinutes(service.minutes)}`} />

            <h4 className="booking-label">Día</h4>
            <div className="date-strip" role="listbox" aria-label="Elige un día">
              {days.map(d => (
                <button
                  key={d.date}
                  role="option"
                  aria-selected={date === d.date}
                  disabled={!d.open}
                  className={`date-chip ${date === d.date ? 'selected' : ''}`}
                  onClick={() => { setDate(d.date); setTime(null); setNotice(null); }}
                >
                  <span className="date-chip-dow">{d.date === today ? 'Hoy' : formatDate(d.date, { weekday: 'short' }).replace('.', '')}</span>
                  <span className="date-chip-day">{formatDate(d.date, { day: 'numeric' })}</span>
                  <span className="date-chip-month">{formatDate(d.date, { month: 'short' }).replace('.', '')}</span>
                </button>
              ))}
            </div>

            <h4 className="booking-label">Hora</h4>
            {!date && <p className="muted small">Selecciona un día para ver los horarios.</p>}
            {date && availability === 'loading' && (
              <p className="muted small inline-icon"><Loader2 size={16} className="spin" /> Revisando la agenda de {staff.name}…</p>
            )}
            {date && availability !== 'loading' && (
              <>
                {availability === 'error' && (
                  <p className="muted small">No pudimos revisar la agenda en este momento; confirmaremos la disponibilidad al enviar tu cita.</p>
                )}
                {slots.length === 0 || slots.every(s => s.disabled) ? (
                  <p className="muted small">No quedan horarios para este día. Prueba con otra fecha.</p>
                ) : (
                  <div className="time-grid">
                    {slots.map(s => (
                      <button
                        key={s.time}
                        disabled={s.disabled}
                        className={`time-chip ${time === s.time ? 'selected' : ''}`}
                        onClick={() => setTime(s.time)}
                      >
                        {formatTime(s.time)}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="booking-nav">
              <button className="btn btn-ghost" onClick={() => goTo(2)}><ArrowLeft size={16} /> Servicio</button>
              <button className="btn btn-primary" disabled={!date || !time} onClick={() => goTo(4)}>
                Continuar <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {!result && step === 4 && staff && service && date && time && (
          <form className="fade-in" onSubmit={submit}>
            <div className="booking-summary">
              <img src={staff.image} alt="" width="56" height="56" />
              <div>
                <strong>{service.name}</strong> con {staff.name}
                <span>{formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })} · {formatTime(time)} · {formatMinutes(service.minutes)}</span>
              </div>
            </div>

            <div className="field">
              <label htmlFor="bk-name">Nombre completo</label>
              <input id="bk-name" autoComplete="name" required minLength={2} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="bk-phone">WhatsApp</label>
                <input id="bk-phone" type="tel" inputMode="tel" autoComplete="tel" required pattern="[\d\s\(\)\+\-]{10,}" title="Escribe tu número a 10 dígitos" placeholder="614 123 4567" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="bk-email">Correo electrónico</label>
                <input id="bk-email" type="email" autoComplete="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div className="booking-nav">
              <button type="button" className="btn btn-ghost" onClick={() => goTo(3)}><ArrowLeft size={16} /> Fecha</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <><Loader2 size={18} className="spin" /> Confirmando…</> : <>Confirmar cita <Check size={18} /></>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function StaffHeader({ staff, subtitle }) {
  return (
    <div className="staff-header">
      <img src={staff.image} alt="" width="52" height="52" />
      <div>
        <h3>{staff.name}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}
