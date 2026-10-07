import React from 'react';

export interface ExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosticUrl?: string;
}

/**
 * Modal de salida (Exit Intent) que ofrece un test de diagnóstico gratuito.
 */
export const ExitModal: React.FC<ExitModalProps> = ({
  isOpen,
  onClose,
  diagnosticUrl = 'https://production.doctor-cv.pro/spa/test-empleabilidad',
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="vsl-exit-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vsl-exit-title"
      onClick={handleBackdropClick}
    >
      <div className="vsl-exit-card">
        <button
          className="vsl-modal-close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana"
        >
          ×
        </button>

        <h2 id="vsl-exit-title" className="vsl-h2">
          El trabajo cambió.{' '}
          <span className="vsl-accent">
            Tu estrategia profesional también tiene que cambiar.
          </span>
        </h2>

        <p>Averigua qué está frenando tu estrategia de búsqueda.</p>

        <a
          className="vsl-button"
          href={diagnosticUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Quiero mi diagnóstico gratis
        </a>
      </div>
    </div>
  );
};
