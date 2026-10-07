import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'empleagilidad-exit-seen';

export interface UseExitIntentOptions {
  /** Deshabilita el modal si el usuario navega deliberadamente a la acción principal */
  disabled?: boolean;
}

export interface UseExitIntentReturn {
  isModalOpen: boolean;
  openModal: (force?: boolean) => void;
  closeModal: () => void;
  suppressExitIntent: () => void;
}

/**
 * Custom Hook para gestionar la intención de salida (Exit Intent)
 * Detecta cuando el cursor del usuario abandona el viewport por la parte superior,
 * respetando el almacenamiento en sesión para no ser intrusivo.
 */
export function useExitIntent(options: UseExitIntentOptions = {}): UseExitIntentReturn {
  const { disabled = false } = options;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const suppressRef = useRef<boolean>(false);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  const hasSeenExitInSession = useCallback((): boolean => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }, []);

  const markExitAsSeen = useCallback((): void => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Entorno privado o sin almacenamiento disponible
    }
  }, []);

  const openModal = useCallback((force = false) => {
    if (disabled || (!force && suppressRef.current) || (!force && hasSeenExitInSession())) {
      return;
    }

    lastActiveElementRef.current = document.activeElement as HTMLElement | null;
    markExitAsSeen();
    setIsModalOpen(true);
    document.body.classList.add('vsl-modal-open');
  }, [disabled, hasSeenExitInSession, markExitAsSeen]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    document.body.classList.remove('vsl-modal-open');

    // Restaurar el foco previo para accesibilidad
    if (lastActiveElementRef.current && typeof lastActiveElementRef.current.focus === 'function') {
      lastActiveElementRef.current.focus();
    }
  }, []);

  const suppressExitIntent = useCallback(() => {
    suppressRef.current = true;
  }, []);

  useEffect(() => {
    if (disabled) return;

    // Detectar cuando el mouse sale por el margen superior del navegador
    const handleMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget && event.clientY <= 12) {
        openModal(false);
      }
    };

    // Cerrar con Escape
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('vsl-modal-open');
    };
  }, [disabled, isModalOpen, openModal, closeModal]);

  return {
    isModalOpen,
    openModal,
    closeModal,
    suppressExitIntent,
  };
}
