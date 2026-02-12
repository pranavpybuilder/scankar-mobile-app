import RNFS from 'react-native-fs';
import {getTimestampFileName} from '../../utils/fileUtils';

class JSONExporter {
  buildPayload(extractedData) {
    const headers = extractedData.headers || [];
    const data = (extractedData.data || []).map(row => {
      const rowObject = {};
      row.cells.forEach(cell => {
        const key = headers[cell.col] || `Column ${cell.col + 1}`;
        rowObject[key] = cell.text || '';
      });
      return rowObject;
    });

    return {
      headers,
      data,
      metadata: extractedData.metadata || {},
      tableStructure: extractedData.tableStructure || {},
    };
  }

  async export(extractedData, preferredFileName = 'scan_result') {
    const payload = this.buildPayload(extractedData);
    const fileName = `${getTimestampFileName(preferredFileName)}.json`;
    const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    await RNFS.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
    return {success: true, filePath, format: 'json'};
  }
}

export default new JSONExporter();
