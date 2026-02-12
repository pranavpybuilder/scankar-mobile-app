import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Button from '../components/ui/Button';
import {COLORS} from '../constants/colors';
import {SPACING} from '../constants/spacing';

const OnboardingScreen = ({navigation}) => (
  <View style={styles.container}>
    <Text style={styles.title}>Capture -> Extract -> Edit -> Export</Text>
    <View style={styles.list}>
      <Text style={styles.item}>1. Capture handwritten machine-reading sheet</Text>
      <Text style={styles.item}>2. Offline ML/CV detects table + handwriting</Text>
      <Text style={styles.item}>3. Edit any extracted cell, add row/column</Text>
      <Text style={styles.item}>4. Export to Excel, PDF, Word, CSV, JSON</Text>
    </View>
    <Button title="Start" onPress={() => navigation.replace('Home')} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  list: {
    gap: SPACING.sm,
  },
  item: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});

export default OnboardingScreen;
