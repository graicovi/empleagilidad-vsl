import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import {
  useApplicationForm,
  ApplicationFormData,
} from '../hooks/useApplicationForm';

export interface ApplicationFormProps {
  onSubmit?: (data: ApplicationFormData) => void | Promise<void>;
  onBack?: () => void;
}

/**
 * Vista completa del Formulario de Postulación de Empleagilidad.
 */
export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  onSubmit,
  onBack,
}) => {
  const { values, isSubmitting, isSuccess, handleChange, handleSubmit } =
    useApplicationForm({ onSubmit });

  return (
    <main className="vsl-form-page">
      <div className="vsl-brandline">
        <Header onBrandClick={onBack} ariaLabel="Volver a la página principal" />
      </div>

      <section className="vsl-form-content">
        <div className="vsl-form-intro">
          <p className="vsl-eyebrow">Programa para profesionales con experiencia</p>
          <h1>Déjanos tus datos para ver las condiciones de ingreso.</h1>
          <p className="vsl-lead">
            Con esto te reservamos un lugar mientras revisas el detalle del programa.
          </p>
        </div>

        {isSuccess ? (
          <div className="vsl-form-card" style={{ textAlign: 'center' }}>
            <h2 className="vsl-h2" style={{ fontSize: '38px', marginBottom: '18px' }}>
              ¡Postulación recibida!
            </h2>
            <p className="vsl-p" style={{ fontSize: '18px' }}>
              Nos pondremos en contacto contigo vía WhatsApp y correo en breve.
            </p>
            {onBack && (
              <button
                type="button"
                className="vsl-button"
                style={{ marginTop: '24px', minWidth: '220px' }}
                onClick={onBack}
              >
                Volver al inicio
              </button>
            )}
          </div>
        ) : (
          <form className="vsl-form-card" onSubmit={handleSubmit} noValidate={false}>
            <div className="vsl-field">
              <label htmlFor="nombre">Nombre completo</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                autoComplete="name"
                value={values.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="vsl-field">
              <label htmlFor="correo">Correo</label>
              <input
                id="correo"
                name="correo"
                type="email"
                autoComplete="email"
                value={values.correo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="vsl-field">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                autoComplete="tel"
                placeholder="Ejemplo +51 y el número completo"
                value={values.whatsapp}
                onChange={handleChange}
                required
              />
            </div>

            <div className="vsl-field">
              <label htmlFor="situacion">Hace cuánto estás buscando trabajo</label>
              <select
                id="situacion"
                name="situacion"
                value={values.situacion}
                onChange={handleChange}
                required
              >
                <option value="menos-de-un-mes">Menos de un mes</option>
                <option value="entre-1-y-3-meses">Entre 1 y 3 meses</option>
                <option value="entre-3-y-6-meses">Entre 3 y 6 meses</option>
                <option value="mas-de-6-meses">Más de 6 meses</option>
                <option value="tengo-trabajo-y-quiero-cambiar">
                  Tengo trabajo y quiero cambiar
                </option>
              </select>
            </div>

            <button
              className="vsl-form-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Ver el programa completo'}
            </button>

            <p className="vsl-group-info">Grupo de 15 · inicio Noviembre 2026</p>
            <p className="vsl-privacy">Tus datos no se comparten con terceros.</p>
          </form>
        )}
      </section>

      <Footer isFormVariant />
    </main>
  );
};
