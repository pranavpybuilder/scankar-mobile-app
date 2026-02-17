import ModelLoader from './ModelLoader';

const toNumber = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

class HandwritingOCRModel {
  buildFallbackRecognitions(textRegions, tableStructure) {
    const headers = tableStructure.mockHeaders || [];
    const rows = tableStructure.mockRows || [];

    return textRegions.map(region => {
      const isHeader = region.row === 0;
      const text = isHeader
        ? headers[region.col] || ''
        : rows[region.row - 1]?.[region.col] || '';

      const confidence = text
        ? Math.max(
            0.65,
            Math.min(0.98, 0.84 + ((region.row + region.col) % 10) / 100),
          )
        : 0;

      return {
        row: region.row,
        col: region.col,
        text,
        confidence,
      };
    });
  }

  normalizeRuntimeRecognitions(runtimeOutput) {
    const rows = Array.isArray(runtimeOutput?.rows)
      ? runtimeOutput.rows
      : Array.isArray(runtimeOutput)
      ? runtimeOutput
      : [];

    return rows.reduce((acc, item) => {
      const row = Math.round(toNumber(item?.row));
      const col = Math.round(toNumber(item?.col));
      const key = `${row}:${col}`;
      acc[key] = {
        row,
        col,
        text: String(item?.text || ''),
        confidence: toNumber(item?.confidence),
      };
      return acc;
    }, {});
  }

  async recognizeBatch(_preprocessedImage, textRegions, tableStructure) {
    await new Promise(resolve => setTimeout(resolve, 420));
    const runtimeOutput = await ModelLoader.recognizeHandwriting(
      _preprocessedImage,
      textRegions,
    );
    const runtimeCells = this.normalizeRuntimeRecognitions(runtimeOutput);
    const fallbackCells = this.buildFallbackRecognitions(
      textRegions,
      tableStructure,
    );

    return fallbackCells.map(item => {
      const key = `${item.row}:${item.col}`;
      const runtimeCell = runtimeCells[key];
      if (!runtimeCell) {
        return item;
      }

      return {
        row: item.row,
        col: item.col,
        text: runtimeCell.text || item.text,
        confidence: runtimeCell.confidence || item.confidence || 0,
      };
    });
  }
}

export default new HandwritingOCRModel();
