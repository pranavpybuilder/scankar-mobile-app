import OpenCVService from '../cv/OpenCVService';
import DeterministicGridDetector from '../table/DeterministicGridDetector';
import ModelLoader from './ModelLoader';
import {MOCK_HEADERS, MOCK_ROWS} from '../../data/mockSheet';

const toNumber = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

class TableStructureModel {
  buildSeedHeaders(columnCount) {
    const normalizedColumns = Math.max(1, columnCount || 0);
    if (normalizedColumns === MOCK_HEADERS.length) {
      return [...MOCK_HEADERS];
    }

    return Array.from({length: normalizedColumns}, (_, col) =>
      col === 0 ? 'Machine Name' : `Reading ${col}`,
    );
  }

  buildSeedRows(dataRowCount, columnCount) {
    const normalizedRows = Math.max(0, dataRowCount || 0);
    const normalizedColumns = Math.max(1, columnCount || 0);

    return Array.from({length: normalizedRows}, (_, rowIndex) => {
      const seedRow = MOCK_ROWS[rowIndex] || [];
      return Array.from(
        {length: normalizedColumns},
        (_unused, colIndex) => seedRow[colIndex] || '',
      );
    });
  }

  mapRuntimeToGrid(runtimeResult, preprocessedImage) {
    if (!runtimeResult || typeof runtimeResult !== 'object') {
      return null;
    }

    const normalizedFromCells = DeterministicGridDetector.fromNative(
      runtimeResult,
      preprocessedImage,
    );
    if (normalizedFromCells) {
      return {
        ...normalizedFromCells,
        detector: {
          mode: 'tflite-table-structure',
          confidence: toNumber(runtimeResult?.confidence || 0.79),
        },
      };
    }

    const rowCount = Math.round(
      toNumber(runtimeResult?.rowCount || runtimeResult?.rows),
    );
    const columnCount = Math.round(
      toNumber(
        runtimeResult?.columnCount ||
          runtimeResult?.columns ||
          runtimeResult?.colCount,
      ),
    );

    if (rowCount <= 0 || columnCount <= 0) {
      return null;
    }

    const inferred = DeterministicGridDetector.detect(preprocessedImage, {
      rowCount,
      columnCount,
      bounds: runtimeResult?.bounds || runtimeResult?.tableBounds,
    });

    return {
      ...inferred,
      detector: {
        mode: 'tflite-table-structure',
        confidence: toNumber(runtimeResult?.confidence || 0.74),
      },
    };
  }

  async detectTable(preprocessedImage) {
    await new Promise(resolve => setTimeout(resolve, 250));
    const runtimeResult = await ModelLoader.inferTableStructure(
      preprocessedImage,
    );
    const runtimeGrid = this.mapRuntimeToGrid(runtimeResult, preprocessedImage);
    const grid =
      runtimeGrid || (await OpenCVService.detectTableGrid(preprocessedImage));
    const rows = grid?.rows || [];
    const columns = grid?.columns || [];
    const cells = grid?.cells || [];
    const rowCount = rows.length;
    const colCount = columns.length;

    return {
      rows,
      columns,
      cells,
      bounds: grid?.bounds || preprocessedImage?.tableBoundsHint || null,
      detector: grid?.detector || {mode: 'deterministic-js', confidence: 0.68},
      mockHeaders: this.buildSeedHeaders(colCount),
      mockRows: this.buildSeedRows(Math.max(0, rowCount - 1), colCount),
    };
  }
}

export default new TableStructureModel();
