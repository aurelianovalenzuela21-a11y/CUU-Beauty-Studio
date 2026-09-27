import { useCallback, useEffect, useState } from 'react';
import { Header, Footer, FloatingWhatsApp } from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Courses from './pages/Courses.jsx';
import StaffPage from './pages/StaffPage.jsx';
import { usePath, navigate, scrollToHash, findStaff } from './lib.js';

const BASE_TITLE = 'CUU Beauty Studio';

export default function App() {
  const path = usePath().replace(/\/+$/, '') || '/';
  const [preselect, setPreselect] = useState(null);

  // Old links to the syllabus page now land on its section.
  useEffect(() => {
    if (path === '/cursos/temario') {
      window.history.replaceState({}, '', '/cursos#temario');
      window.dispatchEvent(new Event('app:navigate'));
      scrollToHash('#temario', false);
    }
  }, [path]);

  // Honour #anchors on first load (e.g. shared links to /#agendar).
  useEffect(() => {
    if (window.location.hash) setTimeout(() => scrollToHash(window.location.hash, false), 50);
  }, []);

  const onBookWith = useCallback((staffId) => {
    setPreselect({ staffId, at: Date.now() });
    navigate('/#agendar');
  }, []);

  let page;
  let title;
  const staffMatch = path.match(/^\/equipo\/([a-z]+)$/);
  if (path === '/') {
    page = <Home onBookWith={onBookWith} preselect={preselect} />;
    title = `${BASE_TITLE} | Manicure, Pedicure Spa y Faciales en Chihuahua`;
  } else if (path.startsWith('/cursos')) {
    page = <Courses />;
    title = `Curso de Manicura Profesional en Chihuahua | ${BASE_TITLE}`;
  } else if (staffMatch) {
    const staff = findStaff(staffMatch[1]);
    page = <StaffPage key={staffMatch[1]} id={staffMatch[1]} onBookWith={onBookWith} />;
    title = staff ? `${staff.name}, ${staff.role} | ${BASE_TITLE}` : BASE_TITLE;
  } else {
    page = <NotFound />;
    title = `Página no encontrada | ${BASE_TITLE}`;
  }

  useEffect(() => { document.title = title; }, [title]);

  return (
    <>
      <a href="#main" className="skip-link">Saltar al contenido</a>
      <Header />
      <main id="main">{page}</main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

function NotFound() {
  return (
    <section className="section">
      <div className="container text-center">
        <span className="eyebrow">Error 404</span>
        <h1>Esta página <em>no existe</em></h1>
        <p className="lead">Puede que el enlace haya cambiado.</p>
        <div className="btn-row center">
          <button className="btn btn-primary" onClick={() => navigate('/')}>Ir al inicio</button>
        </div>
      </div>
    </section>
  );
}
