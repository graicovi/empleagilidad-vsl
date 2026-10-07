import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const OLD_RULES_ITEMS = [
  'Actualizar una vez más tu CV.',
  'Revisar y ajustar tu perfil de LinkedIn.',
  'Postular a más oportunidades.',
  'Activar contactos sin una dirección clara.',
  'Prepararte para entrevistas aisladas.',
];

/**
 * Sección Problema ("El punto de partida") que expone el desgaste de repetir estrategias obsoletas.
 */
export const ProblemSection: React.FC = () => {
  const sectionRef = useScrollReveal<HTMLElement>();

  return (
    <section ref={sectionRef} className="vsl-section vsl-problem-intro">
      <div className="vsl-shell vsl-split">
        <div>
          <div className="vsl-eyebrow">El punto de partida</div>
          <h2 className="vsl-h2">
            Aplicaste las reglas que conocías.{' '}
            <span className="vsl-market-line">
              El mercado <span className="vsl-accent">cambió.</span>
            </span>
          </h2>
          <p className="vsl-lead">
            Repetir con más intensidad la búsqueda que conocías no resuelve ese cambio. Necesitas una metodología construida para interpretarlo y actuar.
          </p>
        </div>

        <div className="vsl-old-rules">
          <div className="vsl-label">Lo que probablemente ya intentaste</div>
          <ul>
            {OLD_RULES_ITEMS.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <p className="vsl-old-rules-cost">
            Y, aun así, tu búsqueda sigue sin producir conversaciones y oportunidades a la altura de tu experiencia.
          </p>
        </div>
      </div>
    </section>
  );
};
