import { useEffect } from 'react';
import { Footer, Header, WhatsAppFloat } from './components/Layout';
import { BookingProvider } from './lib/booking';
import { linkProps, scrollToId, usePath, useDocumentMeta } from './lib/router';
import { findStaff } from './lib/salon';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Specialist from './pages/Specialist';

function NotFound() {
  useDocumentMeta('Página no encontrada | CUU Beauty Studio');
  return (
    <section className="section not-found">
      <div className="container narrow center">
        <span className="eyebrow">Error 404</span>
        <h1 className="hero-title">
          Esta página <em>no existe</em>
        </h1>
        <p className="hero-lead">Puede que el enlace haya cambiado. Vuelve al inicio para agendar tu cita.</p>
        <a className="btn btn-primary btn-lg" {...linkProps('/')}>
          Ir al inicio
        </a>
      </div>
    </section>
  );
}

function Routes() {
  const path = usePath();

  // Al cargar con un #ancla (p. ej. /#agenda), desplázate a esa sección.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) setTimeout(() => scrollToId(hash), 120);
  }, []);

  if (path === '/') return <Home />;
  if (path === '/cursos') return <Courses />;
  if (path === '/cursos/temario') return <Courses anchor="temario" />;
  const m = /^\/equipo\/([a-z]+)$/.exec(path);
  const staff = m && findStaff(m[1]);
  if (staff) return <Specialist staff={staff} />;
  return <NotFound />;
}

export default function App() {
  return (
    <BookingProvider>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">
        <Routes />
      </main>
      <Footer />
      <WhatsAppFloat />
    </BookingProvider>
  );
}
