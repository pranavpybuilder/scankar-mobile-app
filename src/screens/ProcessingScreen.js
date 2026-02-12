import React, {useEffect, useRef} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';
import {useOCR} from '../hooks/useOCR';
import {useDocuments} from '../hooks/useDocuments';
import {COLORS} from '../constants/colors';
import {SPACING} from '../constants/spacing';

const ProcessingScreen = ({navigation, route}) => {
  const imageUri = route.params?.imageUri;
  const preprocessOptions = route.params?.preprocessOptions || {};
  const {processing, progress, phase, error, processImage} = useOCR();
  const {createDocumentFromExtraction} = useDocuments();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;

    const run = async () => {
      const result = await processImage(imageUri, preprocessOptions);
      if (!result.success) {
        return;
      }
      const document = await createDocumentFromExtraction({
        imageUri,
        extractedData: result.data,
        name: 'Machine Readings',
      });
      navigation.replace('TableEditor', {documentId: document.id});
    };
    run();
  }, [createDocumentFromExtraction, imageUri, navigation, preprocessOptions, processImage]);

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>Offline processing</Text>
        <Text style={styles.line}>Phase: {phase || 'initializing'}</Text>
        <Text style={styles.line}>Progress: {progress}%</Text>
        {!!preprocessOptions?.userAdjusted && (
          <Text style={styles.line}>Preprocess: user edits applied</Text>
        )}
        {processing && <LoadingSpinner label="Running CV + OCR pipeline..." />}
        {!!error && <Text style={styles.error}>{error}</Text>}
      </Card>
      {!!error && (
        <Button
          title="Retry"
          onPress={() => navigation.replace('Processing', {imageUri, preprocessOptions})}
        />
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
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  line: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  error: {
    color: COLORS.error,
    marginTop: SPACING.sm,
  },
});

export default ProcessingScreen;
