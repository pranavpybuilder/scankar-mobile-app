class TableReconstructor {
  buildTable(tableStructure, recognizedText) {
    const rowCount = tableStructure?.rows?.length || 0;
    const colCount = tableStructure?.columns?.length || 0;

    const matrix = Array.from({length: rowCount}, () =>
      Array.from({length: colCount}, () => ({text: '', confidence: 0})),
    );

    recognizedText.forEach(item => {
      if (item.row < rowCount && item.col < colCount) {
        matrix[item.row][item.col] = {
          text: item.text || '',
          confidence: item.confidence || 0,
        };
      }
    });

    const headers = matrix[0].map(cell => cell.text || '');
    const data = matrix.slice(1).map((row, rowIndex) => ({
      row: rowIndex,
      cells: row.map((cell, col) => ({
        col,
        text: cell.text || '',
        confidence: cell.confidence || 0,
      })),
    }));

    const confidences = recognizedText
      .map(item => item.confidence)
      .filter(value => typeof value === 'number' && value > 0);
    const overallConfidence = confidences.length
      ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
      : 0;

    const lowConfidenceCells = [];
    data.forEach(row => {
      row.cells.forEach(cell => {
        if (cell.confidence > 0 && cell.confidence < 0.7) {
          lowConfidenceCells.push({
            row: row.row,
            col: cell.col,
            confidence: cell.confidence,
          });
        }
      });
    });

    return {
      tableStructure: {
        rows: rowCount,
        columns: colCount,
        hasHeader: true,
      },
      headers,
      data,
      metadata: {
        scanDate: new Date().toISOString(),
        overallConfidence,
        lowConfidenceCells,
        detector: tableStructure?.detector || null,
        bounds: tableStructure?.bounds || null,
      },
    };
  }
}

export default new TableReconstructor();
