import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {formatDistanceToNow} from 'date-fns';
import {useDocuments} from '../hooks/useDocuments';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {COLORS} from '../constants/colors';
import {SPACING} from '../constants/spacing';

const HomeScreen = ({navigation}) => {
  const {documents} = useDocuments();
  const latest = documents[0];

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.heading}>Statistics</Text>
        <Text style={styles.stat}>Total scans: {documents.length}</Text>
        <Text style={styles.stat}>
          Last scan:{' '}
          {latest ? formatDistanceToNow(new Date(latest.createdAt), {addSuffix: true}) : 'None yet'}
        </Text>
      </Card>

      <Card>
        <Text style={styles.heading}>Recent</Text>
        {latest ? (
          <>
            <Text style={styles.docName}>{latest.name}</Text>
            <Text style={styles.meta}>
              {latest.extractedData.tableStructure.rows - 1} rows,{' '}
              {latest.extractedData.tableStructure.columns} columns
            </Text>
          </>
        ) : (
          <Text style={styles.meta}>No scans saved.</Text>
        )}
      </Card>

      <View style={styles.actions}>
        <Button title="New Scan" onPress={() => navigation.navigate('Camera')} />
        <Button title="Library" type="secondary" onPress={() => navigation.navigate('Library')} />
        <Button title="Settings" type="ghost" onPress={() => navigation.navigate('Settings')} />
        <Button title="Help" type="ghost" onPress={() => navigation.navigate('Help')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  heading: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  stat: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  meta: {
    color: COLORS.textSecondary,
  },
  docName: {
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  actions: {
    gap: SPACING.sm,
  },
});

export default HomeScreen;
