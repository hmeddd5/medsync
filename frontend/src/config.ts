export function apiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") {
    return fromEnv.replace(/\/$/, "");
  }
  // En développement local (Vite dev server), on retourne une chaîne vide
  // pour passer par le proxy défini dans vite.config.ts.
  if (import.meta.env.DEV) {
    return "";
  }
  // En production, si VITE_API_URL n'est pas défini, on utilise le chemin relatif.
  return "";
}
