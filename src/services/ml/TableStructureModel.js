import {MOCK_HEADERS, MOCK_ROWS} from '../../data/mockSheet';

class TableStructureModel {
  async detectTable(preprocessedImage) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const rowCount = MOCK_ROWS.length + 1;
    const colCount = MOCK_HEADERS.length;
    const cellWidth = Math.floor(preprocessedImage.width / colCount);
    const cellHeight = 44;

    const rows = Array.from({length: rowCount}, (_, row) => ({
      index: row,
      y: row * cellHeight,
      h: cellHeight,
    }));

    const columns = Array.from({length: colCount}, (_, col) => ({
      index: col,
      x: col * cellWidth,
      w: cellWidth,
    }));

    const cells = [];
    for (let row = 0; row < rowCount; row += 1) {
      for (let col = 0; col < colCount; col += 1) {
        cells.push({
          row,
          col,
          x: col * cellWidth,
          y: row * cellHeight,
          w: cellWidth,
          h: cellHeight,
        });
      }
    }

    return {
      rows,
      columns,
      cells,
      mockHeaders: MOCK_HEADERS,
      mockRows: MOCK_ROWS,
    };
  }
}

export default new TableStructureModel();
