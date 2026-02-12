import React from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import Card from '../components/ui/Card';
import {useSettings} from '../context/SettingsContext';
import {COLORS} from '../constants/colors';
import {SPACING} from '../constants/spacing';

const SettingsScreen = () => {
  const {settings, updateSetting} = useSettings();

  return (
    <View style={styles.container}>
      <Card style={styles.row}>
        <View>
          <Text style={styles.title}>Auto-save scans</Text>
          <Text style={styles.meta}>Persist extracted table changes locally</Text>
        </View>
        <Switch
          value={settings.autoSave}
          onValueChange={value => updateSetting('autoSave', value)}
          thumbColor={COLORS.surface}
          trackColor={{true: COLORS.primary, false: COLORS.border}}
        />
      </Card>
      <Card>
        <Text style={styles.meta}>Low confidence threshold: {settings.lowConfidenceThreshold}</Text>
        <Text style={styles.meta}>
          Medium confidence threshold: {settings.mediumConfidenceThreshold}
        </Text>
      </Card>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: COLORS.text,
    fontWeight: '700',
  },
  meta: {
    color: COLORS.textSecondary,
  },
});

export default SettingsScreen;
