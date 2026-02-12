const createId = () =>
  `doc_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;

export const createEmptyCell = (col, text = '', confidence = 0) => ({
  col,
  text,
  confidence,
});

export const createRow = (row, columnCount) => ({
  row,
  cells: Array.from({length: columnCount}, (_, col) => createEmptyCell(col)),
});

export const normalizeExtractedData = extractedData => {
  const columns = extractedData?.tableStructure?.columns || extractedData?.headers?.length || 0;
  const rows = extractedData?.data || [];

  const normalizedRows = rows.map((rowObj, rowIndex) => {
    const cells = Array.from({length: columns}, (_, col) => {
      const sourceCell = rowObj?.cells?.[col];
      return createEmptyCell(col, sourceCell?.text || '', sourceCell?.confidence || 0);
    });
    return {row: rowIndex, cells};
  });

  return {
    tableStructure: {
      rows: normalizedRows.length + 1,
      columns,
      hasHeader: true,
    },
    headers: Array.from({length: columns}, (_, col) => extractedData?.headers?.[col] || `Column ${col + 1}`),
    data: normalizedRows,
    metadata: extractedData?.metadata || {},
  };
};

export const createDocument = ({name, imageUri, extractedData}) => ({
  id: createId(),
  name: name || `Scan ${new Date().toISOString()}`,
  imageUri: imageUri || '',
  createdAt: new Date().toISOString(),
  extractedData: normalizeExtractedData(extractedData),
});
