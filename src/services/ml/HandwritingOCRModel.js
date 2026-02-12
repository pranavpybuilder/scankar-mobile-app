class HandwritingOCRModel {
  async recognizeBatch(_preprocessedImage, textRegions, tableStructure) {
    await new Promise(resolve => setTimeout(resolve, 420));
    const headers = tableStructure.mockHeaders || [];
    const rows = tableStructure.mockRows || [];

    return textRegions.map(region => {
      const isHeader = region.row === 0;
      const text = isHeader
        ? headers[region.col] || ''
        : rows[region.row - 1]?.[region.col] || '';

      const confidence = text
        ? Math.max(0.65, Math.min(0.98, 0.84 + ((region.row + region.col) % 10) / 100))
        : 0;

      return {
        row: region.row,
        col: region.col,
        text,
        confidence,
      };
    });
  }
}

export default new HandwritingOCRModel();
