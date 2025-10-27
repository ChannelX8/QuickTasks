import React, { useState, useEffect } from 'react';

function safeJSONParse<T>(key: string, initialValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return initialValue;
    }
    const parsed = JSON.parse(item);
    // If parsed value is null (e.g., localStorage contained "null")
    // fall back to the initial value. This prevents the app from crashing
    // when it expects an array/object but gets null.
    return parsed ?? initialValue;
  } catch (error) {
    console.warn(`Error parsing localStorage key "${key}":`, error);
    return initialValue;
  }
}

export const useLocalStorage = <T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return safeJSONParse(key, initialValue);
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};
