const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toNumber = value => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const normalizeDimension = value =>
  clamp(Math.round(toNumber(value) || 0), 1, 12000);

class DeterministicGridDetector {
  normalizeBounds(rawBounds, imageWidth, imageHeight) {
    const width = normalizeDimension(imageWidth || 1280);
    const height = normalizeDimension(imageHeight || 720);

    const x = clamp(
      Math.round(toNumber(rawBounds?.x)),
      0,
      Math.max(0, width - 1),
    );
    const y = clamp(
      Math.round(toNumber(rawBounds?.y)),
      0,
      Math.max(0, height - 1),
    );

    const rawWidth = toNumber(rawBounds?.w ?? rawBounds?.width);
    const rawHeight = toNumber(rawBounds?.h ?? rawBounds?.height);
    const boundedWidth = clamp(
      Math.round(rawWidth || width),
      40,
      Math.max(40, width - x),
    );
    const boundedHeight = clamp(
      Math.round(rawHeight || height),
      40,
      Math.max(40, height - y),
    );

    return {
      x,
      y,
      w: boundedWidth,
      h: boundedHeight,
      imageWidth: width,
      imageHeight: height,
    };
  }

  resolveBounds(preprocessedImage, fallbackBounds) {
    const width = normalizeDimension(preprocessedImage?.width || 1280);
    const height = normalizeDimension(preprocessedImage?.height || 720);
    const hintedBounds =
      fallbackBounds ||
      preprocessedImage?.tableBoundsHint ||
      preprocessedImage?.tableBounds ||
      preprocessedImage?.roi;

    if (hintedBounds) {
      return this.normalizeBounds(hintedBounds, width, height);
    }

    const marginX = Math.round(width * 0.04);
    const marginTop = Math.round(height * 0.08);
    const marginBottom = Math.round(height * 0.08);

    return this.normalizeBounds(
      {
        x: marginX,
        y: marginTop,
        w: width - marginX * 2,
        h: height - marginTop - marginBottom,
      },
      width,
      height,
    );
  }

  inferColumnCount(bounds, hints = {}) {
    const hinted =
      toNumber(
        hints?.columnCount || hints?.columns || hints?.colCount || hints?.cols,
      ) || 0;
    if (hinted > 0) {
      return clamp(Math.round(hinted), 4, 14);
    }

    const estimated = Math.round((bounds.w * 0.66) / 130) + 1;
    const clampedEstimate = clamp(estimated, 6, 10);
    if (Math.abs(clampedEstimate - 8) <= 1) {
      return 8;
    }
    return clampedEstimate;
  }

  inferRowCount(bounds, hints = {}) {
    const hinted = toNumber(hints?.rowCount || hints?.rows) || 0;
    if (hinted > 0) {
      return clamp(Math.round(hinted), 4, 40);
    }

    const estimated = Math.round(bounds.h / 220) + 2;
    return clamp(estimated, 5, 12);
  }

  buildRows(bounds, rowCount) {
    const normalizedRowCount = clamp(Math.round(rowCount || 0), 2, 40);
    const bodyRowCount = Math.max(1, normalizedRowCount - 1);
    const headerHeight = clamp(Math.round(bounds.h * 0.16), 34, 84);
    const baseBodyHeight = Math.max(
      24,
      Math.floor((bounds.h - headerHeight) / bodyRowCount),
    );

    const rows = [];
    let currentY = bounds.y;
    for (let row = 0; row < normalizedRowCount; row += 1) {
      const isHeader = row === 0;
      const isLastRow = row === normalizedRowCount - 1;
      const consumed = currentY - bounds.y;
      const remainingHeight = Math.max(24, bounds.h - consumed);

      const rawHeight = isHeader ? headerHeight : baseBodyHeight;
      const height = isLastRow
        ? remainingHeight
        : Math.min(rawHeight, remainingHeight);

      rows.push({
        index: row,
        y: currentY,
        h: height,
      });
      currentY += height;
    }
    return rows;
  }

  buildColumns(bounds, columnCount) {
    const normalizedColumnCount = clamp(Math.round(columnCount || 0), 2, 20);
    const firstColumnRatio = clamp(
      0.39 - (normalizedColumnCount - 5) * 0.02,
      0.27,
      0.36,
    );
    const firstColumnWidth = clamp(
      Math.round(bounds.w * firstColumnRatio),
      120,
      Math.max(120, Math.floor(bounds.w * 0.6)),
    );

    const remainingColumnCount = Math.max(1, normalizedColumnCount - 1);
    const baseWidth = Math.max(
      48,
      Math.floor((bounds.w - firstColumnWidth) / remainingColumnCount),
    );

    const columns = [];
    let currentX = bounds.x;
    for (let col = 0; col < normalizedColumnCount; col += 1) {
      const isFirst = col === 0;
      const isLast = col === normalizedColumnCount - 1;
      const consumed = currentX - bounds.x;
      const remainingWidth = Math.max(32, bounds.w - consumed);

      const rawWidth = isFirst ? firstColumnWidth : baseWidth;
      const width = isLast
        ? remainingWidth
        : Math.min(rawWidth, remainingWidth);

      columns.push({
        index: col,
        x: currentX,
        w: width,
      });
      currentX += width;
    }
    return columns;
  }

