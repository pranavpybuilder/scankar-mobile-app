const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const DEFAULT_PERSPECTIVE_POINTS = [
  {x: 0.08, y: 0.1},
  {x: 0.92, y: 0.1},
  {x: 0.92, y: 0.9},
  {x: 0.08, y: 0.9},
];

export const toFileUri = pathOrUri => {
  if (!pathOrUri) {
    return '';
  }
  if (
    pathOrUri.startsWith('file://') ||
    pathOrUri.startsWith('content://') ||
    pathOrUri.startsWith('http://') ||
    pathOrUri.startsWith('https://')
  ) {
    return pathOrUri;
  }
  return `file://${pathOrUri}`;
};

export const stripFileProtocol = uri =>
  typeof uri === 'string' && uri.startsWith('file://') ? uri.slice(7) : uri || '';

export const normalizePerspectivePoints = points => {
  if (!Array.isArray(points) || points.length !== 4) {
    return DEFAULT_PERSPECTIVE_POINTS;
  }
  return points.map(point => ({
    x: clamp(Number(point?.x) || 0, 0, 1),
    y: clamp(Number(point?.y) || 0, 0, 1),
  }));
};

export const normalizeRotation = rotation => {
  const num = Number(rotation) || 0;
  const snapped = Math.round(num / 90) * 90;
  return ((snapped % 360) + 360) % 360;
};

export const buildPreprocessOptions = raw => {
  const imageWidth = Number(raw?.imageWidth) || undefined;
  const imageHeight = Number(raw?.imageHeight) || undefined;
  return {
    rotation: normalizeRotation(raw?.rotation || 0),
    cropRect: raw?.cropRect
      ? {
          x: Math.max(0, Number(raw.cropRect.x) || 0),
          y: Math.max(0, Number(raw.cropRect.y) || 0),
          width: Math.max(0, Number(raw.cropRect.width) || 0),
          height: Math.max(0, Number(raw.cropRect.height) || 0),
        }
      : null,
    perspectivePoints: normalizePerspectivePoints(raw?.perspectivePoints),
    imageWidth,
    imageHeight,
    source: raw?.source || 'camera',
    userAdjusted: Boolean(raw?.userAdjusted),
  };
};
