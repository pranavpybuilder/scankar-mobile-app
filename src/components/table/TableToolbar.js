import React from 'react';
import {StyleSheet, View} from 'react-native';
import Button from '../ui/Button';
import {SPACING} from '../../constants/spacing';

const TableToolbar = ({onAddRow, onAddColumn, onExport}) => (
  <View style={styles.row}>
    <Button title="Add Row" onPress={onAddRow} type="secondary" style={styles.btn} />
    <Button title="Add Column" onPress={onAddColumn} type="secondary" style={styles.btn} />
    <Button title="Export" onPress={onExport} style={styles.btn} />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  btn: {
    minWidth: 110,
  },
});

export default TableToolbar;
