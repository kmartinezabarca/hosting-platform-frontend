import axios from "axios";

// La URL raíz que solo necesitamos para esta llamada
const ROOT_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Realiza la petición inicial a Sanctum para obtener la cookie CSRF.
 * Esta función debe ser llamada una sola vez al arrancar la aplicación.
 */
export const initializeCsrf = async ( ) => {
  try {
    // Hacemos una llamada directa con axios. No necesitamos interceptores aquí.
    await axios.get(`${ROOT_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
    console.log("CSRF cookie initialized successfully.");
  } catch (error) {
    console.error("Fatal: Could not initialize CSRF cookie. App may not work correctly.", error);
    // Podrías incluso lanzar el error para detener la carga de la app si es crítico
    // throw error;
  }
};
