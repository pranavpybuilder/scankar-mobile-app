import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {useDocuments} from '../hooks/useDocuments';
import {COLORS} from '../constants/colors';
import {SPACING} from '../constants/spacing';

const DocumentDetailScreen = ({navigation, route}) => {
  const {documents, activeDocument, setActiveDocumentId, removeDocument} = useDocuments();
  const documentId = route.params?.documentId;

  const doc = useMemo(() => {
    if (documentId) {
      return documents.find(item => item.id === documentId) || activeDocument;
    }
    return activeDocument;
  }, [activeDocument, documentId, documents]);

  if (!doc) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>Document not found.</Text>
      </View>
    );
  }

  const openEditor = () => {
    setActiveDocumentId(doc.id);
    navigation.navigate('TableEditor', {documentId: doc.id});
  };

  const openExport = () => {
    setActiveDocumentId(doc.id);
    navigation.navigate('ExportOptions', {documentId: doc.id});
  };

  const deleteDoc = async () => {
    await removeDocument(doc.id);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>{doc.name}</Text>
        <Text style={styles.meta}>Created: {new Date(doc.createdAt).toLocaleString()}</Text>
        <Text style={styles.meta}>Rows: {doc.extractedData.tableStructure.rows - 1}</Text>
        <Text style={styles.meta}>Columns: {doc.extractedData.tableStructure.columns}</Text>
      </Card>
      <View style={styles.actions}>
        <Button title="Open Editor" onPress={openEditor} />
        <Button title="Export" type="secondary" onPress={openExport} />
        <Button title="Delete" type="ghost" onPress={deleteDoc} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    color: COLORS.textSecondary,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  meta: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  actions: {
    gap: SPACING.sm,
  },
});

export default DocumentDetailScreen;
