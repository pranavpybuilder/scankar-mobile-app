import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {COLORS} from '../../constants/colors';
import {SPACING} from '../../constants/spacing';

const LoadingSpinner = ({label}) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    {!!label && <Text style={styles.label}>{label}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  label: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
  },
});

export default LoadingSpinner;
