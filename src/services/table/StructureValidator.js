class StructureValidator {
  validate(extractedData) {
    const columns = extractedData?.tableStructure?.columns || 0;

    const headers = Array.from({length: columns}, (_, col) => extractedData.headers?.[col] || '');
    const data = (extractedData.data || []).map((row, rowIndex) => ({
      row: rowIndex,
      cells: Array.from({length: columns}, (_, col) => {
        const source = row?.cells?.[col];
        return {
          col,
          text: source?.text || '',
          confidence: source?.confidence || 0,
        };
      }),
    }));

    return {
      ...extractedData,
      headers,
      data,
      tableStructure: {
        ...extractedData.tableStructure,
        rows: data.length + 1,
        columns,
        hasHeader: true,
      },
    };
  }
}

export default new StructureValidator();
