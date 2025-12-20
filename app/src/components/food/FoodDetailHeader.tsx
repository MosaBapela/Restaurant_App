import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { FoodItem } from '../../types/food.types';
import { CURRENCY_SYMBOL } from '../../utils/constants';

interface FoodDetailHeaderProps {
  item: FoodItem;
}

const { width } = Dimensions.get('window');

export const FoodDetailHeader: React.FC<FoodDetailHeaderProps> = ({ item }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.overlay} />
      
      <View style={styles.infoContainer}>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={16} color={colors.warning} />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>
        
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.price}>
          {CURRENCY_SYMBOL} {item.price.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: width,
    height: 300,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  ratingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  ratingText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  name: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  category: {
    fontSize: typography.sizes.base,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.secondary,
  },
});
