import React from 'react';
import { Header } from './Header';

export interface HeroSectionProps {
  onCtaClick: () => void;
  onBrandClick?: () => void;
}

/**
 * Sección Hero con propuesta de valor de impacto, frame de video y llamada a la acción principal.
 */
export const HeroSection: React.FC<HeroSectionProps> = ({
  onCtaClick,
  onBrandClick,
}) => {
  return (
    <section className="vsl-hero">
      <div className="vsl-shell">
        <Header onBrandClick={onBrandClick} />

        <div className="vsl-hero-copy">
          <div className="vsl-eyebrow">Programa para profesionales con experiencia</div>
          <h1 className="vsl-h1">
            Intentaste todo.<br />
            El trabajo que conocías<br />
            <span className="vsl-accent vsl-hero-accent-fade">ya cambió.</span>
          </h1>
          <p className="vsl-ai-cause">
            La <strong>inteligencia artificial</strong> está transformando tu profesión<br />
            y las reglas por las que las empresas contratan.
          </p>
        </div>

        <div
          className="vsl-video-frame"
          aria-label="Video VSL: mercado, dirección y ejecución"
          role="img"
        >
          <span className="vsl-video-play" aria-hidden="true" />
        </div>

        <button
          type="button"
          className="vsl-button"
          onClick={onCtaClick}
        >
          Quiero postular a Empleagilidad
        </button>

        <div className="vsl-microcopy">
          Postulación para profesionales con experiencia · Revisaremos tu perfil antes de confirmar el siguiente paso
        </div>
      </div>
    </section>
  );
};
