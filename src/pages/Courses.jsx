import { useEffect } from 'react';
import { linkProps, scrollToId, useDocumentMeta } from '../lib/router';
import { business, imgSet, waLink } from '../lib/salon';
import { IconArrowLeft, IconAward, IconCheckCircle, IconClock, IconSparkle, IconWhatsApp } from '../components/Icons';

const DAYS = [
  { n: '01', title: 'Fundamentos y preparación de la uña', body: 'Bioseguridad, anatomía de la uña y para qué sirve cada material: la base que sostiene todas las técnicas del curso.', tags: ['Bioseguridad', 'Anatomía', 'Preparación profesional'] },
  { n: '02', title: 'Manicura rusa', body: 'El acabado en seco que hoy exige el mercado: fresado, retiro de cutícula y esmaltado sin arrastre de piel.', tags: ['Fresado', 'Cutícula en seco', 'Acabado premium'] },
  { n: '03', title: 'Gel semipermanente', body: 'Aplicación en capas con curado UV/LED y retiro correcto, para un color de alto brillo que dura semanas.', tags: ['Curado UV/LED', 'Aplicación en capas', 'Retiro seguro'] },
  { n: '04', title: 'Builder gel', body: 'Refuerzo de uñas débiles y alargues cortos con la técnica de encapsulado y construcción de apex.', tags: ['Encapsulado', 'Refuerzo', 'Apex'] },
  { n: '05', title: 'Polygel', body: 'Extensiones ligeras y resistentes esculpidas con pincel: lo mejor del acrílico y el gel en un solo sistema.', tags: ['Esculpido con pincel', 'Slip solution', 'Extensión completa'] },
  { n: '06', title: 'Acrílico en escultural', body: 'La técnica de mayor exigencia: polímero y monómero esculpidos a mano sobre molde, para extensiones largas y firmes.', tags: ['Polímero / monómero', 'Esculpido en molde', 'Formas de uña'] },
  { n: '07', title: 'Diseños, tendencias, efectos y evaluación', body: 'Diseños sencillos y de tendencia, efectos de cromado, ojo de gato y vidrio, y práctica final evaluada para cerrar el curso.', tags: ['Efecto cromado', 'Ojo de gato', 'Evaluación final'], final: true },
];

const OUTCOMES = [
  'Preparas una uña con nivel profesional, sin importar la técnica que sigas.',
  'Ejecutas manicura rusa, gel semipermanente, builder gel, polygel y acrílico escultural.',
  'Dominas diseños de tendencia y al menos tres efectos especiales.',
  'Detectas y corriges los errores más comunes de cada técnica antes de que lleguen a tu clienta.',
  'Explicas con seguridad para qué sirve cada material, como una profesional.',
  'Te llevas tu constancia de participación del curso completo.',
];

const WA_TEXT = 'Hola, quiero información sobre el curso completo de manicura (7 días): fechas e inversión.';

