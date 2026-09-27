import { useEffect, useState } from 'react';
import { Menu, X, MapPin, MessageCircle, CalendarHeart } from 'lucide-react';
import { studio, waLink } from '../lib.js';
import { Link } from './Link.jsx';

const NAV = [
  { to: '/#servicios', label: 'Servicios' },
  { to: '/#equipo', label: 'Equipo' },
  { to: '/cursos', label: 'Cursos', badge: 'Nuevo' },
  { to: '/#ubicacion', label: 'Ubicación' },
];

export function BrandLogo() {
  return (
    <span className="brand" aria-label="CUU Beauty">
      <span className="brand-cuu">CUU</span>
      <span className="brand-beauty">Beauty</span>
    </span>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        <Link to="/" className="brand-link" onClick={close}><BrandLogo /></Link>

        <nav className="nav-desktop" aria-label="Principal">
          {NAV.map(item => (
            <Link key={item.to} to={item.to} className="nav-link">
              {item.label}{item.badge && <span className="badge">{item.badge}</span>}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link to="/#agendar" className="btn btn-primary btn-sm header-cta">Agendar cita</Link>
          <button className="menu-btn" onClick={() => setOpen(true)} aria-label="Abrir menú" aria-expanded={open}>
            <Menu size={26} />
          </button>
        </div>
      </div>

      <div className={`drawer-overlay ${open ? 'open' : ''}`} onClick={close} />
      <aside className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="drawer-top">
          <BrandLogo />
          <button className="menu-btn" onClick={close} aria-label="Cerrar menú"><X size={26} /></button>
        </div>
        <nav className="drawer-nav" aria-label="Menú móvil">
          {NAV.map(item => (
            <Link key={item.to} to={item.to} onClick={close} tabIndex={open ? 0 : -1}>
              {item.label}{item.badge && <span className="badge">{item.badge}</span>}
            </Link>
          ))}
        </nav>
        <div className="drawer-bottom">
          <Link to="/#agendar" onClick={close} className="btn btn-primary btn-block" tabIndex={open ? 0 : -1}>
            <CalendarHeart size={18} /> Agendar cita
          </Link>
          <a href={waLink('Hola, quiero información sobre sus servicios.')} target="_blank" rel="noreferrer" className="btn btn-ghost btn-block" tabIndex={open ? 0 : -1}>
            <MessageCircle size={18} /> WhatsApp
          </a>
        </div>
      </aside>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <BrandLogo />
          <p className="footer-about">Manicure, pedicure spa, faciales, cejas y pestañas con especialistas en el centro de Chihuahua.</p>
        </div>
        <div>
          <h4>Visítanos</h4>
          <a href={studio.mapsUrl} target="_blank" rel="noreferrer" className="footer-link"><MapPin size={16} /> Av. Zaragoza 12, Zona Centro</a>
          <span className="footer-link"><CalendarHeart size={16} /> Lunes a sábado, con cita</span>
        </div>
        <div>
          <h4>Contacto</h4>
          <a href={waLink('Hola, quiero información sobre sus servicios.')} target="_blank" rel="noreferrer" className="footer-link"><MessageCircle size={16} /> WhatsApp</a>
          <Link to="/#agendar" className="footer-link">Agendar en línea</Link>
          <Link to="/cursos" className="footer-link">Cursos de manicura</Link>
        </div>
      </div>
      <div className="footer-bottom container">© {new Date().getFullYear()} CUU Beauty Studio · Chihuahua, México</div>
    </footer>
  );
}

export function FloatingWhatsApp() {
  return (
    <a href={waLink('Hola, quiero información sobre sus servicios.')} target="_blank" rel="noreferrer" className="fab-wa" aria-label="Escríbenos por WhatsApp">
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" fill="currentColor">
        <path d="M16.04 3C8.86 3 3.03 8.8 3.03 15.96c0 2.29.6 4.52 1.75 6.49L3 29l6.72-1.75a13.03 13.03 0 0 0 6.31 1.61h.01c7.17 0 13-5.8 13-12.96C29.04 8.8 23.21 3 16.04 3zm0 23.68h-.01a10.8 10.8 0 0 1-5.5-1.5l-.4-.23-3.99 1.04 1.07-3.88-.26-.4a10.7 10.7 0 0 1-1.66-5.75c0-5.95 4.86-10.8 10.84-10.8 5.97 0 10.83 4.85 10.83 10.8 0 5.96-4.86 10.72-10.92 10.72zm5.94-8.04c-.33-.16-1.93-.95-2.23-1.06-.3-.11-.52-.16-.73.16-.22.33-.84 1.06-1.03 1.27-.19.22-.38.24-.7.08-.33-.16-1.38-.51-2.62-1.62-.97-.86-1.62-1.93-1.81-2.25-.19-.33-.02-.5.14-.66.15-.15.33-.38.49-.57.16-.19.22-.33.33-.54.11-.22.05-.41-.03-.57-.08-.16-.73-1.76-1-2.41-.27-.63-.53-.55-.73-.56h-.62c-.22 0-.57.08-.87.41-.3.33-1.14 1.11-1.14 2.71s1.17 3.14 1.33 3.36c.16.22 2.3 3.5 5.57 4.91.78.34 1.39.54 1.86.69.78.25 1.49.21 2.05.13.63-.09 1.93-.79 2.2-1.55.27-.76.27-1.41.19-1.55-.08-.14-.3-.22-.62-.38z"/>
      </svg>
    </a>
  );
}
