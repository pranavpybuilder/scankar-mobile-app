import OpenCVService from '../cv/OpenCVService';
import ModelLoader from '../ml/ModelLoader';
import TableStructureModel from '../ml/TableStructureModel';
import TextDetectionModel from '../ml/TextDetectionModel';
import HandwritingOCRModel from '../ml/HandwritingOCRModel';
import TableReconstructor from '../table/TableReconstructor';
import StructureValidator from '../table/StructureValidator';

class OCRPipeline {
  async processImage(imageUri, preprocessOptions = {}, onProgress = () => {}) {
    const startTime = Date.now();
    try {
      onProgress({phase: 'preprocess', progress: 8});
      await ModelLoader.initialize();

      onProgress({phase: 'preprocess', progress: 20});
      const preprocessed = await OpenCVService.preprocessImage(imageUri, preprocessOptions);

      onProgress({phase: 'table-detection', progress: 45});
      const tableStructure = await TableStructureModel.detectTable(preprocessed);

      onProgress({phase: 'text-detection', progress: 65});
      const textRegions = await TextDetectionModel.detectTextInCells(
        preprocessed,
        tableStructure.cells,
      );

      onProgress({phase: 'handwriting-ocr', progress: 82});
      const recognizedText = await HandwritingOCRModel.recognizeBatch(
        preprocessed,
        textRegions,
        tableStructure,
      );

      onProgress({phase: 'reconstruction', progress: 93});
      const reconstructed = TableReconstructor.buildTable(tableStructure, recognizedText);
      const validated = StructureValidator.validate(reconstructed);

      onProgress({phase: 'validation', progress: 100});

      return {
        success: true,
        data: validated,
        metadata: {
          processingTimeMs: Date.now() - startTime,
          rows: validated.tableStructure.rows,
          columns: validated.tableStructure.columns,
          overallConfidence: validated.metadata.overallConfidence,
          preprocess: preprocessed.userAdjustments,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Unknown OCR pipeline error',
      };
    }
  }
}

export default new OCRPipeline();
