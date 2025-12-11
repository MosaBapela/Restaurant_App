import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { FoodCategoryTabs } from '../../components/food/FoodCategoryTabs';
import { FoodGrid } from '../../components/food/FoodGrid';
import { mockFoodItems } from '../../data/mockData';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setCategory, setFoodItems, setSearchQuery } from '../../redux/slices/foodSlice';
import { colors, spacing, typography } from '../../theme';
import { FoodCategory } from '../../types/food.types';

type Props = NativeStackScreenProps<any, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { filteredItems, selectedCategory } = useAppSelector((state) => state.food);
  const { totalItems } = useAppSelector((state) => state.cart);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    // Load food items on mount
    dispatch(setFoodItems(mockFoodItems));
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    dispatch(setSearchQuery(text));
  };

  const handleCategorySelect = (category: FoodCategory | 'All') => {
    dispatch(setCategory(category));
  };

  const handleFoodPress = (item: any) => {
    navigation.navigate('FoodDetail', { foodItem: item });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image
              source={{ uri: 'https://ui-avatars.com/api/?name=' + user?.name || 'User' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              Choose{'\n'}Your Favorite <Text style={styles.foodText}>Food</Text>
            </Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => {}}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={colors.darkGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={colors.darkGray}
              value={searchText}
              onChangeText={handleSearch}
            />
          </View>
          
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <FoodCategoryTabs
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      {/* Popular Food Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Food</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Food Grid */}
      <FoodGrid
        items={filteredItems}
        onItemPress={handleFoodPress}
      />

      {/* Cart Badge */}
      {totalItems > 0 && (
        <TouchableOpacity
          style={styles.cartFab}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="cart" size={24} color={colors.white} />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{totalItems}</Text>
          </View>
        </TouchableOpacity>
      )}
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
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  headerContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  greeting: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    lineHeight: 28,
  },
  foodText: {
    color: colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    height: 50,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  seeAll: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  cartFab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.accent,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
});