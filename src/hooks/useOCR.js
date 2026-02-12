import {useCallback, useState} from 'react';
import OCRPipeline from '../services/ocr/OCRPipeline';

export const useOCR = () => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('');
  const [error, setError] = useState(null);

  const processImage = useCallback(async (imageUri, preprocessOptions = {}) => {
    setProcessing(true);
    setError(null);
    setProgress(0);
    setPhase('starting');
    const result = await OCRPipeline.processImage(imageUri, preprocessOptions, update => {
      setPhase(update.phase);
      setProgress(update.progress);
    });
    if (!result.success) {
      setError(result.error || 'OCR failed');
    }
    setProcessing(false);
    return result;
  }, []);

  return {
    processing,
    progress,
    phase,
    error,
    processImage,
  };
};
