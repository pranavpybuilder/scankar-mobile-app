import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import DocumentManager from '../services/storage/DocumentManager';
import {createDocument} from '../utils/tableUtils';

const DocumentContext = createContext({
  documents: [],
  activeDocument: null,
  loading: true,
  createDocumentFromExtraction: async () => {},
  setActiveDocumentId: () => {},
  updateCell: async () => {},
  updateHeader: async () => {},
  addRow: async () => {},
  addColumn: async () => {},
  removeDocument: async () => {},
});

const cloneDocuments = documents => JSON.parse(JSON.stringify(documents));

export const DocumentProvider = ({children}) => {
  const [documents, setDocuments] = useState([]);
  const [activeDocumentId, setActiveDocumentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    DocumentManager.loadAll()
      .then(saved => {
        if (!mounted) {
          return;
        }
        setDocuments(saved || []);
        setActiveDocumentId(saved?.[0]?.id || null);
        setHydrated(true);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    DocumentManager.saveAll(documents).catch(() => {});
  }, [documents, hydrated]);

  const createDocumentFromExtraction = useCallback(
    async ({name, imageUri, extractedData}) => {
      const nextDoc = createDocument({name, imageUri, extractedData});
      setDocuments(prev => [nextDoc, ...prev]);
      setActiveDocumentId(nextDoc.id);
      return nextDoc;
    },
    [],
  );

  const updateById = useCallback(
    async (documentId, updater) => {
      setDocuments(prev => {
        const next = cloneDocuments(prev);
        const index = next.findIndex(doc => doc.id === documentId);
        if (index < 0) {
          return prev;
        }
        updater(next[index]);
        return next;
      });
      return null;
    },
    [],
  );

  const updateCell = useCallback(
    async ({documentId, row, col, text, confidence}) =>
      updateById(documentId, doc => {
        const targetCell = doc?.extractedData?.data?.[row]?.cells?.[col];
        if (!targetCell) {
          return;
        }
        targetCell.text = text;
        if (typeof confidence === 'number') {
          targetCell.confidence = confidence;
        }
      }),
    [updateById],
  );

  const updateHeader = useCallback(
    async ({documentId, col, text}) =>
      updateById(documentId, doc => {
        if (!doc?.extractedData?.headers?.length) {
          return;
        }
        doc.extractedData.headers[col] = text;
      }),
    [updateById],
  );

  const addRow = useCallback(
    async documentId =>
      updateById(documentId, doc => {
        const columns = doc?.extractedData?.tableStructure?.columns || 0;
        const nextRowIndex = doc.extractedData.data.length;
        const emptyRow = {
          row: nextRowIndex,
          cells: Array.from({length: columns}, (_, col) => ({
            col,
            text: '',
            confidence: 0,
          })),
        };
        doc.extractedData.data.push(emptyRow);
        doc.extractedData.tableStructure.rows = doc.extractedData.data.length + 1;
      }),
    [updateById],
  );

  const addColumn = useCallback(
    async ({documentId, headerText}) =>
      updateById(documentId, doc => {
        const nextCol = doc.extractedData.tableStructure.columns;
        doc.extractedData.headers.push(headerText || `Column ${nextCol + 1}`);
        doc.extractedData.data.forEach(row => {
          row.cells.push({
            col: nextCol,
            text: '',
            confidence: 0,
          });
        });
        doc.extractedData.tableStructure.columns = nextCol + 1;
      }),
    [updateById],
  );

  const removeDocument = useCallback(
    async documentId => {
      const next = documents.filter(doc => doc.id !== documentId);
      setDocuments(next);
      if (activeDocumentId === documentId) {
        setActiveDocumentId(next?.[0]?.id || null);
      }
    },
    [documents, activeDocumentId],
  );

  const activeDocument = useMemo(
    () => documents.find(doc => doc.id === activeDocumentId) || null,
    [documents, activeDocumentId],
  );

  const value = useMemo(
    () => ({
      documents,
      activeDocument,
      loading,
      createDocumentFromExtraction,
      setActiveDocumentId,
      updateCell,
      updateHeader,
      addRow,
      addColumn,
      removeDocument,
    }),
    [
      documents,
      activeDocument,
      loading,
      createDocumentFromExtraction,
      updateCell,
      updateHeader,
      addRow,
      addColumn,
      removeDocument,
    ],
  );

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
};

export const useDocuments = () => useContext(DocumentContext);
