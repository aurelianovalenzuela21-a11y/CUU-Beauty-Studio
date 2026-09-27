import { useEffect, useSyncExternalStore } from 'react';

// Enrutador mínimo con la History API: URLs reales (/cursos, /equipo/ailyn) sin dependencias.
const listeners = new Set();
const subscribe = (fn) => {
  listeners.add(fn);
  window.addEventListener('popstate', fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener('popstate', fn);
  };
};
const getPath = () => window.location.pathname;

export function usePath() {
  return useSyncExternalStore(subscribe, getPath, () => '/');
}

/** Navega a `to`. Admite anclas: navigate('/#agenda'). */
export function navigate(to, { replace = false } = {}) {
  const [pathname, hash] = to.split('#');
  const target = pathname || window.location.pathname;
  if (target !== window.location.pathname) {
    window.history[replace ? 'replaceState' : 'pushState']({}, '', target + (hash ? `#${hash}` : ''));
    listeners.forEach((fn) => fn());
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' });
  } else if (hash) {
    window.history.replaceState({}, '', `${target}#${hash}`);
  }
  if (hash) {
    // Espera a que la vista nueva se pinte antes de desplazarse.
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToId(hash)));
  }
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

/** Props para un <a> interno: conserva clic derecho / abrir en pestaña nueva. */
export function linkProps(to, onNavigate) {
  return {
    href: to,
    onClick: (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      onNavigate?.();
      navigate(to);
    },
  };
}

/** Actualiza <title> y descripción al cambiar de vista (el servidor ya los pone en la carga inicial). */
export function useDocumentMeta(title, description) {
  useEffect(() => {
    document.title = title;
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}
