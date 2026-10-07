import React from 'react';

interface ChangeCardData {
  number: string;
  title: string;
  description: string;
}

const CARDS: ChangeCardData[] = [
  {
    number: '01',
    title: 'Tu CV creado con IA se parece a todos los demás.',
    description: 'Cuando cualquiera puede producir un CV correcto en minutos, lo correcto deja de diferenciarte.',
  },
  {
    number: '02',
    title: 'La IA no solo cambia tu CV. Cambia el valor por el que te contratan.',
    description: 'Se transforman las tareas, las capacidades y los problemas que las organizaciones necesitan resolver.',
  },
];

/**
 * Sección comparativa que contrasta el doble impacto de la inteligencia artificial.
 */
export const DoubleChangeSection: React.FC = () => {
  return (
    <section
      className="vsl-double-change"
      aria-label="El doble cambio provocado por la inteligencia artificial"
    >
      {CARDS.map((card) => (
        <article key={card.number} className="vsl-change-card">
          <span className="vsl-num">{card.number}</span>
          <h3>{card.title}</h3>
          <p>{card.description}</p>
        </article>
      ))}
    </section>
  );
};