  buildCells(rows, columns) {
    const cells = [];
    rows.forEach(row => {
      columns.forEach(column => {
        cells.push({
          row: row.index,
          col: column.index,
          x: column.x,
          y: row.y,
          w: column.w,
          h: row.h,
        });
      });
    });
    return cells;
  }

  normalizeRows(rows, bounds) {
    if (!Array.isArray(rows) || !rows.length) {
      return [];
    }

    const normalized = rows
      .map((row, index) => {
        const y = Math.round(
          toNumber(row?.y ?? row?.top ?? row?.start ?? row?.position),
        );
        const rawHeight = toNumber(row?.h ?? row?.height ?? row?.size);
        const derivedHeight = toNumber(row?.bottom) - y;
        const height = Math.round(rawHeight || derivedHeight || 0);

        if (!height) {
          return null;
        }

        const clampedY = clamp(y, bounds.y, bounds.y + bounds.h - 1);
        const maxHeight = Math.max(1, bounds.y + bounds.h - clampedY);
        const clampedHeight = clamp(height, 1, maxHeight);
        return {
          index,
          y: clampedY,
          h: clampedHeight,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.y - b.y)
      .map((row, index) => ({...row, index}));

    return normalized;
  }

  normalizeColumns(columns, bounds) {
    if (!Array.isArray(columns) || !columns.length) {
      return [];
    }

    const normalized = columns
      .map((column, index) => {
        const x = Math.round(
          toNumber(
            column?.x ?? column?.left ?? column?.start ?? column?.position,
          ),
        );
        const rawWidth = toNumber(column?.w ?? column?.width ?? column?.size);
        const derivedWidth = toNumber(column?.right) - x;
        const width = Math.round(rawWidth || derivedWidth || 0);

        if (!width) {
          return null;
        }

        const clampedX = clamp(x, bounds.x, bounds.x + bounds.w - 1);
        const maxWidth = Math.max(1, bounds.x + bounds.w - clampedX);
        const clampedWidth = clamp(width, 1, maxWidth);
        return {
          index,
          x: clampedX,
          w: clampedWidth,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.x - b.x)
      .map((column, index) => ({...column, index}));

    return normalized;
  }

  normalizeCells(rawCells, rows, columns) {
    if (!Array.isArray(rawCells) || !rawCells.length) {
      return this.buildCells(rows, columns);
    }

    return rawCells
      .map(cell => {
        const row = Math.round(toNumber(cell?.row));
        const col = Math.round(toNumber(cell?.col));
        const fallbackRow = rows[row];
        const fallbackColumn = columns[col];
        if (!fallbackRow || !fallbackColumn) {
          return null;
        }

        const x = Math.round(toNumber(cell?.x ?? fallbackColumn.x));
        const y = Math.round(toNumber(cell?.y ?? fallbackRow.y));
        const w = Math.round(
          toNumber(cell?.w ?? cell?.width ?? fallbackColumn.w),
        );
        const h = Math.round(
          toNumber(cell?.h ?? cell?.height ?? fallbackRow.h),
        );

        return {
          row,
          col,
          x: clamp(
            x,
            fallbackColumn.x,
            fallbackColumn.x + fallbackColumn.w - 1,
          ),
          y: clamp(y, fallbackRow.y, fallbackRow.y + fallbackRow.h - 1),
          w: clamp(w, 1, fallbackColumn.w),
          h: clamp(h, 1, fallbackRow.h),
        };
      })
      .filter(Boolean);
  }

  detect(preprocessedImage, hints = {}) {
    const bounds = this.resolveBounds(preprocessedImage, hints?.bounds);
    const columnCount = this.inferColumnCount(bounds, hints);
    const rowCount = this.inferRowCount(bounds, hints);
    const rows = this.buildRows(bounds, rowCount);
    const columns = this.buildColumns(bounds, columnCount);
    const cells = this.buildCells(rows, columns);

    return {
      rows,
      columns,
      cells,
      bounds,
      detector: {
        mode: 'deterministic-js',
        confidence: 0.68,
      },
    };
  }

  fromNative(rawResult, preprocessedImage) {
    if (!rawResult || typeof rawResult !== 'object') {
      return null;
    }

    const bounds = this.resolveBounds(
      preprocessedImage,
      rawResult?.bounds || rawResult?.tableBounds,
    );
    const rows = this.normalizeRows(rawResult?.rows, bounds);
    const columns = this.normalizeColumns(rawResult?.columns, bounds);

    if (!rows.length || !columns.length) {
      const rowCount = Math.round(
        toNumber(rawResult?.rowCount || rawResult?.rowsCount),
      );
      const columnCount = Math.round(
        toNumber(
          rawResult?.columnCount ||
            rawResult?.columnsCount ||
            rawResult?.colCount,
        ),
      );
      if (rowCount > 0 && columnCount > 0) {
        return this.detect(preprocessedImage, {
          rowCount,
          columnCount,
          bounds,
        });
      }
      return null;
    }

    return {
      rows,
      columns,
      cells: this.normalizeCells(rawResult?.cells, rows, columns),
      bounds,
      detector: {
        mode: 'opencv-native',
        confidence: clamp(toNumber(rawResult?.confidence || 0.83), 0, 1),
      },
    };
  }
}

export default new DeterministicGridDetector();
