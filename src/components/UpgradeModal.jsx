import { useEffect, useRef, useState } from 'react';

const PAYMENT_DELAY_MS = 1500;

export default function UpgradeModal({ onClose, onUpgrade }) {
  const [step, setStep] = useState('idle'); // idle | processing | error
  const buttonRef = useRef(null);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape' && step !== 'processing') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, step]);

  const handleUpgrade = async () => {
    setStep('processing');
    try {
      // Simulated payment
      await new Promise((resolve) => setTimeout(resolve, PAYMENT_DELAY_MS));
      await onUpgrade();
    } catch {
      setStep('error');
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="upgrade-title">
        <h2 id="upgrade-title">Has agotado tu cuota</h2>
        <p>
          Usaste todos los tokens de tu plan FREE este mes. Pasa al plan PRO para seguir generando
          respuestas con 60 solicitudes por minuto y 500.000 tokens mensuales.
        </p>

        {step === 'error' && (
          <p className="banner banner-error" role="alert">
            No se pudo completar la actualización. Inténtalo de nuevo.
          </p>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-primary"
            ref={buttonRef}
            onClick={handleUpgrade}
            disabled={step === 'processing'}
          >
            {step === 'processing' ? 'Procesando pago…' : 'Actualizar a PRO - $20/mes'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={step === 'processing'}>
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
