import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../components/common/Button';
import { CustomizationSection } from '../../components/food/CustomizationSection';
import { ExtrasOptions } from '../../components/food/ExtrasOptions';
import { FoodDetailHeader } from '../../components/food/FoodDetailHeader';
import { QuantitySelector } from '../../components/food/QuantitySelector';
import { SideOptions } from '../../components/food/SideOptions';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleFavorite } from '../../redux/slices/favoritesSlice';
import { colors, spacing, typography } from '../../theme';
import { CartItem, CartItemCustomization } from '../../types/cart.types';
import { DrinkOption, Extra, FoodItem } from '../../types/food.types';
import { CURRENCY_SYMBOL } from '../../utils/constants';

type Props = NativeStackScreenProps<any, 'FoodDetail'>;

export const FoodDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { foodItem } = route.params as { foodItem: FoodItem };
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites);

  const [quantity, setQuantity] = useState(1);
  const [selectedSides, setSelectedSides] = useState<string[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);

  const handleSelectSide = (sideId: string) => {
    setSelectedSides((prev) => {
      if (prev.includes(sideId)) {
        return prev.filter((id) => id !== sideId);
      }
      if (prev.length < 2) {
        return [...prev, sideId];
      }
      return prev;
    });
  };

  const handleToggleExtra = (extraId: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraId)
        ? prev.filter((id) => id !== extraId)
        : [...prev, extraId]
    );
  };

  const handleToggleIngredient = (ingredient: string) => {
    setRemovedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((i) => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const calculateTotalPrice = () => {
    let total = foodItem.price;

    // Add selected drink price
    if (selectedDrink && foodItem.drinkOptions) {
      const drink = foodItem.drinkOptions.find((d: DrinkOption) => d.id === selectedDrink);
      if (drink) total += drink.price;
    }

    // Add extras prices
    if (foodItem.extras) {
      const extras = foodItem.extras;
      selectedExtras.forEach((extraId) => {
        const extra = extras.find((e: Extra) => e.id === extraId);
        if (extra) total += extra.price;
      });
    }

    return total * quantity;
  };

  const handleAddToCart = () => {
    const customization: CartItemCustomization = {
      selectedSides,
      selectedDrink,
      selectedExtras,
      removedIngredients,
    };

    const cartItem: CartItem = {
      id: `${foodItem.id}_${Date.now()}`,
      foodItem,
      quantity,
      customization,
      totalPrice: calculateTotalPrice(),
      timestamp: Date.now(),
    };

    dispatch(addToCart(cartItem));
    navigation.goBack();
  };

  const totalPrice = calculateTotalPrice();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => dispatch(toggleFavorite(foodItem.id))}
        >
          <Ionicons
            name={favorites.includes(foodItem.id) ? 'heart' : 'heart-outline'}
            size={24}
            color={favorites.includes(foodItem.id) ? colors.primary : colors.white}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <FoodDetailHeader item={foodItem} />

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <Text style={styles.description}>{foodItem.description}</Text>
          </View>

          {foodItem.sideOptions && foodItem.sideOptions.length > 0 && (
            <SideOptions
              options={foodItem.sideOptions}
              selectedSides={selectedSides}
              onSelectSide={handleSelectSide}
              maxSelections={2}
            />
          )}

          {foodItem.drinkOptions && foodItem.drinkOptions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose a Drink</Text>
              {foodItem.drinkOptions.map((drink: DrinkOption) => (
                <TouchableOpacity
                  key={drink.id}
                  style={[
                    styles.drinkOption,
                    selectedDrink === drink.id && styles.drinkOptionSelected,
                  ]}
                  onPress={() => setSelectedDrink(drink.id)}
                >
                  <Text
                    style={[
                      styles.drinkName,
                      selectedDrink === drink.id && styles.drinkNameSelected,
                    ]}
                  >
                    {drink.name}
                  </Text>
                  <Text
                    style={[
                      styles.drinkPrice,
                      selectedDrink === drink.id && styles.drinkPriceSelected,
                    ]}
                  >
                    +{CURRENCY_SYMBOL} {drink.price.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {foodItem.extras && foodItem.extras.length > 0 && (
            <ExtrasOptions
              extras={foodItem.extras}
              selectedExtras={selectedExtras}
              onToggleExtra={handleToggleExtra}
            />
          )}

          {foodItem.removableIngredients &&
            foodItem.removableIngredients.length > 0 && (
              <CustomizationSection
                title="Remove Ingredients"
                options={foodItem.removableIngredients}
                selectedOptions={removedIngredients}
                onToggleOption={handleToggleIngredient}
                isRemovable
              />
            )}

          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <QuantitySelector
              quantity={quantity}
              onIncrement={() => setQuantity(quantity + 1)}
              onDecrement={() => setQuantity(quantity - 1)}
              min={1}
              max={20}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.priceValue}>
            {CURRENCY_SYMBOL} {totalPrice.toFixed(2)}
          </Text>
        </View>
        <Button
          title="Add to Cart"
          onPress={handleAddToCart}
          style={styles.addButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.sizes.base,
    color: colors.darkGray,
    lineHeight: 24,
  },
  drinkOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  drinkOptionSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  drinkName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  drinkNameSelected: {
    color: colors.white,
  },
  drinkPrice: {
    fontSize: typography.sizes.base,
    color: colors.primary,
  },
  drinkPriceSelected: {
    color: colors.white,
  },
  quantitySection: {
    marginBottom: spacing.lg,
  },
  footer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  priceLabel: {
    fontSize: typography.sizes.base,
    color: colors.darkGray,
  },
  priceValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  addButton: {
    width: '100%',
  },
});