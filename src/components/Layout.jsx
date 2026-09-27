import { useEffect, useState } from 'react';
import { linkProps, navigate, usePath } from '../lib/router';
import { useBooking } from '../lib/booking';
import { business, waLink } from '../lib/salon';
import { IconMapPin, IconMenu, IconWhatsApp, IconX, IconArrowRight } from './Icons';

export function BrandLogo({ size = 'md' }) {
  return (
    <span className={`brand brand-${size}`}>
      <span className="brand-cuu">CUU</span>
      <span className="brand-beauty">Beauty</span>
    </span>
  );
}

const NAV = [
  { to: '/#servicios', label: 'Servicios' },
  { to: '/#equipo', label: 'Equipo' },
  { to: '/cursos', label: 'Academia', badge: 'Nuevo' },
  { to: '/#ubicacion', label: 'Ubicación' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { startBooking } = useBooking();
  const path = usePath();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', open);
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (to) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <>
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header-inner">
        <a {...linkProps('/', () => setOpen(false))} className="header-logo" aria-label="CUU Beauty Studio, inicio">
          <BrandLogo />
        </a>

        <nav className="nav-desktop" aria-label="Principal">
          {NAV.map((item) => (
            <a
              key={item.to}
              href={item.to}
              className={path === item.to ? 'is-active' : undefined}
              onClick={(e) => {
                e.preventDefault();
                go(item.to);
              }}
            >
              {item.label}
              {item.badge && <span className="badge">{item.badge}</span>}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button type="button" className="btn btn-primary btn-sm header-cta" onClick={() => startBooking()}>
            Agendar cita
          </button>
          <button
            type="button"
            className="icon-btn menu-btn"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconX size={24} /> : <IconMenu size={24} />}
          </button>
        </div>
      </div>
    </header>

      <div id="menu-movil" className={`mobile-menu ${open ? 'is-open' : ''}`} inert={!open}>
        <nav aria-label="Menú">
          {NAV.map((item, i) => (
            <a
              key={item.to}
              href={item.to}
              style={{ '--i': i }}
              onClick={(e) => {
                e.preventDefault();
                go(item.to);
              }}
            >
              {item.label}
              {item.badge && <span className="badge">{item.badge}</span>}
              <IconArrowRight size={20} />
            </a>
          ))}
        </nav>
        <div className="mobile-menu-foot">
          <button
            type="button"
            className="btn btn-primary btn-lg btn-block"
            onClick={() => {
              setOpen(false);
              startBooking();
            }}
          >
            Agendar cita
          </button>
          <a className="btn btn-whatsapp btn-lg btn-block" href={waLink(business.whatsapp)} target="_blank" rel="noreferrer">
            <IconWhatsApp size={20} /> Escríbenos por WhatsApp
          </a>
          <p className="muted small">
            <IconMapPin size={14} /> {business.address}, {business.city}
          </p>
        </div>
      </div>
    </>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <BrandLogo size="lg" />
          <p>Uñas, pedicura spa, faciales, cejas y pestañas en el centro de Chihuahua. Todo lo que necesitas, en un mismo lugar.</p>
        </div>
        <div className="footer-col">
          <h4>Visítanos</h4>
          <a href={business.mapsUrl} target="_blank" rel="noreferrer">
            {business.address}
            <br />
            {business.city}
          </a>
          <span>Lunes a sábado, con cita</span>
        </div>
        <div className="footer-col">
          <h4>Explora</h4>
          <a {...linkProps('/#servicios')}>Servicios</a>
          <a {...linkProps('/#equipo')}>Nuestro equipo</a>
          <a {...linkProps('/#agenda')}>Agendar cita</a>
          <a {...linkProps('/cursos')}>Curso de manicura</a>
        </div>
        <div className="footer-col">
          <h4>Contacto</h4>
          <a href={waLink(business.whatsapp)} target="_blank" rel="noreferrer">
            WhatsApp 614 286 4898
          </a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} CUU Beauty Studio · Chihuahua, México</span>
      </div>
    </footer>
  );
}

export function WhatsAppFloat() {
  return (
    <a
      className="wa-float"
      href={waLink(business.whatsapp, 'Hola, me gustaría información sobre sus servicios.')}
      target="_blank"
      rel="noreferrer"
      aria-label="Escríbenos por WhatsApp"
    >
      <IconWhatsApp size={28} />
    </a>
  );
}
