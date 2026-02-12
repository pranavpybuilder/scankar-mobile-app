import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {COLORS} from '../constants/colors';

const SplashScreen = ({navigation}) => {
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('Onboarding'), 900);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SCANकर</Text>
      <Text style={styles.tagline}>Offline sheet digitization</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  logo: {
    color: COLORS.surface,
    fontSize: 38,
    fontWeight: '800',
  },
  tagline: {
    color: COLORS.surface,
    opacity: 0.9,
    marginTop: 8,
    fontSize: 14,
  },
});

export default SplashScreen;
