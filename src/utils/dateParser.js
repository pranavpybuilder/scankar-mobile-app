export const isDateLike = value => /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(String(value || '').trim());

export const normalizeDateString = value => {
  const raw = String(value || '').trim();
  if (!isDateLike(raw)) {
    return raw;
  }
  const [dd, mm, yy] = raw.split('/');
  const yyyy = yy.length === 2 ? `20${yy}` : yy;
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
};
