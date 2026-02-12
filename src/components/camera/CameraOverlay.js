import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {COLORS} from '../../constants/colors';
import {SPACING} from '../../constants/spacing';

const CameraOverlay = () => (
  <View style={styles.container} pointerEvents="none">
    <View style={styles.frame} />
    <Text style={styles.hint}>Align the sheet inside the frame</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: '86%',
    height: '68%',
    borderWidth: 2,
    borderRadius: 16,
    borderColor: COLORS.surface,
    backgroundColor: 'transparent',
  },
  hint: {
    marginTop: SPACING.md,
    color: COLORS.surface,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.32)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
});

export default CameraOverlay;
