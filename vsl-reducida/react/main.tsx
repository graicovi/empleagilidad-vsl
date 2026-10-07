import React from 'react';
import ReactDOM from 'react-dom/client';
import { VslReducidaApp } from './VslReducidaApp';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Elemento root no encontrado en el DOM.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <VslReducidaApp
      onFormSubmit={(data) => {
        // Log para depuración interna; la confirmación visual ya se renderiza en la propia tarjeta del formulario
        console.info('[VSL Reducida] Postulación enviada exitosamente:', data);
      }}
    />
  </React.StrictMode>
);
