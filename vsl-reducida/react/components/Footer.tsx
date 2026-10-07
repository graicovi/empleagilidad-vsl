import React from 'react';

export interface FooterProps {
  isFormVariant?: boolean;
}

/**
 * Pie de página institucional con la marca y la descripción del programa.
 */
export const Footer: React.FC<FooterProps> = ({ isFormVariant = false }) => {
  return (
    <footer className={isFormVariant ? 'vsl-form-footer' : 'vsl-footer'}>
      <div className="vsl-brand">
        empleagilidad<span>.com</span>
      </div>
      <div>Programa para profesionales con experiencia</div>
    </footer>
  );
};
