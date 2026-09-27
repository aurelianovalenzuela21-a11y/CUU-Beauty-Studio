import { useEffect, useMemo, useRef, useState } from 'react';
import { useBooking } from '../lib/booking';
import { business, findService, findStaff, formatDuration, imgSet, staffList, waLink } from '../lib/salon';
import {
  addDays,
  addMinutes,
  dayNumber,
  googleCalendarLink,
  longDate,
  monthShort,
  to12h,
  todayInSalon,
  weekdayOf,
  weekdayShort,
} from '../lib/dates';
import {
  IconAlert,
  IconArrowLeft,
  IconCalendar,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconMail,
  IconNavigation,
  IconUser,
  IconWhatsApp,
} from './Icons';

const STEPS = ['Especialista', 'Servicio', 'Horario', 'Tus datos'];

function Avatar({ staff, size = 56 }) {
  const img = imgSet(staff.image, 'profile');
  return (
    <img
      className="avatar"
      src={img.src}
      srcSet={img.srcSet}
      sizes={`${size}px`}
      width={size}
      height={size}
      alt=""
      loading="lazy"
      decoding="async"
    />
  );
}

export default function Booking() {
  const { selection, setSelection, reset } = useBooking();
  const staff = findStaff(selection.staffId);
  const service = findService(staff, selection.serviceId);
  const [done, setDone] = useState(null); // datos de la cita confirmada
  const [notice, setNotice] = useState(null); // aviso en el paso de fecha (p. ej. horario ocupado)
  const panelRef = useRef(null);

  let step = 1;
  if (staff) step = 2;
  if (staff && service) step = 3;
  if (staff && service && selection.date && selection.time) step = 4;
  if (done) step = 5;

  const update = (patch) => {
    setNotice(null);
    setSelection((s) => ({ ...s, ...patch }));
  };

  // Al cambiar de paso, lleva la vista al inicio del panel (solo si quedó fuera de pantalla).
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = panelRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.6) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    el.querySelector('[data-step-title]')?.focus({ preventScroll: true });
  }, [step]);

  const goToStep = (n) => {
    if (n <= 1) update({ staffId: null, serviceId: null, date: null, time: null });
    else if (n === 2) update({ serviceId: null, date: null, time: null });
    else if (n === 3) update({ time: null });
  };

  return (
    <section id="agenda" className="section booking-section" aria-labelledby="agenda-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Reserva en línea · 1 minuto</span>
          <h2 id="agenda-title" className="section-title">
            Agenda tu <em>cita</em>
          </h2>
          <p className="section-lead">Elige a tu especialista, el servicio y el horario que te acomode. Te confirmamos por WhatsApp.</p>
        </div>

        <div className="booking" ref={panelRef}>
          {step < 5 && (
            <ol className="stepper" aria-label="Pasos para agendar">
              {STEPS.map((label, i) => {
                const n = i + 1;
                const state = n < step ? 'done' : n === step ? 'current' : 'todo';
                return (
                  <li key={label} className={`stepper-item is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
                    <button type="button" disabled={n >= step} onClick={() => goToStep(n)}>
                      <span className="stepper-dot">{state === 'done' ? <IconCheck size={14} strokeWidth={2.6} /> : n}</span>
                      <span className="stepper-label">{label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="booking-body">
            <div className="booking-main">
              {step === 1 && <StepStaff onPick={(id) => update({ staffId: id, serviceId: null, date: null, time: null })} />}
              {step === 2 && (
                <StepService
                  staff={staff}
                  onPick={(id) => update({ serviceId: id, date: null, time: null })}
                  onBack={() => goToStep(1)}
                />
              )}
              {step === 3 && (
                <StepDateTime
                  staff={staff}
                  service={service}
                  date={selection.date}
                  notice={notice}
                  onDate={(date) => update({ date, time: null })}
                  onTime={(time) => update({ time })}
                  onBack={() => goToStep(2)}
                />
              )}
              {step === 4 && (
                <StepDetails
                  staff={staff}
                  service={service}
                  date={selection.date}
                  time={selection.time}
                  onBack={() => goToStep(3)}
                  onTaken={(msg) => {
                    setSelection((s) => ({ ...s, time: null }));
                    setNotice(msg);
                  }}
                  onDone={(info) => setDone(info)}
                />
              )}
              {step === 5 && (
                <StepDone
                  info={done}
                  onAgain={() => {
                    setDone(null);
                    reset();
                  }}
                />
              )}
            </div>

            {step > 1 && step < 5 && (
              <aside className="booking-summary" aria-label="Resumen de tu cita">
                <h3 className="summary-title">Tu cita</h3>
                <div className="summary-staff">
                  <Avatar staff={staff} size={48} />
                  <div>
                    <strong>{staff.name}</strong>
                    <span>{staff.role}</span>
                  </div>
                </div>
                <dl className="summary-list">
                  <div>
                    <dt>Servicio</dt>
                    <dd>{service ? service.name : <span className="muted">Por elegir</span>}</dd>
                  </div>
                  <div>
                    <dt>Duración</dt>
                    <dd>{service ? formatDuration(service.minutes) : '—'}</dd>
                  </div>
                  <div>
                    <dt>Fecha</dt>
                    <dd className="capitalize">{selection.date ? longDate(selection.date) : <span className="muted">Por elegir</span>}</dd>
                  </div>
                  <div>
                    <dt>Hora</dt>
                    <dd>{selection.time ? to12h(selection.time) : <span className="muted">Por elegir</span>}</dd>
                  </div>
                </dl>
                <p className="summary-foot">
                  <IconNavigation size={14} /> {business.address}
                </p>
              </aside>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Paso 1 */

function StepStaff({ onPick }) {
  return (
    <div className="step fade-in">
      <h3 className="step-title" tabIndex={-1} data-step-title>
        ¿Con quién te gustaría agendar?
      </h3>
      <div className="staff-pick">
        {staffList.map((s) => (
          <button key={s.id} type="button" className="pick-card" onClick={() => onPick(s.id)}>
            <span className="ring">
              <Avatar staff={s} size={64} />
            </span>
            <span className="pick-card-text">
              <strong>{s.name}</strong>
              <span>{s.role}</span>
              <small>{s.services.slice(0, 3).map((x) => x.name).join(' · ')}</small>
            </span>
            <IconChevronRight className="pick-card-arrow" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Paso 2 */

function StepService({ staff, onPick, onBack }) {
  return (
    <div className="step fade-in">
      <h3 className="step-title" tabIndex={-1} data-step-title>
        ¿Qué servicio quieres con {staff.name}?
      </h3>
      <div className="service-pick">
        {staff.services.map((s) => (
          <button key={s.id} type="button" className="service-option" onClick={() => onPick(s.id)}>
            <span>
              <strong>{s.name}</strong>
              <span className="muted">
                <IconClock size={14} /> {formatDuration(s.minutes)}
              </span>
            </span>
            <IconChevronRight />
          </button>
        ))}
      </div>
      <div className="step-actions">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          <IconArrowLeft size={18} /> Cambiar especialista
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Paso 3 */

function useDays(staff) {
  return useMemo(() => {
    const today = todayInSalon();
    const days = [];
    for (let i = 0; i <= business.bookingWindowDays; i++) {
      const iso = addDays(today, i);
      const open = (staff.schedule[String(weekdayOf(iso))] || []).length > 0;
      days.push({ iso, open, isToday: i === 0 });
    }
    return days;
  }, [staff]);
}

function StepDateTime({ staff, service, date, notice, onDate, onTime, onBack }) {
  const days = useDays(staff);
  const [state, setState] = useState({ loading: false, slots: [], verified: true, error: false, key: '' });
  const [reload, setReload] = useState(0);
  const stripRef = useRef(null);

  // Elige automáticamente el primer día con agenda.
  useEffect(() => {
    if (!date) {
      const first = days.find((d) => d.open);
      if (first) onDate(first.iso);
    }
  }, [date, days, onDate]);

  useEffect(() => {
    if (!date) return;
    const key = `${staff.id}|${service.id}|${date}|${reload}`;
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loading: true, error: false, key }));
    fetch(`/api/availability?staff=${staff.id}&service=${service.id}&date=${date}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then((data) => setState({ loading: false, slots: data.slots || [], verified: data.verified !== false, error: false, key }))
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setState({ loading: false, slots: [], verified: false, error: true, key });
      });
    return () => ctrl.abort();
  }, [staff.id, service.id, date, reload]);

  // Si llegamos por "horario ocupado", vuelve a consultar.
  useEffect(() => {
    if (notice) setReload((n) => n + 1);
  }, [notice]);

  // Mantén visible el día elegido dentro de la tira horizontal.
  useEffect(() => {
    const el = stripRef.current?.querySelector('[aria-pressed="true"]');
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [date]);

  const scrollStrip = (dir) => stripRef.current?.scrollBy({ left: dir * 260, behavior: 'smooth' });
  const available = state.slots.filter((s) => s.available);
  const nextOpenDay = () => {
    const idx = days.findIndex((d) => d.iso === date);
    const next = days.slice(idx + 1).find((d) => d.open);
    if (next) onDate(next.iso);
  };

  return (
    <div className="step fade-in">
      <h3 className="step-title" tabIndex={-1} data-step-title>
        Elige día y hora
      </h3>

      <div className="daystrip-wrap">
        <button type="button" className="strip-nav" aria-label="Días anteriores" onClick={() => scrollStrip(-1)}>
          <IconChevronLeft size={18} />
        </button>
        <div className="daystrip" ref={stripRef} role="group" aria-label="Días disponibles">
          {days.map((d) => (
            <button
              key={d.iso}
              type="button"
              className="day"
              disabled={!d.open}
              aria-pressed={d.iso === date}
              aria-label={`${longDate(d.iso)}${d.open ? '' : ' (sin citas)'}`}
              onClick={() => onDate(d.iso)}
            >
              <span className="day-week">{d.isToday ? 'Hoy' : weekdayShort(d.iso)}</span>
              <span className="day-num">{dayNumber(d.iso)}</span>
              <span className="day-month">{monthShort(d.iso)}</span>
            </button>
          ))}
        </div>
        <button type="button" className="strip-nav" aria-label="Días siguientes" onClick={() => scrollStrip(1)}>
          <IconChevronRight size={18} />
        </button>
      </div>

      {notice && (
        <p className="alert alert-warn" role="alert">
          <IconAlert size={18} /> {notice}
        </p>
      )}

      <div className="slots-head">
        <h4>
          <IconClock size={16} /> <span className="capitalize">{date ? longDate(date) : ''}</span>
        </h4>
        {!state.loading && !state.error && state.slots.length > 0 && (
          <span className="muted small">
            {available.length} {available.length === 1 ? 'horario libre' : 'horarios libres'}
          </span>
        )}
      </div>

      <div aria-live="polite" aria-busy={state.loading}>
        {state.loading ? (
          <div className="slots">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} className="slot skeleton" />
            ))}
          </div>
        ) : state.error ? (
          <div className="empty">
            <p>No pudimos consultar la agenda en este momento.</p>
            <button type="button" className="btn btn-soft" onClick={() => setReload((n) => n + 1)}>
              Intentar de nuevo
            </button>
          </div>
        ) : available.length === 0 ? (
          <div className="empty">
            <p>{state.slots.length ? 'Este día ya no quedan horarios libres.' : 'Este día no hay citas.'}</p>
            <button type="button" className="btn btn-soft" onClick={nextOpenDay}>
              Ver el siguiente día <IconChevronRight size={16} />
            </button>
          </div>
        ) : (
          <div className="slots">
            {state.slots.map((s) => (
              <button
                key={s.time}
                type="button"
                className="slot"
                disabled={!s.available}
                aria-label={s.available ? `${to12h(s.time)}, libre` : `${to12h(s.time)}, ocupado`}
                onClick={() => onTime(s.time)}
              >
                {to12h(s.time)}
              </button>
            ))}
          </div>
        )}
      </div>

      {!state.loading && !state.error && !state.verified && state.slots.length > 0 && (
        <p className="hint">Tu horario queda apartado y te lo confirmamos por WhatsApp.</p>
      )}

      <div className="step-actions">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          <IconArrowLeft size={18} /> Cambiar servicio
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Paso 4 */

function StepDetails({ staff, service, date, time, onBack, onTaken, onDone }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', company: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ sending: false, error: null });

  const set = (k) => (e) => {
    let v = e.target.value;
    if (k === 'phone') v = v.replace(/[^\d\s-]/g, '').slice(0, 14);
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 3) e.name = 'Escribe tu nombre completo.';
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length !== 10) e.phone = 'Escribe tu WhatsApp a 10 dígitos.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = 'Revisa tu correo.';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(`f-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    setStatus({ sending: true, error: null });
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId: staff.id, serviceId: service.id, date, time, ...form }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        onDone({ staff, service, date, time, name: form.name.trim().split(' ')[0] });
        return;
      }
      if (res.status === 409) {
        onTaken(data.error || 'Ese horario se acaba de ocupar. Elige otro, por favor.');
        return;
      }
      if (res.status === 422 && data.fields) {
        setErrors(data.fields);
        setStatus({ sending: false, error: null });
        return;
      }
      setStatus({ sending: false, error: data.error || 'No pudimos registrar tu cita.' });
    } catch {
      setStatus({ sending: false, error: 'Parece que no hay conexión. Revisa tu internet o agenda por WhatsApp.' });
    }
  };

  const waText = `Hola ${staff.name}, quiero agendar ${service.name} el ${longDate(date)} a las ${to12h(time)}. Mi nombre es ${form.name || '…'}.`;

  return (
    <form className="step fade-in" onSubmit={submit} noValidate>
      <h3 className="step-title" tabIndex={-1} data-step-title>
        Último paso: tus datos
      </h3>
      <p className="step-sub">
        <span className="chip">
          <IconCalendar size={14} /> <span className="capitalize">{longDate(date)}</span>
        </span>
        <span className="chip">
          <IconClock size={14} /> {to12h(time)}
        </span>
      </p>

      <div className="field">
        <label htmlFor="f-name">
          <IconUser size={16} /> Nombre completo
        </label>
        <input
          id="f-name"
          name="name"
          autoComplete="name"
          value={form.name}
          onChange={set('name')}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'e-name' : undefined}
          placeholder="Ej. Daniela Pérez"
        />
        {errors.name && (
          <span className="field-error" id="e-name">
            {errors.name}
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor="f-phone">
          <IconWhatsApp size={16} /> WhatsApp
        </label>
        <div className="input-prefix">
          <span aria-hidden="true">+52</span>
          <input
            id="f-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={form.phone}
            onChange={set('phone')}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'e-phone' : 'h-phone'}
            placeholder="614 123 4567"
          />
        </div>
        {errors.phone ? (
          <span className="field-error" id="e-phone">
            {errors.phone}
          </span>
        ) : (
          <span className="field-hint" id="h-phone">
            Aquí te llega la confirmación de tu cita.
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor="f-email">
          <IconMail size={16} /> Correo <span className="optional">(opcional)</span>
        </label>
        <input
          id="f-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'e-email' : undefined}
          placeholder="tucorreo@gmail.com"
        />
        {errors.email && (
          <span className="field-error" id="e-email">
            {errors.email}
          </span>
        )}
      </div>

      {/* Campo trampa para bots (oculto a personas y lectores de pantalla). */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-company">Empresa</label>
        <input id="f-company" tabIndex={-1} autoComplete="off" value={form.company} onChange={set('company')} />
      </div>

      {status.error && (
        <div className="alert alert-error" role="alert">
          <IconAlert size={18} />
          <div>
            <p>{status.error}</p>
            <a className="btn btn-whatsapp btn-sm" href={waLink(staff.whatsapp, waText)} target="_blank" rel="noreferrer">
              <IconWhatsApp size={16} /> Agendar por WhatsApp con {staff.name}
            </a>
          </div>
        </div>
      )}

      <div className="step-actions split">
        <button type="button" className="btn btn-ghost" onClick={onBack} disabled={status.sending}>
          <IconArrowLeft size={18} /> Cambiar hora
        </button>
        <button type="submit" className="btn btn-primary btn-lg" disabled={status.sending}>
          {status.sending ? (
            <>
              <span className="spinner" aria-hidden="true" /> Confirmando…
            </>
          ) : (
            <>
              Confirmar cita <IconCheck size={18} strokeWidth={2.4} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ Paso 5 */

function StepDone({ info, onAgain }) {
  const { staff, service, date, time, name } = info;
  const end = addMinutes(time, service.minutes);
  const gcal = googleCalendarLink({
    title: `${service.name} con ${staff.name} · CUU Beauty`,
    date,
    start: time,
    end,
    details: `Tu cita en CUU Beauty Studio. ¿Cambios? Escríbenos: https://wa.me/${staff.whatsapp}`,
    location: `CUU Beauty Studio, ${business.address}, ${business.city}`,
  });

  return (
    <div className="step done fade-in" role="status">
      <div className="done-badge">
        <IconCheck size={34} strokeWidth={2.6} />
      </div>
      <h3 className="step-title" tabIndex={-1} data-step-title>
        ¡Listo{name ? `, ${name}` : ''}! Tu cita quedó agendada
      </h3>
      <p className="muted">En unos momentos te llega la confirmación por WhatsApp.</p>

      <div className="ticket">
        <div className="ticket-row">
          <Avatar staff={staff} size={52} />
          <div>
            <strong>{service.name}</strong>
            <span className="muted">con {staff.name}</span>
          </div>
        </div>
        <div className="ticket-grid">
          <div>
            <span className="muted small">Fecha</span>
            <strong className="capitalize">{longDate(date)}</strong>
          </div>
          <div>
            <span className="muted small">Hora</span>
            <strong>
              {to12h(time)} – {to12h(end)}
            </strong>
          </div>
          <div className="full">
            <span className="muted small">Dónde</span>
            <strong>
              {business.address}, {business.city}
            </strong>
          </div>
        </div>
      </div>

      <div className="done-actions">
        <a className="btn btn-primary" href={gcal} target="_blank" rel="noreferrer">
          <IconCalendar size={18} /> Guardar en mi calendario
        </a>
        <a className="btn btn-soft" href={business.mapsUrl} target="_blank" rel="noreferrer">
          <IconNavigation size={18} /> Cómo llegar
        </a>
      </div>
      <p className="small muted">
        ¿Necesitas cambiar o cancelar?{' '}
        <a href={waLink(staff.whatsapp, `Hola ${staff.name}, necesito cambiar mi cita de ${service.name} del ${longDate(date)}.`)} target="_blank" rel="noreferrer">
          Escríbele a {staff.name} por WhatsApp
        </a>
        .
      </p>
      <button type="button" className="btn btn-ghost" onClick={onAgain}>
        Agendar otra cita
      </button>
    </div>
  );
}
