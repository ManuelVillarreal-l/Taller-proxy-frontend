import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatNumber, formatShortDate } from '../utils.js';

export default function UsageChart({ history }) {
  const data = history.map((entry) => ({ label: formatShortDate(entry.date), tokens: entry.tokens }));
  const hasUsage = history.some((entry) => entry.tokens > 0);

  return (
    <section className="panel chart" aria-label="Consumo de los últimos 7 días">
      <h2>Últimos 7 días</h2>
      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D5DCE5" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: 'rgba(31, 58, 95, 0.08)' }}
              formatter={(value) => [`${formatNumber(value)} tokens`, 'Consumo']}
              labelFormatter={(label) => `Día ${label}`}
            />
            <Bar dataKey="tokens" name="Tokens" fill="#1F3A5F" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {!hasUsage && <p className="muted small">Aún no hay consumo registrado. Envía un mensaje para verlo aquí.</p>}
    </section>
  );
}
