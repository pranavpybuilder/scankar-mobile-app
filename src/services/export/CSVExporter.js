import RNFS from 'react-native-fs';
import Papa from 'papaparse';
import {getTimestampFileName} from '../../utils/fileUtils';

class CSVExporter {
  buildRows(extractedData) {
    const headerRow = extractedData.headers || [];
    const dataRows = (extractedData.data || []).map(row =>
      row.cells.map(cell => (cell.text == null ? '' : String(cell.text))),
    );
    return [headerRow, ...dataRows];
  }

  async export(extractedData, preferredFileName = 'scan_result') {
    const rows = this.buildRows(extractedData);
    const csv = Papa.unparse(rows, {newline: '\n'});
    const fileName = `${getTimestampFileName(preferredFileName)}.csv`;
    const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    await RNFS.writeFile(filePath, csv, 'utf8');
    return {success: true, filePath, format: 'csv'};
  }
}

export default new CSVExporter();
