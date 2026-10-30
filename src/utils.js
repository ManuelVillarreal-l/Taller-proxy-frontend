const numberFormat = new Intl.NumberFormat('es-CO');

export const formatNumber = (value) => numberFormat.format(value);

export const estimateTokens = (text) => (text.length === 0 ? 0 : Math.max(1, Math.floor(text.length / 4)));

export const formatShortDate = (isoDate) => {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
};

export const formatLongDate = (isoDate) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
