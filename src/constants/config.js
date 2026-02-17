export const CONFIG = {
  OCR_CONFIDENCE_THRESHOLD: 0.7,
  LOW_CONFIDENCE_THRESHOLD: 0.7,
  MEDIUM_CONFIDENCE_THRESHOLD: 0.9,
  MAX_IMAGE_SIZE: 1920,
  SUPPORTED_EXPORT_FORMATS: ['json', 'csv', 'xlsx', 'pdf', 'docx'],
  PROCESSING_PHASES: [
    'preprocess',
    'table-detection',
    'text-detection',
    'handwriting-ocr',
    'reconstruction',
    'validation',
  ],
  TFLITE: {
    enabled: true,
    modelAssetDir: 'models',
    models: {
      tableStructure: 'table_structure.tflite',
      textDetection: 'text_detection.tflite',
      handwritingOCR: 'handwriting_ocr.tflite',
      imageEnhancement: 'image_enhancement.tflite',
    },
  },
};
