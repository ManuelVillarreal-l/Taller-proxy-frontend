export default function PlanBadge({ plan }) {
  const key = (plan || 'FREE').toLowerCase();
  return <span className={`plan-badge plan-${key}`}>{plan || 'FREE'}</span>;
}
