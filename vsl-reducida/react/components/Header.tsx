import React from 'react';

export interface HeaderProps {
  /** Callback opcional cuando el usuario hace clic en el logo (usado para probar el modal de diagnóstico) */
  onBrandClick?: () => void;
  /** Etiqueta descriptiva del botón para lectores de pantalla */
  ariaLabel?: string;
}

/**
 * Componente de encabezado con la identidad visual empleagilidad.com
 */
export const Header: React.FC<HeaderProps> = ({
  onBrandClick,
  ariaLabel = 'Mostrar mensaje de diagnóstico',
}) => {
  return (
    <div className="vsl-brandline">
      {onBrandClick ? (
        <button
          className="vsl-brand"
          type="button"
          onClick={onBrandClick}
          aria-label={ariaLabel}
        >
          empleagilidad<span>.com</span>
        </button>
      ) : (
        <div className="vsl-brand">
          empleagilidad<span>.com</span>
        </div>
      )}
    </div>
  );
};
