import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {COLORS} from '../../constants/colors';
import ConfidenceIndicator from './ConfidenceIndicator';

const EditableCell = ({
  value,
  confidence = 0,
  isHeader = false,
  align = 'left',
  onPress,
  width = 140,
}) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.cell,
      isHeader && styles.header,
      {width},
      align === 'right' ? styles.alignRight : styles.alignLeft,
    ]}>
    <Text numberOfLines={1} style={[styles.text, isHeader && styles.headerText]}>
      {value || ''}
    </Text>
    {!isHeader && (
      <View style={styles.indicatorWrap}>
        <ConfidenceIndicator confidence={confidence} />
      </View>
    )}
  </Pressable>
);

const styles = StyleSheet.create({
  cell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    minHeight: 54,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  header: {
    backgroundColor: COLORS.primary,
    minHeight: 44,
  },
  text: {
    color: COLORS.text,
    fontSize: 13,
  },
  headerText: {
    color: COLORS.surface,
    fontWeight: '700',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  alignLeft: {
    alignItems: 'flex-start',
  },
  indicatorWrap: {
    marginTop: 4,
  },
});

export default EditableCell;
