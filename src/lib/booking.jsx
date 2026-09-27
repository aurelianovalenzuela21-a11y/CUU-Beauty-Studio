import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { navigate } from './router';

const BookingContext = createContext(null);

const EMPTY = { staffId: null, serviceId: null, date: null, time: null };

export function BookingProvider({ children }) {
  const [selection, setSelection] = useState(EMPTY);

  /** Abre la agenda con especialista y/o servicio ya elegidos, desde cualquier página. */
  const startBooking = useCallback((pre = {}) => {
    setSelection({ ...EMPTY, staffId: pre.staffId || null, serviceId: pre.serviceId || null });
    navigate('/#agenda');
  }, []);

  const value = useMemo(() => ({ selection, setSelection, startBooking, reset: () => setSelection(EMPTY) }), [selection, startBooking]);
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBooking = () => useContext(BookingContext);
