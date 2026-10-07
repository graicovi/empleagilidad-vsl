/// <reference types="vite/client" />

/**
 * Tipado de las variables de entorno propias del proyecto.
 * Extiende la interfaz ImportMetaEnv de Vite para autocompletado y validación TS.
 */
interface ImportMetaEnv {
  /** URL base del backend de Django (ej. http://localhost:8000) */
  readonly VITE_BACKEND_URL?: string;
  /** Nombre del tag de ActiveCampaign (ej. VSL_Reducida_Lead) */
  readonly VITE_AC_TAG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
