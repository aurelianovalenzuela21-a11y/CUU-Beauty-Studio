import { useEffect, useState } from 'react';
import { useBooking } from '../lib/booking';
import { linkProps, useDocumentMeta } from '../lib/router';
import { formatDuration, imgSet, waLink } from '../lib/salon';
import { IconArrowLeft, IconArrowRight, IconChevronLeft, IconChevronRight, IconClock, IconWhatsApp, IconX } from '../components/Icons';

export default function Specialist({ staff }) {
  const { startBooking } = useBooking();
  const [open, setOpen] = useState(null); // índice de la foto abierta
  useDocumentMeta(
    `${staff.name}, ${staff.role.toLowerCase()} | CUU Beauty Studio Chihuahua`,
    `Agenda con ${staff.name} en CUU Beauty Studio: ${staff.services.map((s) => s.name).join(', ')}.`,
  );
  const avatar = imgSet(staff.image, 'profile');

  return (
    <div className="page">
      <section className="profile-hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="container narrow">
          <a className="back-link" {...linkProps('/#equipo')}>
            <IconArrowLeft size={18} /> Equipo
          </a>
          <div className="profile-head">
            <div className="ring ring-lg">
              <img src={avatar.src} srcSet={avatar.srcSet} sizes="140px" alt={staff.name} width="140" height="140" />
            </div>
            <div>
              <span className="eyebrow">CUU Beauty Studio</span>
              <h1 className="profile-name">{staff.name}</h1>
              <p className="profile-role">{staff.role}</p>
              <div className="hero-ctas">
                <button type="button" className="btn btn-primary" onClick={() => startBooking({ staffId: staff.id })}>
                  Agendar con {staff.name}
                </button>
                <a className="btn btn-whatsapp" href={waLink(staff.whatsapp, `Hola ${staff.name}, me gustaría agendar una cita.`)} target="_blank" rel="noreferrer">
                  <IconWhatsApp size={18} /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          <h2 className="section-title sm">Servicios</h2>
          <div className="service-list">
            {staff.services.map((s) => (
              <article className="service-row" key={s.id}>
                <div className="service-row-main">
                  <h3>{s.name}</h3>
                  <p>
                    <span>
                      <IconClock size={14} /> {formatDuration(s.minutes)}
                    </span>
                  </p>
                </div>
                <button type="button" className="btn btn-soft btn-sm" onClick={() => startBooking({ staffId: staff.id, serviceId: s.id })} aria-label={`Agendar ${s.name}`}>
                  Agendar <IconArrowRight size={16} />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {staff.portfolio.length > 0 && (
        <section className="section section-tint">
          <div className="container">
            <h2 className="section-title sm center">Su trabajo</h2>
            <div className="portfolio">
              {staff.portfolio.map((p, i) => {
                const img = imgSet(p);
                return (
                  <button key={p} type="button" className="portfolio-item" onClick={() => setOpen(i)} aria-label={`Ampliar foto ${i + 1} de ${staff.portfolio.length}`}>
                    <img src={img.src} srcSet={img.srcSet} sizes="(max-width: 700px) 50vw, 33vw" alt={`Trabajo de ${staff.name} ${i + 1}`} width="640" height="640" loading="lazy" decoding="async" />
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {open !== null && <Lightbox photos={staff.portfolio} index={open} onIndex={setOpen} onClose={() => setOpen(null)} name={staff.name} />}
    </div>
  );
}

function Lightbox({ photos, index, onIndex, onClose, name }) {
  const prev = () => onIndex((index - 1 + photos.length) % photos.length);
  const next = () => onIndex((index + 1) % photos.length);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  });
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Foto ${index + 1} de ${photos.length}`} onClick={onClose}>
      <img src={`${photos[index]}-900.webp`} alt={`Trabajo de ${name} ${index + 1}`} onClick={(e) => e.stopPropagation()} />
      <button type="button" className="lightbox-btn close" aria-label="Cerrar" onClick={onClose} autoFocus>
        <IconX size={24} />
      </button>
      {photos.length > 1 && (
        <>
          <button type="button" className="lightbox-btn prev" aria-label="Anterior" onClick={(e) => { e.stopPropagation(); prev(); }}>
            <IconChevronLeft size={26} />
          </button>
          <button type="button" className="lightbox-btn next" aria-label="Siguiente" onClick={(e) => { e.stopPropagation(); next(); }}>
            <IconChevronRight size={26} />
          </button>
        </>
      )}
    </div>
  );
}
