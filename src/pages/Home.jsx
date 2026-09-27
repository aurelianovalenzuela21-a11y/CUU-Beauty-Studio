import { useState } from 'react';
import Booking from '../components/Booking';
import { useBooking } from '../lib/booking';
import { linkProps, useDocumentMeta } from '../lib/router';
import { business, formatDuration, imgSet, servicesByCategory, staffList, waLink } from '../lib/salon';
import {
  IconArrowRight,
  IconAward,
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconMapPin,
  IconNavigation,
  IconSparkle,
  IconWhatsApp,
} from '../components/Icons';

function Photo({ base, alt, sizes = '(max-width: 700px) 50vw, 400px', eager = false, className }) {
  const img = imgSet(base);
  return (
    <img
      className={className}
      src={img.src}
      srcSet={img.srcSet}
      sizes={sizes}
      alt={alt}
      width="640"
      height="640"
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
    />
  );
}

function Hero() {
  const { startBooking } = useBooking();
  return (
    <section className="hero">
      <div className="hero-glow" aria-hidden="true" />
      <div className="container hero-inner">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="pulse" aria-hidden="true" /> CUU Beauty Studio · Chihuahua
          </span>
          <h1 className="hero-title">
            Todo lo que necesitas, <em>en un mismo lugar.</em>
          </h1>
          <p className="hero-lead">
            Uñas, pedicura spa, faciales, cejas y pestañas con especialistas dedicadas a cada servicio. Elige tu horario y agenda en línea en un minuto.
          </p>
          <div className="hero-ctas">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => startBooking()}>
              <IconCalendar size={20} /> Agendar mi cita
            </button>
            <a className="btn btn-outline btn-lg" {...linkProps('/#servicios')}>
              Ver servicios
            </a>
          </div>
          <ul className="hero-trust">
            <li>
              <IconCheckCircle size={18} /> Confirmación por WhatsApp
            </li>
            <li>
              <IconMapPin size={18} /> Centro de Chihuahua
            </li>
          </ul>
        </div>

        <div className="hero-visual">
          <div className="hero-card hero-card-main">
            <Photo base="/img/portfolio_ailyn_2" alt="Uñas acrílicas en tono vino con diseño dorado" eager sizes="(max-width: 700px) 70vw, 420px" />
          </div>
          <div className="hero-card hero-card-top">
            <Photo base="/img/portfolio_arely_3" alt="Lifting de pestañas" sizes="200px" />
          </div>
          <div className="hero-card hero-card-bottom">
            <Photo base="/img/portfolio_bere_1" alt="Pedicura spa con pétalos" sizes="200px" />
          </div>
          <div className="hero-badge">
            <div className="avatar-stack" aria-hidden="true">
              {staffList.map((s) => {
                const img = imgSet(s.image, 'profile');
                return <img key={s.id} src={`${s.image}-160.webp`} srcSet={img.srcSet} sizes="36px" alt="" width="36" height="36" />;
              })}
            </div>
            <span>
              <strong>{staffList.length} especialistas</strong>
              <small>Agenda con la tuya</small>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Ticker() {
  const items = ['Manicura rusa', 'Gelish', 'Acrílico', 'Esculturales', 'Pedicura spa', 'Cejas HD', 'Lifting de pestañas', 'Faciales', 'Keratina'];
  const row = [...items, ...items];
  return (
    <div className="ticker-wrap" aria-hidden="true">
    <div className="ticker">
      <div className="ticker-track">
        {row.map((t, i) => (
          <span key={i}>
            {t} <IconSparkle size={16} />
          </span>
        ))}
      </div>
    </div>
    </div>
  );
}

function Services() {
  const groups = servicesByCategory();
  const [active, setActive] = useState(groups[0].id);
  const { startBooking } = useBooking();
  const group = groups.find((g) => g.id === active);

  return (
    <section id="servicios" className="section" aria-labelledby="servicios-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Servicios</span>
          <h2 id="servicios-title" className="section-title">
            Elige lo que <em>quieres consentir</em>
          </h2>
          <p className="section-lead">Cada servicio lo hace la especialista de esa área. Toca «Agendar» y vas directo a sus horarios.</p>
        </div>

        <div className="tabs" role="tablist" aria-label="Categorías de servicios">
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              role="tab"
              id={`tab-${g.id}`}
              aria-selected={g.id === active}
              aria-controls={`panel-${g.id}`}
              className="tab"
              onClick={() => setActive(g.id)}
            >
              {g.name}
              <span className="tab-count">{g.items.length}</span>
            </button>
          ))}
        </div>

        <div className="service-list fade-in" role="tabpanel" id={`panel-${group.id}`} aria-labelledby={`tab-${group.id}`} key={group.id}>
          {group.items.map((item) => (
            <article className="service-row" key={item.id}>
              <div className="service-row-main">
                <h3>{item.name}</h3>
                <p>
                  <span>
                    <IconClock size={14} /> {formatDuration(item.minutes)}
                  </span>
                  <span className="dot" aria-hidden="true" />
                  <span className="service-staff">
                    <img src={`${item.staff.image}-160.webp`} alt="" width="22" height="22" loading="lazy" /> con {item.staff.name}
                  </span>
                </p>
              </div>
              <button
                type="button"
                className="btn btn-soft btn-sm"
                onClick={() => startBooking({ staffId: item.staff.id, serviceId: item.id })}
                aria-label={`Agendar ${item.name} con ${item.staff.name}`}
              >
                Agendar <IconArrowRight size={16} />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Team() {
  const { startBooking } = useBooking();
  return (
    <section id="equipo" className="section section-tint" aria-labelledby="equipo-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Nuestro equipo</span>
          <h2 id="equipo-title" className="section-title">
            Especialistas en <em>lo suyo</em>
          </h2>
        </div>
        <div className="team-grid">
          {staffList.map((s) => {
            const img = imgSet(s.image, 'profile');
            return (
              <article className="team-card" key={s.id}>
                <div className="team-photo ring">
                  <img src={img.src} srcSet={img.srcSet} sizes="120px" alt={`${s.name}, ${s.role}`} width="120" height="120" loading="lazy" decoding="async" />
                </div>
                <h3>{s.name}</h3>
                <p className="team-role">{s.role}</p>
                <ul className="team-tags">
                  {s.services.slice(0, 3).map((x) => (
                    <li key={x.id}>{x.name}</li>
                  ))}
                  {s.services.length > 3 && <li>+{s.services.length - 3}</li>}
                </ul>
                <div className="team-actions">
                  <button type="button" className="btn btn-primary btn-sm btn-block" onClick={() => startBooking({ staffId: s.id })}>
                    Agendar<span className="hide-sm">&nbsp;con {s.name}</span>
                  </button>
                  <a className="btn btn-ghost btn-sm btn-block" {...linkProps(`/equipo/${s.id}`)}>
                    {s.portfolio.length ? 'Ver su trabajo' : 'Ver servicios'}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const photos = staffList.flatMap((s) => s.portfolio.map((p) => ({ p, s })));
  const row = [...photos, ...photos];
  return (
    <section className="gallery" aria-label="Algunos de nuestros trabajos">
      <div className="gallery-track">
        {row.map(({ p, s }, i) => (
          <figure key={i} aria-hidden={i >= photos.length}>
            <img src={`${p}-400.webp`} alt={i < photos.length ? `Trabajo de ${s.name}` : ''} width="220" height="220" loading="lazy" decoding="async" />
          </figure>
        ))}
      </div>
    </section>
  );
}

function AcademyBand() {
  return (
    <section className="section" aria-labelledby="academia-title">
      <div className="container">
        <div className="academy">
          <div className="academy-glow" aria-hidden="true" />
          <div className="academy-copy">
            <span className="eyebrow eyebrow-light">
              <IconAward size={16} /> CUU Beauty Academy
            </span>
            <h2 id="academia-title">
              Aprende manicura profesional <em>en 7 días</em>
            </h2>
            <p>Curso presencial de 21 horas: manicura rusa, gel semipermanente, builder gel, polygel, acrílico escultural y efectos de tendencia. Cupo limitado por generación.</p>
            <div className="academy-ctas">
              <a className="btn btn-light btn-lg" {...linkProps('/cursos')}>
                Ver el curso <IconArrowRight size={18} />
              </a>
              <a
                className="btn btn-outline-light btn-lg"
                href={waLink(business.whatsapp, 'Hola, quiero información sobre el curso completo de manicura (7 días).')}
                target="_blank"
                rel="noreferrer"
              >
                <IconWhatsApp size={18} /> Pedir informes
              </a>
            </div>
          </div>
          <ul className="academy-stats">
            <li>
              <strong>7</strong>
              <span>días</span>
            </li>
            <li>
              <strong>21</strong>
              <span>horas</span>
            </li>
            <li>
              <strong>8</strong>
              <span>técnicas</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Location() {
  return (
    <section id="ubicacion" className="section" aria-labelledby="ubicacion-title">
      <div className="container location">
        <div className="location-info">
          <span className="eyebrow">Ubicación</span>
          <h2 id="ubicacion-title" className="section-title">
            Te esperamos en <em>el centro</em>
          </h2>
          <ul className="info-list">
            <li>
              <IconMapPin size={20} />
              <span>
                <strong>{business.address}</strong>
                <br />
                {business.city}, C.P. {business.postalCode}
              </span>
            </li>
            <li>
              <IconClock size={20} />
              <span>
                <strong>Lunes a sábado</strong>
                <br />
                Atención con cita · Domingo cerrado
              </span>
            </li>
            <li>
              <IconWhatsApp size={20} />
              <span>
                <strong>614 286 4898</strong>
                <br />
                Respondemos por WhatsApp
              </span>
            </li>
          </ul>
          <div className="location-ctas">
            <a className="btn btn-primary" href={business.mapsUrl} target="_blank" rel="noreferrer">
              <IconNavigation size={18} /> Cómo llegar
            </a>
            <a className="btn btn-whatsapp" href={waLink(business.whatsapp)} target="_blank" rel="noreferrer">
              <IconWhatsApp size={18} /> WhatsApp
            </a>
          </div>
        </div>
        <div className="map">
          <iframe
            title="Mapa de CUU Beauty Studio en Av. Zaragoza 12, Chihuahua"
            src="https://www.google.com/maps?q=Av.+Ignacio+Zaragoza+12,+Zona+Centro,+31000+Chihuahua,+Chih.&z=16&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  useDocumentMeta(
    'CUU Beauty Studio | Uñas, pedicura spa y faciales en Chihuahua',
    'Agenda en línea tu cita en CUU Beauty Studio, centro de Chihuahua: manicura rusa, gelish, acrílico, pedicura spa, faciales, cejas HD y lifting de pestañas con especialistas.',
  );
  return (
    <>
      <Hero />
      <Ticker />
      <Services />
      <Team />
      <Booking />
      <Gallery />
      <AcademyBand />
      <Location />
    </>
  );
}
