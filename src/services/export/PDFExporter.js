import RNFS from 'react-native-fs';
import {jsPDF} from 'jspdf';
import autoTable from 'jspdf-autotable';
import {getTimestampFileName} from '../../utils/fileUtils';

class PDFExporter {
  async export(extractedData, preferredFileName = 'scan_result') {
    const doc = new jsPDF({orientation: 'landscape'});
    autoTable(doc, {
      head: [extractedData.headers || []],
      body: (extractedData.data || []).map(row => row.cells.map(cell => cell.text || '')),
      styles: {fontSize: 8},
      headStyles: {fillColor: [25, 118, 210]},
    });
    const base64 = doc.output('datauristring').split(',')[1];
    const fileName = `${getTimestampFileName(preferredFileName)}.pdf`;
    const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    await RNFS.writeFile(filePath, base64, 'base64');
    return {success: true, filePath, format: 'pdf'};
  }
}

export default new PDFExporter();
