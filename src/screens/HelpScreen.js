import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import Card from '../components/ui/Card';
import {COLORS} from '../constants/colors';
import {SPACING} from '../constants/spacing';

const HelpScreen = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <Card>
      <Text style={styles.title}>How to use SCANकर</Text>
      <Text style={styles.item}>1. Capture sheet from Camera.</Text>
      <Text style={styles.item}>2. Run offline processing.</Text>
      <Text style={styles.item}>3. Edit extracted cells in Table Editor.</Text>
      <Text style={styles.item}>4. Add extra rows/columns if required.</Text>
      <Text style={styles.item}>5. Export in your preferred format.</Text>
    </Card>
    <Card>
      <Text style={styles.title}>Why confidence colors?</Text>
      <Text style={styles.item}>Green: greater than or equal to 90%</Text>
      <Text style={styles.item}>Yellow: 70% to 89%</Text>
      <Text style={styles.item}>Red: below 70%</Text>
    </Card>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  title: {
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  item: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
});

export default HelpScreen;
