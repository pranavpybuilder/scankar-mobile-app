import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {COLORS} from '../../constants/colors';

const CaptureButton = ({onPress, disabled = false}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={[styles.outer, disabled && styles.disabled]}>
    <View style={styles.inner} />
  </Pressable>
);

const styles = StyleSheet.create({
  outer: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 5,
    borderColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  inner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
  },
  disabled: {
    opacity: 0.45,
  },
});

export default CaptureButton;
