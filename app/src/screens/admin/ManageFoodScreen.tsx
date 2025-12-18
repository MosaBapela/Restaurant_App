import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { EmptyState } from '../../components/common/EmptyState';
import { Header } from '../../components/common/Header';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { deleteFoodItem as reduxDeleteFoodItem, setFoodItems } from '../../redux/slices/foodSlice';
import { auth } from '../../services/firebase/config';
import {
    deleteFoodItem as serviceDeleteFoodItem,
    fetchFoodItems as serviceFetchFoodItems,
} from '../../services/firebase/foodService';
import { colors, spacing, typography } from '../../theme';
import { FoodItem } from '../../types/food.types';
import { CURRENCY_SYMBOL } from '../../utils/constants';

type Props = NativeStackScreenProps<any, 'ManageFood'>;

export const ManageFoodScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.food);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filteredItems =
    selectedCategory === 'All'
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const handleDeleteItem = (item: FoodItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
            onPress: async () => {
              // Log auth state for debugging web vs native
              // eslint-disable-next-line no-console
              console.debug('[ManageFood] attempting delete', { uid: auth?.currentUser?.uid ?? null, email: auth?.currentUser?.email ?? null });

              // Optimistic delete: remove from UI immediately then call service.
              const prev = items.slice();
              dispatch(reduxDeleteFoodItem(item.id));
              try {
                await serviceDeleteFoodItem(item.id);
                Alert.alert('Deleted', `${item.name} has been deleted.`);
              } catch (err: any) {
                // rollback on failure
                // eslint-disable-next-line no-console
                console.warn('[ManageFood] optimistic delete failed, rolling back', err);
                dispatch(setFoodItems(prev));
                Alert.alert('Error', err?.message || 'Failed to delete item');
              }
            },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const list = await serviceFetchFoodItems();
      dispatch(setFoodItems(list));
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.warn('[ManageFood] refresh failed', err);
    } finally {
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const list = await serviceFetchFoodItems();
        if (mounted) dispatch(setFoodItems(list));
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.warn('[ManageFood] fetch failed', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  const handleEditItem = (item: FoodItem) => {
    navigation.navigate('AddEditFood', { foodItem: item });
  };

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <TouchableOpacity
      style={styles.foodCard}
      onPress={() => handleEditItem(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.image }} style={styles.foodImage} />
      
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodCategory}>{item.category}</Text>
        <View style={styles.foodFooter}>
          <Text style={styles.foodPrice}>
            {CURRENCY_SYMBOL} {item.price.toFixed(2)}
          </Text>
          <View style={styles.foodRating}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditItem(item)}
        >
          <Ionicons name="pencil-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteItem(item)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      {!item.isAvailable && (
        <View style={styles.unavailableBadge}>
          <Text style={styles.unavailableText}>Unavailable</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Manage Food Items"
        onBackPress={() => navigation.goBack()}
        rightIcon="add-outline"
        onRightPress={() => navigation.navigate('AddEditFood')}
      />

      {loading && <LoadingSpinner />}

      {items.length === 0 ? (
        <EmptyState
          icon="fast-food-outline"
          title="No Food Items"
          message="Start adding food items to your menu"
        />
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderFoodItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
  },
  foodCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  foodInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
  },
  foodName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  foodCategory: {
    fontSize: typography.sizes.sm,
    color: colors.darkGray,
  },
  foodFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodPrice: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  foodRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  actions: {
    justifyContent: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unavailableText: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },
});