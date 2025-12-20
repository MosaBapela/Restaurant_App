import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { FoodGrid } from '../../components/food/FoodGrid';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { toggleFavorite } from '../../redux/slices/favoritesSlice';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<any, 'Favorites'>;

export const FavoritesScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites);
  const items = useAppSelector((state) => state.food.items);

  const favoriteItems = items.filter((i) => favorites.includes(i.id));

  const handleItemPress = (item: any) => {
    navigation.navigate('FoodDetail', { foodItem: item });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favourites</Text>
      </View>

      <FoodGrid
        items={favoriteItems}
        onItemPress={handleItemPress}
        onFavoritePress={(item) => dispatch(toggleFavorite(item.id))}
        favorites={favorites}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
});

export default FavoritesScreen;
