import { useState, useEffect } from 'react';

/**
 * Debounce hook: returns a debounced copy of `value` that only updates
 * after `delay` ms of no changes.
 *
 * Used for the search input so we don't fire an API call on every
 * keystroke — we wait until the user pauses typing.
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    // If `value` changes again before the timer fires, cancel it
    // and start a fresh one. This is the "debounce" behavior.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
