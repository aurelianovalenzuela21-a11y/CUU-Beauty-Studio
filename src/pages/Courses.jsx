import { Award, CheckCircle2, Clock, Layers, MessageCircle, Users } from 'lucide-react';
import { waLink, useReveal } from '../lib.js';

const COURSE_MSG = 'Hola, quiero información sobre el curso completo de Manicura (7 días).';

const DAYS = [
  { n: '01', title: 'Fundamentos y preparación de la uña', body: 'Bioseguridad, anatomía de la uña y para qué sirve cada material: la base que sostiene todas las técnicas del curso.', tags: ['Bioseguridad', 'Anatomía', 'Preparación profesional'] },
  { n: '02', title: 'Manicura rusa', body: 'El acabado en seco que hoy exige el mercado: fresado, retiro de cutícula y esmaltado sin arrastre de piel.', tags: ['Fresado', 'Cutícula en seco', 'Acabado premium'] },
  { n: '03', title: 'Gel semipermanente', body: 'Aplicación en capas con curado UV/LED y retiro correcto, para un color de alto brillo que dura semanas.', tags: ['Curado UV/LED', 'Aplicación en capas', 'Retiro seguro'] },
  { n: '04', title: 'Builder gel', body: 'Refuerzo de uñas débiles y alargues cortos con la técnica de encapsulado y construcción de apex.', tags: ['Encapsulado', 'Refuerzo', 'Apex'] },
  { n: '05', title: 'Polygel', body: 'Extensiones ligeras y resistentes esculpidas con pincel: lo mejor del acrílico y el gel en un solo sistema.', tags: ['Esculpido con pincel', 'Slip solution', 'Extensión completa'] },
  { n: '06', title: 'Acrílico en escultural', body: 'La técnica de mayor exigencia: polímero y monómero esculpidos a mano sobre molde, para extensiones largas y firmes.', tags: ['Polímero / monómero', 'Esculpido en molde', 'Formas de uña'] },
  { n: '07', title: 'Diseños, tendencias, efectos y evaluación', body: 'Diseños sencillos y de tendencia, efectos de cromado, ojo de gato y vidrio, y práctica final evaluada para cerrar el curso.', tags: ['Efecto cromado', 'Ojo de gato', 'Evaluación final'] },
];

const OUTCOMES = [
  'Preparas una uña con nivel profesional, sin importar la técnica que sigas.',
  'Ejecutas manicura rusa, gel semipermanente, builder gel, polygel y acrílico escultural.',
  'Dominas diseños de tendencia y al menos tres efectos especiales.',
  'Detectas y corriges los errores más comunes de cada técnica antes de que lleguen a tu clienta.',
  'Explicas con seguridad para qué sirve cada material, como una profesional.',
  'Te llevas tu constancia de participación del curso completo.',
];

export default function Courses() {
  useReveal();

  return (
    <>
      <section className="page-hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="container page-hero-grid">
          <div className="fade-in">
            <span className="eyebrow">CUU Beauty Academy · Curso presencial</span>
            <h1>Domina la manicura, <em>de la base al efecto</em></h1>
            <p className="lead">
              Un curso intensivo donde aprendes, técnica por técnica, todo lo que hoy piden las clientas:
              manicura rusa, gel semipermanente, builder gel, polygel, acrílico escultural y los efectos de tendencia.
            </p>
            <div className="btn-row">
              <a href={waLink(COURSE_MSG)} target="_blank" rel="noreferrer" className="btn btn-primary btn-lg"><MessageCircle size={20} /> Pedir informes</a>
              <a href="#temario" className="btn btn-ghost btn-lg">Ver temario</a>
            </div>
          </div>
          <div className="page-hero-img fade-in delay-1">
            <img src="/portfolio_ailyn_2.jpg" alt="Uñas realizadas en CUU Beauty" width="675" height="900" />
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="stats">
            {[
              { icon: Clock, big: '7 días', small: '3 horas por sesión' },
              { icon: Award, big: '21 h', small: 'de formación práctica' },
              { icon: Layers, big: '8', small: 'técnicas centrales' },
              { icon: Users, big: 'Cupo', small: 'limitado por generación' },
            ].map(({ icon: Icon, big, small }) => (
              <div className="stat reveal" key={big}>
                <Icon size={22} />
                <strong>{big}</strong>
                <span>{small}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container container-narrow">
          <div className="section-head reveal">
            <span className="eyebrow">¿Es para mí?</span>
            <h2>Para quien empieza <em>y para quien ya trabaja</em></h2>
          </div>
          <div className="two-col">
            <div className="panel reveal">
              <span className="panel-tag">Principiantes</span>
              <h3>Quiero empezar desde cero</h3>
              <ul className="check-list">
                <li>Nunca has trabajado profesionalmente en uñas.</li>
                <li>Quieres una base sólida antes de invertir en tu propio espacio.</li>
                <li>Buscas aprender las técnicas de mayor demanda en un solo curso.</li>
              </ul>
            </div>
            <div className="panel reveal delay-1">
              <span className="panel-tag">En activo</span>
              <h3>Ya trabajo y quiero crecer</h3>
              <ul className="check-list">
                <li>Dominas esmaltado tradicional y quieres sumar extensiones.</li>
                <li>Buscas actualizarte en polygel, acrílico escultural y efectos.</li>
                <li>Quieres una constancia que respalde tu servicio ante tus clientas.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="temario" className="section section-tint">
        <div className="container container-narrow">
          <div className="section-head reveal">
            <span className="eyebrow">Temario</span>
            <h2>7 días, <em>una técnica por jornada</em></h2>
            <p>3 horas por sesión: teoría breve, demostración en vivo y práctica guiada en modelo.</p>
          </div>
          <ol className="timeline">
            {DAYS.map(day => (
              <li key={day.n} className="timeline-item reveal">
                <span className="timeline-num">Día {day.n}</span>
                <div className="timeline-card">
                  <h3>{day.title}</h3>
                  <p>{day.body}</p>
                  <div className="tags">{day.tags.map(t => <span key={t}>{t}</span>)}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container container-narrow">
          <div className="section-head reveal">
            <span className="eyebrow">Al terminar</span>
            <h2>Sales con manos <em>listas para trabajar</em></h2>
          </div>
          <ul className="outcomes">
            {OUTCOMES.map(item => (
              <li key={item} className="reveal"><CheckCircle2 size={22} /> <span>{item}</span></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="promo promo-center reveal">
            <div className="promo-copy">
              <span className="eyebrow light">Cupo limitado</span>
              <h2>Reserva tu lugar en la <em>próxima generación</em></h2>
              <p>Escríbenos por WhatsApp para conocer fechas disponibles e inversión del curso.</p>
              <div className="btn-row center">
                <a href={waLink(COURSE_MSG)} target="_blank" rel="noreferrer" className="btn btn-white btn-lg"><MessageCircle size={20} /> Pedir informes por WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
