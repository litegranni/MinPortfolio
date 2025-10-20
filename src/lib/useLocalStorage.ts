"use client";
import { useEffect, useState } from "react";

/**
 * En mysig liten hjälpfunktion (custom hook) för att spara state i localStorage.
 * Ger både snabb åtkomst till sparade värden och automatisk uppdatering vid ändringar.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  // Lokalt state. aka startar med ett förvalt värde
  const [value, setValue] = useState<T>(initial);

  // Vid första render så försök läsa tidigare sparat värde från localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch {
      // Ignorera ev. JSON-fel (typ trasig sträng)
    }
  }, [key]);

  // Skriv automatiskt till localStorage varje gång den här värdet ändras
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignorera om localStorage är full eller blockad
    }
  }, [key, value]);

  // Returnerar samma struktur som useState fast med persistens
  return [value, setValue] as const;
}
