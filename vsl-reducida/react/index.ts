/**
 * Módulo de VSL Reducida en React (TypeScript)
 * Variante aislada y fiel al diseño original de los HTMLs.
 */

// Servicio de integración con ActiveCampaign (Backend Django)
export { registrarLeadEnActiveCampaign } from './services/activecampaign';
export type { VslLeadPayload, AcLeadPayload } from './services/activecampaign';

export { VslReducidaApp, default } from './VslReducidaApp';
export type { VslReducidaAppProps, VslViewMode } from './VslReducidaApp';

// Componentes modulares
export { Header } from './components/Header';
export type { HeaderProps } from './components/Header';

export { HeroSection } from './components/HeroSection';
export type { HeroSectionProps } from './components/HeroSection';

export { ProblemSection } from './components/ProblemSection';

export { DoubleChangeSection } from './components/DoubleChangeSection';

export { MethodSection } from './components/MethodSection';
export type { MethodSectionProps } from './components/MethodSection';

export { ExitModal } from './components/ExitModal';
export type { ExitModalProps } from './components/ExitModal';

export { ApplicationForm } from './components/ApplicationForm';
export type { ApplicationFormProps } from './components/ApplicationForm';

export { Footer } from './components/Footer';
export type { FooterProps } from './components/Footer';

// Hooks desacoplados
export { useExitIntent } from './hooks/useExitIntent';
export type { UseExitIntentOptions, UseExitIntentReturn } from './hooks/useExitIntent';

export { useScrollReveal } from './hooks/useScrollReveal';

export { useApplicationForm, INITIAL_FORM_VALUES } from './hooks/useApplicationForm';
export type { ApplicationFormData, UseApplicationFormOptions } from './hooks/useApplicationForm';
