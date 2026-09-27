import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, MessageCircle, X } from 'lucide-react';
import { findStaff, staffList, waLink, formatMinutes, useReveal } from '../lib.js';
import { Link } from '../components/Link.jsx';

export default function StaffPage({ id, onBookWith }) {
  const staff = findStaff(id);
  const [lightbox, setLightbox] = useState(null);
  useReveal(id);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox(i => (i + 1) % staff.portfolio.length);
      if (e.key === 'ArrowLeft') setLightbox(i => (i - 1 + staff.portfolio.length) % staff.portfolio.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, staff]);

  if (!staff) {
    return (
      <section className="section">
        <div className="container text-center">
          <h1>No encontramos a esa especialista</h1>
          <Link to="/#equipo" className="btn btn-primary">Ver el equipo</Link>
        </div>
      </section>
    );
  }

  const others = staffList.filter(s => s.id !== staff.id);

  return (
    <>
      <section className="page-hero page-hero-sm">
        <div className="hero-glow" aria-hidden="true" />
        <div className="container">
          <Link to="/#equipo" className="back-link"><ArrowLeft size={16} /> Equipo</Link>
          <div className="profile fade-in">
            <img src={staff.image} alt={staff.name} width="160" height="160" className="profile-img" />
            <div>
              <span className="eyebrow">{staff.role}</span>
              <h1>{staff.name}</h1>
              <div className="btn-row">
                <button className="btn btn-primary" onClick={() => onBookWith(staff.id)}>Agendar con {staff.name}</button>
                <a className="btn btn-ghost" href={waLink(`Hola ${staff.name}, me gustaría agendar una cita.`, staff.whatsapp)} target="_blank" rel="noreferrer">
                  <MessageCircle size={18} /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="profile-layout">
            <div>
              <h2 className="h3">Trabajos</h2>
              <div className="gallery gallery-profile">
                {staff.portfolio.map((src, i) => (
                  <button key={src} className="gallery-item reveal" onClick={() => setLightbox(i)} aria-label={`Ampliar foto ${i + 1}`}>
                    <img src={src} alt={`Trabajo de ${staff.name} ${i + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
            <aside className="panel profile-services">
              <h2 className="h3">Servicios</h2>
              <ul className="service-list">
                {staff.services.map(s => (
                  <li key={s.id}>
                    <span>{s.name}</span>
                    <span className="service-time"><Clock size={13} /> {formatMinutes(s.minutes)}</span>
                  </li>
                ))}
              </ul>
              <button className="btn btn-primary btn-block" onClick={() => onBookWith(staff.id)}>Agendar cita</button>
            </aside>
          </div>
        </div>
      </section>

      <section className="section section-tight section-tint">
        <div className="container">
          <h2 className="h3 text-center">Conoce también a</h2>
          <div className="mini-team">
            {others.map(s => (
              <Link key={s.id} to={`/equipo/${s.id}`} className="mini-team-card">
                <img src={s.image} alt="" width="64" height="64" loading="lazy" />
                <span><strong>{s.name}</strong><small>{s.role}</small></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {lightbox !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Foto ampliada" onClick={() => setLightbox(null)}>
          <button className="lightbox-btn close" aria-label="Cerrar"><X size={26} /></button>
          <button className="lightbox-btn prev" aria-label="Anterior" onClick={e => { e.stopPropagation(); setLightbox((lightbox - 1 + staff.portfolio.length) % staff.portfolio.length); }}><ChevronLeft size={30} /></button>
          <img src={staff.portfolio[lightbox]} alt={`Trabajo de ${staff.name}`} onClick={e => e.stopPropagation()} />
          <button className="lightbox-btn next" aria-label="Siguiente" onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % staff.portfolio.length); }}><ChevronRight size={30} /></button>
        </div>
      )}
    </>
  );
}
