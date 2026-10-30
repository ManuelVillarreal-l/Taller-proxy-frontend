import PlanBadge from './PlanBadge.jsx';
import { formatLongDate, formatNumber } from '../utils.js';

export default function UsagePanel({ status, resetSeconds }) {
  if (!status) {
    return (
      <section className="panel usage" aria-busy="true">
        <p className="muted">Cargando consumo…</p>
      </section>
    );
  }

  const unlimitedTokens = status.tokensLimit < 0;
  const unlimitedRequests = status.reqPerMinLimit < 0;
  const percent = unlimitedTokens ? 0 : Math.min(100, (status.tokensUsed / status.tokensLimit) * 100);
  const level = percent >= 90 ? 'danger' : percent >= 70 ? 'warn' : 'ok';

  return (
    <section className="panel usage" aria-label="Consumo">
      <div className="usage-head">
        <h2>Tu consumo</h2>
        <PlanBadge plan={status.plan} />
      </div>

      <div className="meter-block">
        <div className="meter-figures">
          <strong>{unlimitedTokens ? 'Ilimitado' : `${percent.toFixed(1)}%`}</strong>
          <span>
            {formatNumber(status.tokensUsed)} /{' '}
            {unlimitedTokens ? '∞' : formatNumber(status.tokensLimit)} tokens
          </span>
        </div>
        <div
          className={`meter meter-${level}`}
          role="progressbar"
          aria-label="Tokens usados"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
        >
          <div className="meter-fill" style={{ width: `${percent}%` }} />
        </div>
        <p className="muted small">
          {unlimitedTokens
            ? 'Tu plan no tiene límite de tokens.'
            : `Disponibles: ${formatNumber(status.tokensRemaining)} tokens. Se renuevan el ${formatLongDate(status.resetDate)}.`}
        </p>
      </div>

      <div className="rate-block">
        <p className="rate-count">
          {unlimitedRequests
            ? `${status.reqPerMinUsed} solicitudes usadas (sin límite)`
            : `${status.reqPerMinUsed} / ${status.reqPerMinLimit} solicitudes usadas`}
        </p>
        <p className="muted small">
          {resetSeconds > 0 ? `Se reinicia en ${resetSeconds}s` : 'Ventana de solicitudes disponible'}
        </p>
      </div>
    </section>
  );
}