export default function Courses({ anchor }) {
  useDocumentMeta(
    'Curso de manicura profesional en Chihuahua | CUU Beauty Academy',
    'Curso presencial de 7 días (21 horas): manicura rusa, gel semipermanente, builder gel, polygel, acrílico escultural y efectos de tendencia. Cupo limitado.',
  );
  useEffect(() => {
    if (anchor) requestAnimationFrame(() => scrollToId(anchor));
  }, [anchor]);
  const img = imgSet('/img/portfolio_ailyn_4');

  return (
    <div className="page">
      <section className="course-hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="container">
          <a className="back-link" {...linkProps('/')}>
            <IconArrowLeft size={18} /> Inicio
          </a>
          <div className="course-hero-grid">
            <div>
              <span className="eyebrow">
                <IconAward size={16} /> CUU Beauty Academy · Curso presencial
              </span>
              <h1 className="hero-title">
                Domina la manicura <em>de la base al efecto</em>
              </h1>
              <p className="hero-lead">
                Un curso intensivo donde aprendes, técnica por técnica, todo lo que hoy piden las clientas: manicura rusa, gel semipermanente, builder gel, polygel, acrílico escultural y los diseños y efectos de tendencia.
              </p>
              <ul className="pill-list">
                {['7 días de formación', '3 horas por sesión', '21 horas totales', '8 técnicas centrales', 'Práctica supervisada diaria'].map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div className="hero-ctas">
                <a className="btn btn-primary btn-lg" href={waLink(business.whatsapp, WA_TEXT)} target="_blank" rel="noreferrer">
                  <IconWhatsApp size={20} /> Pedir fechas e inversión
                </a>
                <a className="btn btn-outline btn-lg" href="#temario" onClick={(e) => { e.preventDefault(); scrollToId('temario'); }}>
                  Ver temario
                </a>
              </div>
            </div>
            <div className="course-photo">
              <img src={img.src} srcSet={img.srcSet} sizes="(max-width: 800px) 90vw, 460px" alt="Uñas esculturales con diseño dorado" width="640" height="640" fetchPriority="high" />
              <div className="course-photo-badge">
                <IconSparkle size={18} /> Cupo limitado por generación
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="audience">
            <article className="card">
              <span className="eyebrow">Principiantes</span>
              <h3>Quiero empezar desde cero</h3>
              <ul className="check-list">
                <li>Nunca has trabajado profesionalmente en uñas.</li>
                <li>Quieres una base sólida antes de invertir en tu propio espacio.</li>
                <li>Buscas aprender las técnicas de mayor demanda en un solo curso.</li>
              </ul>
            </article>
            <article className="card">
              <span className="eyebrow">En activo</span>
              <h3>Ya trabajo y quiero crecer</h3>
              <ul className="check-list">
                <li>Dominas esmaltado tradicional y quieres sumar extensiones.</li>
                <li>Buscas actualizarte en polygel, acrílico escultural y efectos de tendencia.</li>
                <li>Quieres una constancia que respalde tu servicio ante tus clientas.</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section id="temario" className="section section-tint" aria-labelledby="temario-title">
        <div className="container narrow">
          <div className="section-head">
            <span className="eyebrow">Temario</span>
            <h2 id="temario-title" className="section-title">
              7 días, <em>una técnica por jornada</em>
            </h2>
            <p className="section-lead">3 horas por sesión: teoría breve, demostración en vivo y práctica guiada en modelo.</p>
          </div>
          <ol className="timeline">
            {DAYS.map((d) => (
              <li key={d.n} className={d.final ? 'is-final' : undefined}>
                <div className="timeline-num">
                  <span>Día</span>
                  <strong>{d.n}</strong>
                </div>
                <div className="timeline-body">
                  <h3>{d.title}</h3>
                  <p>{d.body}</p>
                  <ul className="tag-list">
                    {d.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <span className="timeline-time">
                    <IconClock size={14} /> 3 horas
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          <div className="section-head">
            <span className="eyebrow">Al terminar</span>
            <h2 className="section-title">
              Sales con manos <em>listas para trabajar</em>
            </h2>
          </div>
          <ul className="outcomes">
            {OUTCOMES.map((o) => (
              <li key={o}>
                <IconCheckCircle size={22} />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="academy academy-cta">
            <div className="academy-glow" aria-hidden="true" />
            <div className="academy-copy center">
              <span className="eyebrow eyebrow-light">Próxima generación</span>
              <h2>
                Reserva tu lugar <em>hoy</em>
              </h2>
              <p>Escríbenos por WhatsApp para conocer fechas disponibles e inversión del curso.</p>
              <div className="academy-ctas center">
                <a className="btn btn-light btn-lg" href={waLink(business.whatsapp, WA_TEXT)} target="_blank" rel="noreferrer">
                  <IconWhatsApp size={20} /> Pedir información
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
