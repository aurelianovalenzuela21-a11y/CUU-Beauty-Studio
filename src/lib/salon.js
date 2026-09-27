import salon from '../data/salon.json';

export const business = salon.business;
export const categories = salon.categories;
export const staffList = salon.staff;

export const findStaff = (id) => staffList.find((s) => s.id === id);
export const findService = (staff, id) => staff?.services.find((s) => s.id === id);

/** Todas las opciones de servicio con su especialista, agrupadas por categoría. */
export function servicesByCategory() {
  return categories.map((cat) => ({
    ...cat,
    items: staffList
      .filter((s) => s.category === cat.id)
      .flatMap((staff) => staff.services.map((service) => ({ ...service, staff }))),
  }));
}

export const formatDuration = (min) => {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
};

export const waLink = (number, text) =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

/** srcset de las fotos optimizadas en /img. */
export function imgSet(base, kind = 'photo') {
  const widths = kind === 'profile' ? [160, 320] : [400, 640, 900];
  return {
    src: `${base}-${widths[widths.length - 1] === 900 ? 640 : 320}.webp`,
    srcSet: widths.map((w) => `${base}-${w}.webp ${w}w`).join(', '),
  };
}
