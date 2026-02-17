import ModelLoader from './ModelLoader';

const toNumber = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

class TextDetectionModel {
  buildFallbackRegion(cell) {
    const insetX = Math.max(2, Math.round((cell.w || 0) * 0.04));
    const insetY = Math.max(2, Math.round((cell.h || 0) * 0.12));
    return {
      ...cell,
      bbox: {
        x: cell.x + insetX,
        y: cell.y + insetY,
        w: Math.max(0, cell.w - insetX * 2),
        h: Math.max(0, cell.h - insetY * 2),
      },
    };
  }

  normalizeRuntimeRegions(runtimeRegions) {
    if (!Array.isArray(runtimeRegions)) {
      return {};
    }

    return runtimeRegions.reduce((acc, region) => {
      const row = Math.round(toNumber(region?.row));
      const col = Math.round(toNumber(region?.col));
      const key = `${row}:${col}`;
      const bbox = region?.bbox || {};

      acc[key] = {
        row,
        col,
        bbox: {
          x: toNumber(bbox.x ?? region?.x),
          y: toNumber(bbox.y ?? region?.y),
          w: toNumber(bbox.w ?? bbox.width ?? region?.w ?? region?.width),
          h: toNumber(bbox.h ?? bbox.height ?? region?.h ?? region?.height),
        },
        confidence: toNumber(region?.confidence),
      };
      return acc;
    }, {});
  }

  async detectTextInCells(_preprocessedImage, cells) {
    await new Promise(resolve => setTimeout(resolve, 220));
    const runtimeResult = await ModelLoader.detectTextInCells(
      _preprocessedImage,
      cells,
    );
    const runtimeRegions = this.normalizeRuntimeRegions(
      runtimeResult?.regions || runtimeResult,
    );

    return cells.map(cell => {
      const key = `${cell.row}:${cell.col}`;
      const runtimeCell = runtimeRegions[key];
      if (!runtimeCell) {
        return this.buildFallbackRegion(cell);
      }

      return {
        ...cell,
        bbox: {
          x: runtimeCell.bbox.x || cell.x,
          y: runtimeCell.bbox.y || cell.y,
          w: runtimeCell.bbox.w || cell.w,
          h: runtimeCell.bbox.h || cell.h,
        },
        confidence: runtimeCell.confidence || 0,
      };
    });
  }
}

export default new TextDetectionModel();
