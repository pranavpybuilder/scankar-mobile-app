import {useCallback, useState} from 'react';
import ExportManager from '../services/export/ExportManager';

export const useExport = () => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const exportData = useCallback(async ({format, extractedData, fileName}) => {
    setExporting(true);
    setError(null);
    const result = await ExportManager.export({format, extractedData, fileName});
    if (!result.success) {
      setError(result.error || 'Export failed');
    } else {
      setLastResult(result);
    }
    setExporting(false);
    return result;
  }, []);

  return {
    exporting,
    error,
    lastResult,
    exportData,
  };
};
