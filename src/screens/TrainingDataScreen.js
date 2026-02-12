import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {COLORS} from '../constants/colors';
import {SPACING} from '../constants/spacing';

const TrainingDataScreen = () => {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>Training Data Collection (Module Placeholder)</Text>
        <Text style={styles.meta}>
          This screen will capture image + annotation pairs for model training export.
        </Text>
        <Text style={styles.meta}>Captured samples in this session: {count}</Text>
      </Card>
      <Button title="Mock Capture Sample" onPress={() => setCount(prev => prev + 1)} />
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
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  meta: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
});

export default TrainingDataScreen;
