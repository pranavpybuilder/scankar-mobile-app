import React, {useMemo, useState} from 'react';
import {Alert, StyleSheet, Text, TextInput, View} from 'react-native';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {FILE_FORMATS} from '../constants/fileFormats';
import {useExport} from '../hooks/useExport';
import {useDocuments} from '../hooks/useDocuments';
import {COLORS} from '../constants/colors';
import {SPACING} from '../constants/spacing';

const ExportOptionsScreen = ({route}) => {
  const {documents, activeDocument} = useDocuments();
  const {exporting, error, lastResult, exportData} = useExport();
  const [selected, setSelected] = useState('json');
  const [fileName, setFileName] = useState('machine_readings');
  const documentId = route.params?.documentId;

  const target = useMemo(() => {
    if (documentId) {
      return documents.find(doc => doc.id === documentId) || activeDocument;
    }
    return activeDocument;
  }, [activeDocument, documentId, documents]);

  const runExport = async () => {
    if (!target) {
      return;
    }
    const result = await exportData({
      format: selected,
      extractedData: target.extractedData,
      fileName,
    });
    if (result.success) {
      Alert.alert('Export complete', `${result.format.toUpperCase()} saved:\n${result.filePath}`);
    } else {
      Alert.alert('Export failed', result.error || 'Unknown error');
    }
  };

  if (!target) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>No document selected for export.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>Choose export format</Text>
        <View style={styles.chips}>
          {FILE_FORMATS.map(item => (
            <Button
              key={item.id}
              title={item.label}
              type={selected === item.id ? 'primary' : 'ghost'}
              onPress={() => setSelected(item.id)}
              style={styles.chip}
            />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.label}>File name</Text>
        <TextInput value={fileName} onChangeText={setFileName} style={styles.input} />
        <Button title={exporting ? 'Exporting...' : 'Export'} onPress={runExport} disabled={exporting} />
      </Card>

      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!lastResult && (
        <Text style={styles.result}>
          Last exported: {lastResult.format.toUpperCase()} -> {lastResult.filePath}
        </Text>
      )}
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
    backgroundColor: COLORS.background,
  },
  empty: {
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    minWidth: 90,
  },
  label: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
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
  error: {
    color: COLORS.error,
  },
  result: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});

export default ExportOptionsScreen;
