import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {COLORS} from '../../constants/colors';

const getColor = confidence => {
  if (confidence >= 0.9) {
    return COLORS.confidenceHigh;
  }
  if (confidence >= 0.7) {
    return COLORS.confidenceMed;
  }
  return COLORS.confidenceLow;
};

const ConfidenceIndicator = ({confidence = 0}) => (
  <View style={[styles.badge, {backgroundColor: getColor(confidence)}]}>
    <Text style={styles.text}>{Math.round(confidence * 100)}%</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    color: COLORS.text,
    fontWeight: '600',
  },
});

export default ConfidenceIndicator;
