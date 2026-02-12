import JSONExporter from './JSONExporter';
import CSVExporter from './CSVExporter';
import ExcelExporter from './ExcelExporter';
import PDFExporter from './PDFExporter';
import WordExporter from './WordExporter';

const exporterMap = {
  json: JSONExporter,
  csv: CSVExporter,
  xlsx: ExcelExporter,
  pdf: PDFExporter,
  docx: WordExporter,
};

class ExportManager {
  async export({format, extractedData, fileName}) {
    const exporter = exporterMap[format];
    if (!exporter) {
      return {
        success: false,
        error: `Unsupported export format: ${format}`,
      };
    }
    return exporter.export(extractedData, fileName);
  }
}

export default new ExportManager();
