import RNFS from 'react-native-fs';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import {getTimestampFileName} from '../../utils/fileUtils';

class WordExporter {
  async export(extractedData, preferredFileName = 'scan_result') {
    const headerRow = new TableRow({
      children: (extractedData.headers || []).map(
        text =>
          new TableCell({
            children: [new Paragraph({children: [new TextRun({text, bold: true})]})],
          }),
      ),
    });

    const dataRows = (extractedData.data || []).map(
      row =>
        new TableRow({
          children: row.cells.map(
            cell =>
              new TableCell({
                children: [new Paragraph(String(cell.text || ''))],
              }),
          ),
        }),
    );

    const table = new Table({
      width: {size: 100, type: WidthType.PERCENTAGE},
      rows: [headerRow, ...dataRows],
    });

    const document = new Document({
      sections: [{children: [table]}],
    });

    const buffer = await Packer.toBase64String(document);
    const fileName = `${getTimestampFileName(preferredFileName)}.docx`;
    const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    await RNFS.writeFile(filePath, buffer, 'base64');
    return {success: true, filePath, format: 'docx'};
  }
}

export default new WordExporter();
