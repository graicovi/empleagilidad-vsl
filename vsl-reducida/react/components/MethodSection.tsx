import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export interface MethodSectionProps {
  onCtaClick: () => void;
}

interface StepItem {
  number: number;
  question: string;
  description: string;
}

const METHOD_STEPS: StepItem[] = [
  {
    number: 1,
    question: '¿Qué cambió en tu profesión?',
    description: 'Interpreta cómo la IA está redefiniendo el valor en tu profesión.',
  },
  {
    number: 2,
    question: '¿Dónde puede volver a ser relevante tu experiencia?',
    description: 'Reconoce dónde tu trayectoria puede responder a problemas que hoy importan.',
  },
  {
    number: 3,
    question: '¿Qué necesitas demostrar ahora?',
    description: 'Convierte tu trayectoria en una propuesta creíble.',
  },
];

/**
 * Sección Metodología con los 3 pasos de transformación y llamada a la acción secundaria.
 */
export const MethodSection: React.FC<MethodSectionProps> = ({ onCtaClick }) => {
  const sectionRef = useScrollReveal<HTMLElement>();

  return (
    <section ref={sectionRef} className="vsl-section vsl-method">
      <div className="vsl-shell">
        <div className="vsl-method-head">
          <div>
            <div className="vsl-eyebrow">Una metodología para el mercado actual</div>
            <h2 className="vsl-h2">
              Empleagilidad cambia{' '}
              <span className="vsl-methodology-text">la metodología</span>{' '}
              <strong className="vsl-method-impact">por completo.</strong>
            </h2>
          </div>
          <p>
            Lo que funcionaba antes ya no alcanza para interpretar lo que ocurre ahora. Necesitas nuevas preguntas para descubrir dónde está tu siguiente oportunidad.
          </p>
        </div>

        <div className="vsl-journey">
          {METHOD_STEPS.map((step) => (
            <article key={step.number} className="vsl-step">
              <span className="vsl-number">{step.number}</span>
              <h3>{step.question}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>

        <div className="vsl-method-cta">
          <button
            type="button"
            className="vsl-button"
            onClick={onCtaClick}
          >
            Quiero postular a Empleagilidad
          </button>
        </div>
      </div>
    </section>
  );
};
