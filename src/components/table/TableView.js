import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import EditableCell from './EditableCell';
import {COLORS} from '../../constants/colors';

const getColWidth = colIndex => (colIndex === 0 ? 220 : 140);

const TableView = ({extractedData, onEditHeader, onEditCell}) => (
  <ScrollView horizontal style={styles.scroll}>
    <View style={styles.table}>
      <View style={styles.row}>
        {extractedData.headers.map((header, col) => (
          <EditableCell
            key={`h_${col}`}
            value={header}
            isHeader
            width={getColWidth(col)}
            align={col === 0 ? 'left' : 'right'}
            onPress={() => onEditHeader(col, header)}
          />
        ))}
      </View>
      {extractedData.data.map((row, rowIndex) => (
        <View key={`r_${rowIndex}`} style={styles.row}>
          {row.cells.map((cell, col) => (
            <EditableCell
              key={`c_${rowIndex}_${col}`}
              value={cell.text}
              confidence={cell.confidence}
              width={getColWidth(col)}
              align={col === 0 ? 'left' : 'right'}
              onPress={() => onEditCell(rowIndex, col, cell.text, cell.confidence)}
            />
          ))}
        </View>
      ))}
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  scroll: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
  },
  table: {
    backgroundColor: COLORS.surface,
  },
  row: {
    flexDirection: 'row',
  },
});

export default TableView;
