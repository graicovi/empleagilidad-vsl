/**
 * Servicio de integración de leads para la VSL Reducida.
 *
 * Comunica el formulario del frontend con el endpoint seguro del backend
 * (proyecto universidades: POST /active_campaign/leads/vsl/), el cual:
 * 1. Persiste el lead en base de datos (`ActiveCampaignContact`).
 * 2. Sincroniza el contacto con ActiveCampaign y aplica la etiqueta ('VSL_Reducida_Lead').
 * 3. Actualiza el campo personalizado 'Hace cuánto estás buscando trabajo' con el texto elegido por el usuario.
 */

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:8000';
const DEFAULT_TAG = (import.meta.env.VITE_AC_TAG as string) || 'VSL_Reducida_Lead';

/** Mapeo de valores técnicos del select a los textos legibles de ActiveCampaign */
export const SITUACION_LABELS: Record<string, string> = {
  'menos-de-un-mes': 'Menos de un mes',
  'entre-1-y-3-meses': 'Entre 1 y 3 meses',
  '1-a-3-meses': 'Entre 1 y 3 meses',
  'entre-3-y-6-meses': 'Entre 3 y 6 meses',
  '3-a-6-meses': 'Entre 3 y 6 meses',
  'mas-de-6-meses': 'Más de 6 meses',
  'tengo-trabajo-y-quiero-cambiar': 'Tengo trabajo y quiero cambiar',
};

export interface VslLeadPayload {
  nombre?: string;
  correo?: string;
  whatsapp?: string;
  situacion?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tagName?: string;
}

/** Alias retrocompatible */
export type AcLeadPayload = VslLeadPayload;

export interface BackendLeadResponse {
  status: 'ok' | 'error';
  message: string;
  contact_id?: string | null;
  synced_to_ac?: boolean;
  errors?: Record<string, string[]>;
}

/**
 * Registra un lead captado desde la VSL enviándolo al backend en universidades.
 *
 * @param payload Datos del formulario captados por el usuario
 * @returns true si el registro fue exitoso (o false ante error de red/servidor)
 */
export async function registrarLeadEnActiveCampaign(
  payload: VslLeadPayload
): Promise<boolean> {
  const {
    nombre = '',
    correo = '',
    whatsapp = '',
    situacion = '',
    email = '',
    firstName = '',
    lastName = '',
    phone = '',
    tagName = DEFAULT_TAG,
  } = payload;

  const endpoint = `${BACKEND_URL}/active_campaign/leads/vsl/`;

  // Asegurar que viaja el texto legible exacto para el campo personalizado de ActiveCampaign
  const situacionTexto = SITUACION_LABELS[situacion] || situacion;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: nombre || (firstName ? `${firstName} ${lastName}`.trim() : ''),
        correo: correo || email,
        whatsapp: whatsapp || phone,
        situacion: situacionTexto,
        tag_name: tagName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.warn(
        `[ActiveCampaign] Error del backend (${response.status}):`,
        errorData
      );
      return false;
    }

    const data: BackendLeadResponse = await response.json();
    console.info(
      `[ActiveCampaign] Lead registrado exitosamente ✅ (Contact ID: ${data.contact_id ?? 'N/A'}, Sincronizado AC: ${data.synced_to_ac})`
    );

    return data.status === 'ok';
  } catch (error) {
    console.error(
      '[ActiveCampaign] Error de conexión al registrar lead en el backend:',
      error
    );
    return false;
  }
}
