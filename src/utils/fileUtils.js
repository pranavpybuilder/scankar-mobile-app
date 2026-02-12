export const sanitizeFileName = name => (name || 'scan')
  .replace(/[\\/:*?"<>|]/g, '_')
  .replace(/\s+/g, '_')
  .toLowerCase();

export const getTimestampFileName = prefix =>
  `${sanitizeFileName(prefix)}_${new Date().toISOString().replace(/[:.]/g, '-')}`;
