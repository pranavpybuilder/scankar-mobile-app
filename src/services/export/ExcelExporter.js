import RNFS from 'react-native-fs';
import * as XLSX from 'xlsx';
import {getTimestampFileName} from '../../utils/fileUtils';

class ExcelExporter {
  async export(extractedData, preferredFileName = 'scan_result') {
    const workbook = XLSX.utils.book_new();
    const worksheetData = [
      extractedData.headers,
      ...(extractedData.data || []).map(row => row.cells.map(cell => cell.text || '')),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet['!cols'] = (extractedData.headers || []).map((_, idx) => ({
      wch: idx === 0 ? 35 : 14,
    }));
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Machine Readings');
    const base64 = XLSX.write(workbook, {bookType: 'xlsx', type: 'base64'});
    const fileName = `${getTimestampFileName(preferredFileName)}.xlsx`;
    const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    await RNFS.writeFile(filePath, base64, 'base64');
    return {success: true, filePath, format: 'xlsx'};
  }
}

export default new ExcelExporter();
