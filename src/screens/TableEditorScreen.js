import React, {useMemo, useState} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import TableView from '../components/table/TableView';
import TableToolbar from '../components/table/TableToolbar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {useDocuments} from '../hooks/useDocuments';
import {COLORS} from '../constants/colors';
import {SPACING} from '../constants/spacing';

const TableEditorScreen = ({navigation, route}) => {
  const {documents, activeDocument, setActiveDocumentId, updateCell, updateHeader, addRow, addColumn} =
    useDocuments();
  const documentId = route.params?.documentId;

  const document = useMemo(() => {
    if (documentId) {
      return documents.find(doc => doc.id === documentId) || activeDocument;
    }
    return activeDocument;
  }, [activeDocument, documentId, documents]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draftValue, setDraftValue] = useState('');
  const [newColumnName, setNewColumnName] = useState('');

  if (!document) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>No extracted table selected.</Text>
      </View>
    );
  }

  const openHeaderEditor = (col, value) => {
    setEditing({type: 'header', col});
    setDraftValue(value || '');
    setEditorOpen(true);
  };

  const openCellEditor = (row, col, value) => {
    setEditing({type: 'cell', row, col});
    setDraftValue(value || '');
    setEditorOpen(true);
  };

  const saveEdit = async () => {
    if (!editing) {
      return;
    }
    if (editing.type === 'header') {
      await updateHeader({documentId: document.id, col: editing.col, text: draftValue});
    } else {
      await updateCell({
        documentId: document.id,
        row: editing.row,
        col: editing.col,
        text: draftValue,
      });
    }
    setEditorOpen(false);
    setEditing(null);
  };

  const onAddRow = async () => {
    await addRow(document.id);
  };

  const onAddColumn = async () => {
    await addColumn({documentId: document.id, headerText: newColumnName.trim()});
    setNewColumnName('');
  };

  const lowConfidenceCount = document.extractedData.metadata?.lowConfidenceCells?.length || 0;

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.summary}>
          Rows: {document.extractedData.tableStructure.rows - 1} | Columns:{' '}
          {document.extractedData.tableStructure.columns} | Low confidence: {lowConfidenceCount}
        </Text>
      </Card>

      <TableView
        extractedData={document.extractedData}
        onEditHeader={openHeaderEditor}
        onEditCell={openCellEditor}
      />

      <Card>
        <Text style={styles.smallTitle}>Add new column (manual entry)</Text>
        <TextInput
          value={newColumnName}
          onChangeText={setNewColumnName}
          placeholder="Column title (optional)"
          style={styles.input}
        />
        <TableToolbar
          onAddRow={onAddRow}
          onAddColumn={onAddColumn}
          onExport={() => {
            setActiveDocumentId(document.id);
            navigation.navigate('ExportOptions', {documentId: document.id});
          }}
        />
      </Card>

      <Modal transparent visible={editorOpen} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.smallTitle}>Edit value</Text>
            <TextInput style={styles.input} value={draftValue} onChangeText={setDraftValue} autoFocus />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setEditorOpen(false)}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
              <Button title="Save" onPress={saveEdit} style={styles.saveBtn} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
    gap: SPACING.md,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  empty: {
    color: COLORS.textSecondary,
  },
  summary: {
    color: COLORS.text,
    fontWeight: '600',
  },
  smallTitle: {
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  cancel: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  saveBtn: {
    minWidth: 100,
  },
});

export default TableEditorScreen;
