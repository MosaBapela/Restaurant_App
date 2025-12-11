import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { useAppDispatch } from '../../redux/hooks';
import { addFoodItem, updateFoodItem } from '../../redux/slices/foodSlice';
import { colors, spacing, typography } from '../../theme';
import { FoodCategory, FoodItem } from '../../types/food.types';
import { FOOD_CATEGORIES } from '../../utils/constants';

type Props = NativeStackScreenProps<any, 'AddEditFood'>;

export const AddEditFoodScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const editItem = route.params?.foodItem;
  const isEditMode = !!editItem;

  const [formData, setFormData] = useState({
    name: editItem?.name || '',
    description: editItem?.description || '',
    price: editItem?.price?.toString() || '',
    category: editItem?.category || 'Burgers',
    image: editItem?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
    rating: editItem?.rating?.toString() || '4.5',
    isAvailable: editItem?.isAvailable ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    if (!formData.name || !formData.description || !formData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    const foodItem: FoodItem = {
      id: isEditMode ? editItem.id : `food_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image: formData.image,
      category: formData.category as FoodCategory,
      rating: parseFloat(formData.rating),
      isAvailable: formData.isAvailable,
      sideOptions: editItem?.sideOptions || [],
      drinkOptions: editItem?.drinkOptions || [],
      extras: editItem?.extras || [],
      removableIngredients: editItem?.removableIngredients || [],
    };

    setTimeout(() => {
      if (isEditMode) {
        dispatch(updateFoodItem(foodItem));
      } else {
        dispatch(addFoodItem(foodItem));
      }
      setLoading(false);
      Alert.alert(
        'Success',
        `Food item ${isEditMode ? 'updated' : 'added'} successfully`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1000);
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={isEditMode ? 'Edit Food Item' : 'Add Food Item'}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Preview */}
        <View style={styles.imageSection}>
          <Image source={{ uri: formData.image }} style={styles.image} />
          <TouchableOpacity style={styles.changeImageButton}>
            <Ionicons name="camera-outline" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Basic Information */}
        <Input
          label="FOOD NAME"
          placeholder="e.g., Beef Burger"
          value={formData.name}
          onChangeText={(value) => updateField('name', value)}
          icon="fast-food-outline"
        />

        <View style={styles.textAreaContainer}>
          <Text style={styles.label}>DESCRIPTION</Text>
          <Input
            placeholder="Enter food description"
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            style={styles.textArea}
            multiline
            numberOfLines={4}
          />
        </View>

        <Input
          label="PRICE (R)"
          placeholder="0.00"
          value={formData.price}
          onChangeText={(value) => updateField('price', value)}
          keyboardType="decimal-pad"
          icon="cash-outline"
        />

        {/* Category Selection */}
        <Text style={styles.label}>CATEGORY</Text>
        <View style={styles.categoryGrid}>
          {FOOD_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                formData.category === category && styles.categoryButtonSelected,
              ]}
              onPress={() => updateField('category', category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  formData.category === category && styles.categoryTextSelected,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="RATING"
          placeholder="4.5"
          value={formData.rating}
          onChangeText={(value) => updateField('rating', value)}
          keyboardType="decimal-pad"
          icon="star-outline"
        />

        {/* Availability Toggle */}
        <TouchableOpacity
          style={styles.availabilityToggle}
          onPress={() => updateField('isAvailable', !formData.isAvailable)}
        >
          <Text style={styles.availabilityLabel}>Available</Text>
          <View
            style={[
              styles.toggle,
              formData.isAvailable && styles.toggleActive,
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                formData.isAvailable && styles.toggleThumbActive,
              ]}
            />
          </View>
        </TouchableOpacity>

        {/* Save Button */}
        <Button
          title={isEditMode ? 'Update Food Item' : 'Add Food Item'}
          onPress={handleSave}
          loading={loading}
          fullWidth
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: spacing.sm,
    right: '30%',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  textAreaContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  categoryButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  categoryTextSelected: {
    color: colors.white,
  },
  availabilityToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  availabilityLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray,
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.accent,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  saveButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});