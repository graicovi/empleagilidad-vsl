import { useState, ChangeEvent, FormEvent } from 'react';
import { registrarLeadEnActiveCampaign } from '../services/activecampaign';

export interface ApplicationFormData {
  nombre: string;
  correo: string;
  whatsapp: string;
  situacion: string;
}

export interface UseApplicationFormOptions {
  initialValues?: Partial<ApplicationFormData>;
  /** Callback adicional ejecutado después del envío (ej. redirigir o trackear) */
  onSubmit?: (data: ApplicationFormData) => void | Promise<void>;
}

export const INITIAL_FORM_VALUES: ApplicationFormData = {
  nombre: '',
  correo: '',
  whatsapp: '',
  situacion: 'menos-de-un-mes',
};

/** Nombre del tag que dispara la automatización en ActiveCampaign */
const AC_TAG = 'VSL_Reducida_Lead';

/**
 * Custom Hook para gestionar el estado, validación y envío del formulario de postulación.
 * Al hacer submit, registra automáticamente el lead en el backend (universidades),
 * el cual persiste los datos y sincroniza con ActiveCampaign aplicando la etiqueta VSL_Reducida_Lead.
 */
export function useApplicationForm(options: UseApplicationFormOptions = {}) {
  const { initialValues = {}, onSubmit } = options;

  const [values, setValues] = useState<ApplicationFormData>({
    ...INITIAL_FORM_VALUES,
    ...initialValues,
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [acError, setAcError] = useState<boolean>(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setAcError(false);

    try {
      // Enviar el lead al backend (universidades) con el tag de la VSL Reducida
      const success = await registrarLeadEnActiveCampaign({
        nombre: values.nombre,
        correo: values.correo,
        whatsapp: values.whatsapp,
        situacion: values.situacion,
        tagName: AC_TAG,
      });

      if (!success) {
        // Si el backend no respondió, marcamos el flag de alerta no-bloqueante
        setAcError(true);
        console.warn('[Formulario] No se pudo sincronizar el lead con el backend.');
      }

      // Callback personalizado adicional (ej. redirigir o tracking de analítica)
      if (onSubmit) {
        await onSubmit(values);
      }

      setIsSuccess(true);
    } catch (error) {
      console.error('[Formulario] Error inesperado al enviar la postulación:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setValues(INITIAL_FORM_VALUES);
    setIsSuccess(false);
    setIsSubmitting(false);
    setAcError(false);
  };

  return {
    values,
    isSubmitting,
    isSuccess,
    /** true si el backend falló (pero el formulario igual se mostró como exitoso para el usuario) */
    acError,
    handleChange,
    handleSubmit,
    resetForm,
  };
}
