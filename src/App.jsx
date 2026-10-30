import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, fetchHistory, fetchStatus, generate, upgradePlan } from './api.js';
import useCountdown from './hooks/useCountdown.js';
import ChatPanel from './components/ChatPanel.jsx';
import PlanBadge from './components/PlanBadge.jsx';
import UpgradeModal from './components/UpgradeModal.jsx';
import UsageChart from './components/UsageChart.jsx';
import UsagePanel from './components/UsagePanel.jsx';

const USER_ID = 'demo-user';
const DEFAULT_RETRY_SECONDS = 60;

export default function App() {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [resetAt, setResetAt] = useState(null);
  const [blockedUntil, setBlockedUntil] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const idRef = useRef(0);

  const nextId = () => {
    idRef.current += 1;
    return idRef.current;
  };

  const resetSeconds = useCountdown(resetAt);
  const blockedSeconds = useCountdown(blockedUntil);

  const refreshStatus = useCallback(async () => {
    try {
      const data = await fetchStatus(USER_ID);
      setStatus(data);
      setResetAt(data.secondsToReset > 0 ? Date.now() + data.secondsToReset * 1000 : null);
    } catch {
      // The panel keeps showing the last known values.
    }
  }, []);

  const refreshHistory = useCallback(async () => {
    try {
      setHistory(await fetchHistory(USER_ID));
    } catch {
      // The chart keeps showing the last known values.
    }
  }, []);

  useEffect(() => {
    refreshStatus();
    refreshHistory();
  }, [refreshStatus, refreshHistory]);

  // When the request window or the block expires, sync with the server.
  useEffect(() => {
    if (resetAt && resetSeconds === 0) {
      setResetAt(null);
      refreshStatus();
    }
  }, [resetAt, resetSeconds, refreshStatus]);

  useEffect(() => {
    if (blockedUntil && blockedSeconds === 0) {
      setBlockedUntil(null);
      refreshStatus();
    }
  }, [blockedUntil, blockedSeconds, refreshStatus]);

  const handleSend = async () => {
    const text = prompt.trim();
    if (!text || sending || blockedSeconds > 0) return;

    const userMessageId = nextId();
    setMessages((prev) => [...prev, { id: userMessageId, role: 'user', text }]);
    setPrompt('');
    setSending(true);

    try {
      const data = await generate(text, USER_ID);
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'assistant', text: data.text, tokens: data.tokensUsed },
      ]);
    } catch (error) {
      // Restore the prompt so the user can resend it later.
      setMessages((prev) => prev.filter((message) => message.id !== userMessageId));
      setPrompt(text);

      if (error instanceof ApiError && error.status === 429) {
        setBlockedUntil(Date.now() + (error.retryAfter ?? DEFAULT_RETRY_SECONDS) * 1000);
      } else if (error instanceof ApiError && error.status === 402) {
        setShowUpgrade(true);
      } else {
        const errorText =
          error instanceof ApiError && error.status === 0
            ? 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'
            : 'Ocurrió un error inesperado. Inténtalo de nuevo.';
        setMessages((prev) => [...prev, { id: nextId(), role: 'error', text: errorText }]);
      }
    } finally {
      setSending(false);
      refreshStatus();
      refreshHistory();
    }
  };

  const handleUpgrade = async () => {
    await upgradePlan(USER_ID);
    await refreshStatus();
    setShowUpgrade(false);
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: 'notice', text: 'Plan actualizado a PRO. Ya puedes reenviar tu mensaje.' },
    ]);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <h1>Consola IA</h1>
        </div>
        <div className="topbar-user">
          <span className="muted">Usuario: {USER_ID}</span>
          <PlanBadge plan={status?.plan} />
        </div>
      </header>

      <main className="layout">
        <ChatPanel
          messages={messages}
          prompt={prompt}
          onPromptChange={setPrompt}
          onSend={handleSend}
          sending={sending}
          blockedSeconds={blockedSeconds}
        />
        <aside className="sidebar">
          <UsagePanel status={status} resetSeconds={resetSeconds} />
          <UsageChart history={history} />
        </aside>
      </main>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} onUpgrade={handleUpgrade} />}
    </div>
  );
}
