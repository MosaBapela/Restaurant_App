import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { FoodItem } from '../../types/food.types';
import { CURRENCY_SYMBOL } from '../../utils/constants';

interface FoodCardProps {
  item: FoodItem;
  onPress: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.md * 3) / 2;

export const FoodCard: React.FC<FoodCardProps> = ({
  item,
  onPress,
  onFavoritePress,
  isFavorite = false,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        {onFavoritePress && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onFavoritePress}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? colors.primary : colors.white}
            />
          </TouchableOpacity>
        )}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color={colors.warning} />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {item.category}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>
            {CURRENCY_SYMBOL} {item.price.toFixed(2)}
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={onPress}>
            <Ionicons name="add" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: spacing.md,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: spacing.sm,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  infoContainer: {
    padding: spacing.md,
  },
  name: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  category: {
    fontSize: typography.sizes.sm,
    color: colors.darkGray,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.sm,
  },
});
