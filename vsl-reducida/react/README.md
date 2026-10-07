# VSL Reducida — Versión React (TypeScript)

Esta carpeta contiene la implementación modular en **React + TypeScript** de la VSL Reducida, replicando con exactitud 1:1 el diseño, los estilos, las tipografías y el comportamiento de [`vsl_pagina_reducida_v1.html`](../vsl_pagina_reducida_v1.html) y [`vsl_formulario_reducido_v1.html`](../vsl_formulario_reducido_v1.html).

Los archivos originales en `vsl-reducida/` y en la raíz del repositorio se han mantenido **100% intactos**.

---

## 🚀 Uso Rápido

### 1. Importar el componente orquestador completo
```tsx
import React from 'react';
import { VslReducidaApp } from './vsl-reducida/react';

export function PaginaVSL() {
  const handleFormSubmit = async (data) => {
    console.log('Datos recibidos de postulación:', data);
    // Enviar a tu API / Webhook / CRM
  };

  return (
    <VslReducidaApp
      initialView="landing"
      onFormSubmit={handleFormSubmit}
      diagnosticUrl="https://production.doctor-cv.pro/spa/test-empleabilidad"
    />
  );
}
```

---

## 🧱 Estructura Modular

```text
vsl-reducida/react/
├── index.ts                     # Barrel export de componentes y hooks
├── VslReducidaApp.tsx           # Componente orquestador con alternancia de vistas
├── components/
│   ├── Header.tsx               # Encabezado con identidad empleagilidad.com
│   ├── HeroSection.tsx          # Titular, video mockup con play pulsante y CTA
│   ├── ProblemSection.tsx       # Sección "El punto de partida" + tarjetas viejas reglas
│   ├── DoubleChangeSection.tsx  # Tarjetas comparativas 01 y 02
│   ├── MethodSection.tsx        # Sección Metodología en 3 pasos + CTA
│   ├── ExitModal.tsx            # Modal de salida accesible con focus trap y escape
│   ├── ApplicationForm.tsx      # Formulario reactivo completo de postulación
│   └── Footer.tsx               # Pie de página compartido
├── hooks/
│   ├── useExitIntent.ts         # Hook para detección de intención de salida
│   ├── useScrollReveal.ts       # Hook de revelación suave por scroll (IntersectionObserver)
│   └── useApplicationForm.ts    # Hook de estado controlado y validación de formulario
└── styles/
    └── vsl-reducida.css         # Tokens, tipografías, animaciones y media queries
```

---

## 📦 Características Técnicas
- **Cero dependencias externas:** Animaciones de scroll mediante `IntersectionObserver` nativo y CSS, sin requerir librerías pesadas por CDN.
- **Accesibilidad:** Soporta `prefers-reduced-motion`, etiquetas semánticas y cierre por tecla `Escape`.
- **Integridad de Assets:** Utiliza directamente las imágenes existentes en la carpeta padre (`../vsl_hero_referencia_sin_play.png` y `../vsl_hero_mobile_propuesta.png`).
