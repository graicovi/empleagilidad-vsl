import React, { useState } from 'react';
import './styles/vsl-reducida.css';

import { HeroSection } from './components/HeroSection';
import { ProblemSection } from './components/ProblemSection';
import { DoubleChangeSection } from './components/DoubleChangeSection';
import { MethodSection } from './components/MethodSection';
import { Footer } from './components/Footer';
import { ExitModal } from './components/ExitModal';
import { ApplicationForm } from './components/ApplicationForm';
import { useExitIntent } from './hooks/useExitIntent';
import { ApplicationFormData } from './hooks/useApplicationForm';

export type VslViewMode = 'landing' | 'form';

export interface VslReducidaAppProps {
  /** Vista inicial por defecto ('landing' o 'form') */
  initialView?: VslViewMode;
  /** Callback para procesar el envío del formulario */
  onFormSubmit?: (data: ApplicationFormData) => void | Promise<void>;
  /** Enlace externo para el test de diagnóstico en el modal de salida */
  diagnosticUrl?: string;
}

/**
 * Componente orquestador principal de la variante VSL Reducida en React.
 * Permite alternar limpiamente entre la página de ventas y el formulario de captura.
 */
export const VslReducidaApp: React.FC<VslReducidaAppProps> = ({
  initialView = 'landing',
  onFormSubmit,
  diagnosticUrl,
}) => {
  const [currentView, setCurrentView] = useState<VslViewMode>(initialView);

  // Hook de intención de salida (solo activo en la landing)
  const { isModalOpen, openModal, closeModal, suppressExitIntent } = useExitIntent({
    disabled: currentView === 'form',
  });

  const handleNavigateToForm = () => {
    suppressExitIntent();
    setCurrentView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToLanding = () => {
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentView === 'form') {
    return (
      <div className="vsl-scope">
        <ApplicationForm
          onSubmit={onFormSubmit}
          onBack={handleNavigateToLanding}
        />
      </div>
    );
  }

  return (
    <div className="vsl-scope">
      <main className="vsl-page">
        <HeroSection
          onCtaClick={handleNavigateToForm}
          onBrandClick={() => openModal(true)}
        />

        <ProblemSection />

        <DoubleChangeSection />

        <MethodSection onCtaClick={handleNavigateToForm} />

        <Footer />
      </main>

      <ExitModal
        isOpen={isModalOpen}
        onClose={closeModal}
        diagnosticUrl={diagnosticUrl}
      />
    </div>
  );
};

export default VslReducidaApp;
