import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { spacing } from '../../theme';
import { FoodItem } from '../../types/food.types';
import { EmptyState } from '../common/EmptyState';
import { FoodCard } from './FoodCard';

interface FoodGridProps {
  items: FoodItem[];
  onItemPress: (item: FoodItem) => void;
  onFavoritePress?: (item: FoodItem) => void;
  favorites?: string[];
}

export const FoodGrid: React.FC<FoodGridProps> = ({
  items,
  onItemPress,
  onFavoritePress,
  favorites = [],
}) => {
  if (items.length === 0) {
    return (
      <EmptyState
        icon="fast-food-outline"
        title="No items found"
        message="Try searching for something else or browse different categories"
      />
    );
  }

  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <FoodCard
          item={item}
          onPress={() => onItemPress(item)}
          onFavoritePress={
            onFavoritePress ? () => onFavoritePress(item) : undefined
          }
          isFavorite={favorites.includes(item.id)}
        />
      )}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
  },
  row: {
    justifyContent: 'space-between',
  },
});
