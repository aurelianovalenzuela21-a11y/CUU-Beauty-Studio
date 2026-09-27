import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CalendarHeart, Clock, MapPin, MessageCircle, Navigation, Sparkles, GraduationCap } from 'lucide-react';
import Booking from '../components/Booking.jsx';
import { staffList, studio, waLink, navigate, formatMinutes, useReveal } from '../lib.js';
import { Link } from '../components/Link.jsx';

const CATEGORIES = [
  {
    id: 'manicure',
    title: 'Manicure y uñas',
    text: 'Manicura rusa, gelish, acrílico, baño de acrílico y esculturales con diseños de tendencia.',
    image: '/portfolio_ailyn_3.jpg',
  },
  {
    id: 'pedicure',
    title: 'Pedicure spa',
    text: 'Pies suaves y cuidados: pedicura spa, clínica y esmaltado, en un espacio para relajarte.',
    image: '/portfolio_bere_1.jpg',
  },
  {
    id: 'facial',
    title: 'Faciales, cejas y pestañas',
    text: 'Cejas HD, lifting de pestañas, faciales de limpieza y reparación, keratina y depilación.',
    image: '/portfolio_arely_3.jpg',
  },
];

const GALLERY = [
  '/portfolio_ailyn_1.jpg', '/portfolio_bere_2.jpg', '/portfolio_ailyn_4.jpg', '/portfolio_arely_2.jpg',
  '/portfolio_ailyn_2.jpg', '/portfolio_jazmine_2.jpg', '/portfolio_bere_3.jpg', '/portfolio_ailyn_5.jpg',
];

export default function Home({ onBookWith, preselect }) {
  useReveal();

  return (
    <>
      <Hero />
      <Services onBookWith={onBookWith} />
      <Team onBookWith={onBookWith} />
      <Gallery />

      <section id="agendar" className="section section-tint">
        <div className="container container-narrow">
          <SectionHead
            eyebrow="Reserva en línea"
            title={<>Agenda tu cita <em>en minutos</em></>}
            text="Elige a tu especialista, el servicio y el horario que te acomode, y envíale tu solicitud por WhatsApp. Ella te confirma en minutos."
          />
          <div className="reveal"><Booking preselect={preselect} /></div>
        </div>
      </section>

      <CoursesTeaser />
      <Location />
    </>
  );
}

