import React from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {formatDistanceToNow} from 'date-fns';
import Card from '../components/ui/Card';
import {useDocuments} from '../hooks/useDocuments';
import {COLORS} from '../constants/colors';
import {SPACING} from '../constants/spacing';

const LibraryScreen = ({navigation}) => {
  const {documents, setActiveDocumentId} = useDocuments();

  const openDoc = doc => {
    setActiveDocumentId(doc.id);
    navigation.navigate('DocumentDetail', {documentId: doc.id});
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={documents}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No documents yet.</Text>}
        renderItem={({item}) => (
          <TouchableOpacity onPress={() => openDoc(item)}>
            <Card>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.extractedData.tableStructure.rows - 1} rows,{' '}
                {item.extractedData.tableStructure.columns} columns
              </Text>
              <Text style={styles.meta}>
                {formatDistanceToNow(new Date(item.createdAt), {addSuffix: true})}
              </Text>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  empty: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: SPACING.xl,
  },
  name: {
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  meta: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});

export default LibraryScreen;
