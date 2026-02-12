import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {COLORS} from '../../constants/colors';
import {SPACING} from '../../constants/spacing';

const Button = ({title, onPress, type = 'primary', disabled = false, style}) => {
  const backgroundColor =
    type === 'primary' ? COLORS.primary : type === 'secondary' ? COLORS.secondary : COLORS.surface;
  const textColor = type === 'ghost' ? COLORS.primary : COLORS.surface;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {backgroundColor, opacity: disabled ? 0.5 : 1},
        type === 'ghost' && styles.ghost,
        style,
      ]}>
      <Text style={[styles.text, {color: textColor}]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  ghost: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default Button;