function SectionHead({ eyebrow, title, text, align = 'center' }) {
  return (
    <div className={`section-head reveal ${align}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-glow" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-copy fade-in">
          <span className="eyebrow"><Sparkles size={14} /> Beauty studio en Chihuahua</span>
          <h1>Todo lo que necesitas, <em>en un mismo lugar.</em></h1>
          <p className="lead">
            Manicure, pedicure spa, faciales, cejas y pestañas con especialistas que cuidan cada detalle.
            Reserva en línea y llega directo a consentirte.
          </p>
          <div className="btn-row">
            <Link to="/#agendar" className="btn btn-primary btn-lg"><CalendarHeart size={20} /> Agendar cita</Link>
            <Link to="/#servicios" className="btn btn-ghost btn-lg">Ver servicios</Link>
          </div>
          <ul className="hero-facts">
            <li><strong>{staffList.length}</strong> especialistas</li>
            <li><strong>{staffList.reduce((n, s) => n + s.services.length, 0)}</strong> servicios</li>
            <li><strong>24/7</strong> reservas en línea</li>
          </ul>
        </div>

        <div className="hero-art fade-in delay-1" aria-hidden="true">
          <img className="hero-img hero-img-main" src="/portfolio_ailyn_1.jpg" alt="" width="675" height="900" fetchPriority="high" />
          <img className="hero-img hero-img-top" src="/portfolio_arely_3.jpg" alt="" width="900" height="900" />
          <img className="hero-img hero-img-bottom" src="/portfolio_bere_1.jpg" alt="" width="900" height="900" />
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <div>
              <strong>Agenda abierta</strong>
              <span>Lunes a sábado</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map(k => (
            <span key={k}>
              {['Manicura rusa', 'Gelish', 'Uñas acrílicas', 'Pedicura spa', 'Cejas HD', 'Lifting de pestañas', 'Faciales', 'Keratina'].map(t => (
                <span key={t} className="ticker-item">{t}<Sparkles size={14} /></span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services({ onBookWith }) {
  return (
    <section id="servicios" className="section">
      <div className="container">
        <SectionHead
          eyebrow="Servicios"
          title={<>Cuidado de pies a cabeza, <em>hecho con detalle</em></>}
          text="Cada especialista se enfoca en lo que mejor sabe hacer. Elige un servicio y agenda directo con ella."
        />
        <div className="services-grid">
          {CATEGORIES.map((cat, i) => {
            const people = staffList.filter(s => s.category === cat.id);
            const services = people.flatMap(p => p.services.map(s => ({ ...s, staff: p })));
            return (
              <article key={cat.id} className={`service-card reveal delay-${i}`}>
                <div className="service-card-img">
                  <img src={cat.image} alt={cat.title} loading="lazy" width="900" height="900" />
                </div>
                <div className="service-card-body">
                  <h3>{cat.title}</h3>
                  <p>{cat.text}</p>
                  <ul className="service-list">
                    {services.map(s => (
                      <li key={s.id}>
                        <span>{s.name}</span>
                        <span className="service-time">{formatMinutes(s.minutes)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="service-card-cta">
                    {people.map(p => (
                      <button key={p.id} className="btn btn-soft btn-sm" onClick={() => onBookWith(p.id)}>
                        Agendar con {p.name} <ArrowRight size={16} />
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Team({ onBookWith }) {
  return (
    <section id="equipo" className="section section-tint">
      <div className="container">
        <SectionHead
          eyebrow="Nuestro equipo"
          title={<>Conoce a tus <em>especialistas</em></>}
          text="Mira su trabajo, escríbeles directo o agenda con la que más te guste."
        />
        <div className="team-grid">
          {staffList.map((s, i) => (
            <article key={s.id} className={`team-card reveal delay-${i % 4}`}>
              <Link to={`/equipo/${s.id}`} className="team-photo" aria-label={`Ver trabajos de ${s.name}`}>
                <img src={s.image} alt={s.name} loading="lazy" width="500" height="500" />
                <span className="team-photo-hint">Ver trabajos</span>
              </Link>
              <h3>{s.name}</h3>
              <p className="team-role">{s.role}</p>
              <div className="team-actions">
                <button className="btn btn-primary btn-sm" onClick={() => onBookWith(s.id)}>Agendar</button>
                <a className="btn btn-ghost btn-sm btn-icon" href={waLink(`Hola ${s.name}, me gustaría agendar una cita.`, s.whatsapp)} target="_blank" rel="noreferrer" aria-label={`WhatsApp de ${s.name}`}>
                  <MessageCircle size={18} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section className="section">
      <div className="container">
        <SectionHead eyebrow="Galería" title={<>Un poco de <em>nuestro trabajo</em></>} />
        <div className="gallery">
          {GALLERY.map((src, i) => (
            <div key={src} className={`gallery-item reveal delay-${i % 4}`}>
              <img src={src} alt="Trabajo realizado en CUU Beauty" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CoursesTeaser() {
  return (
    <section className="section">
      <div className="container">
        <div className="promo reveal">
          <div className="promo-copy">
            <span className="eyebrow light"><GraduationCap size={14} /> CUU Beauty Academy</span>
            <h2>Aprende manicura profesional <em>en 7 días</em></h2>
            <p>Curso presencial de 21 horas: manicura rusa, gel, builder gel, polygel, acrílico escultural y efectos de tendencia. Cupo limitado.</p>
            <div className="btn-row">
              <Link to="/cursos" className="btn btn-white">Ver el temario <ArrowRight size={18} /></Link>
            </div>
          </div>
          <img src="/portfolio_ailyn_2.jpg" alt="" loading="lazy" className="promo-img" />
        </div>
      </div>
    </section>
  );
}

function Location() {
  const ref = useRef(null);
  const [showMap, setShowMap] = useState(false);

  // Only load the (heavy) Google Maps iframe when it's about to be seen.
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setShowMap(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShowMap(true); io.disconnect(); } }, { rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="ubicacion" className="section section-tint">
      <div className="container">
        <SectionHead eyebrow="Ubicación" title={<>Te esperamos en el <em>centro de Chihuahua</em></>} />
        <div className="location reveal">
          <div className="location-card">
            <div className="location-row">
              <MapPin size={22} />
              <div>
                <strong>Dirección</strong>
                <span>{studio.address}</span>
              </div>
            </div>
            <div className="location-row">
              <Clock size={22} />
              <div>
                <strong>Horario</strong>
                <span>Lunes a sábado, con cita previa. Domingo cerrado.</span>
              </div>
            </div>
            <div className="location-row">
              <MessageCircle size={22} />
              <div>
                <strong>WhatsApp</strong>
                <a href={waLink('Hola, quiero información sobre sus servicios.')} target="_blank" rel="noreferrer">614 286 4898</a>
              </div>
            </div>
            <div className="btn-row">
              <a href={studio.mapsUrl} target="_blank" rel="noreferrer" className="btn btn-primary"><Navigation size={18} /> Cómo llegar</a>
              <button className="btn btn-ghost" onClick={() => navigate('/#agendar')}>Agendar</button>
            </div>
          </div>
          <div className="location-map" ref={ref}>
            {showMap && (
              <iframe
                src="https://www.google.com/maps?q=Av.+Ignacio+Zaragoza+12,+Zona+Centro,+31000+Chihuahua,+Chih.&output=embed"
                title="Mapa de CUU Beauty Studio"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
