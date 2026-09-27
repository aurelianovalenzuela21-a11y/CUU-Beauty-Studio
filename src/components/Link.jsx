import { useCallback } from 'react';
import { navigate } from '../lib.js';

export function Link({ to, onClick, children, ...rest }) {
  const handle = useCallback((e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onClick?.(e);
    navigate(to);
  }, [to, onClick]);
  return <a href={to} onClick={handle} {...rest}>{children}</a>;
}
