import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Clock, Loader2, MessageCircle } from 'lucide-react';
import {
  staffList, findStaff, waLink, studioToday, addDaysStr, weekdayOf, studioInstant,
  formatDate, formatTime, formatMinutes,
} from '../lib.js';

const STEPS = ['Especialista', 'Servicio', 'Fecha y hora', 'Confirmar'];
const DAYS_AHEAD = 21;

export default function Booking({ preselect }) {
  const [step, setStep] = useState(1);
  const [staffId, setStaffId] = useState(null);
  const [serviceId, setServiceId] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [name, setName] = useState('');

  const [busy, setBusy] = useState([]);
  const [availability, setAvailability] = useState('idle'); // idle | loading | ok | error
  const [notice, setNotice] = useState(null);

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
  }, [date, staffId]);

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

  const summaryText = staff && service && date && time
    ? `Hola ${staff.name}, quiero agendar una cita desde cuubeauty.com:\n\n💅 Servicio: ${service.name}\n📅 Día: ${formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}\n⏰ Hora: ${formatTime(time)}${name.trim() ? `\n🙋‍♀️ Nombre: ${name.trim()}` : ''}\n\n¿Me confirmas si está disponible?`
    : '';

  return (
    <div className="booking">
      {(
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

        {step === 1 && (
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

        {step === 2 && staff && (
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

        {step === 3 && staff && service && (
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
                  <p className="muted small">No pudimos revisar la agenda en este momento; te confirmarán la disponibilidad por WhatsApp.</p>
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

        {step === 4 && staff && service && date && time && (
          <div className="fade-in">
            <div className="booking-summary">
              <img src={staff.image} alt="" width="56" height="56" />
              <div>
                <strong>{service.name}</strong> con {staff.name}
                <span>{formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })} · {formatTime(time)} · {formatMinutes(service.minutes)}</span>
              </div>
            </div>

            <div className="field">
              <label htmlFor="bk-name">Tu nombre</label>
              <input id="bk-name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder={`Para que ${staff.name} sepa quién eres`} />
            </div>

            <p className="muted small">Al tocar el botón se abre WhatsApp con tu mensaje listo para {staff.name}. Solo envíalo y ella te confirma tu cita.</p>

            <div className="booking-nav">
              <button type="button" className="btn btn-ghost" onClick={() => goTo(3)}><ArrowLeft size={16} /> Fecha</button>
              <a className="btn btn-whatsapp" href={waLink(summaryText, staff.whatsapp)} target="_blank" rel="noreferrer">
                <MessageCircle size={18} /> Agendar por WhatsApp
              </a>
            </div>
          </div>
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
