import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface HeaderProps {
  title: string;
  onBackPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBackPress,
  rightIcon,
  onRightPress,
}) => {
  return (
    <View style={styles.container}>
      {onBackPress ? (
        <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} />
      )}
      <Text style={styles.title}>{title}</Text>
      {rightIcon && onRightPress ? (
        <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
          <Ionicons name={rightIcon} size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
});
