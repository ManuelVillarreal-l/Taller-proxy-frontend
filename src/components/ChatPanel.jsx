import { useEffect, useRef } from 'react';
import { estimateTokens, formatNumber } from '../utils.js';

export default function ChatPanel({
  messages,
  prompt,
  onPromptChange,
  onSend,
  sending,
  blockedSeconds,
}) {
  const endRef = useRef(null);
  const blocked = blockedSeconds > 0;
  const canSend = prompt.trim().length > 0 && !sending && !blocked;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (canSend) onSend();
    }
  };

  return (
    <section className="panel chat" aria-label="Conversación">
      <div className="chat-messages" aria-live="polite">
        {messages.length === 0 && !sending && (
          <div className="chat-empty">
            <h2>Empieza una conversación</h2>
            <p>Escribe una pregunta abajo. Cada mensaje descuenta tokens de tu cuota mensual.</p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`message message-${message.role}`}>
            <p>{message.text}</p>
            {message.tokens != null && (
              <span className="message-meta">{formatNumber(message.tokens)} tokens consumidos</span>
            )}
          </div>
        ))}

        {sending && (
          <div className="message message-assistant message-pending">
            <p>Generando respuesta…</p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {blocked && (
        <div className="banner banner-warning" role="alert">
          Límite de solicitudes alcanzado. Espera {blockedSeconds}s
        </div>
      )}

      <div className="composer">
        <label htmlFor="prompt" className="visually-hidden">
          Tu mensaje
        </label>
        <textarea
          id="prompt"
          rows={3}
          value={prompt}
          placeholder="Escribe tu mensaje aquí…"
          onChange={(event) => onPromptChange(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={4000}
        />
        <div className="composer-footer">
          <span className="estimate">Tokens estimados: ~{estimateTokens(prompt)}</span>
          <button type="button" className="btn btn-primary" onClick={onSend} disabled={!canSend}>
            {blocked ? `Espera ${blockedSeconds}s` : sending ? 'Enviando…' : 'Enviar'}
          </button>
        </div>
      </div>
    </section>
  );
}
