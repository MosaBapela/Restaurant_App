import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { FoodCategory } from '../../types/food.types';
import { FOOD_CATEGORIES } from '../../utils/constants';

interface FoodCategoryTabsProps {
  selectedCategory: FoodCategory | 'All';
  onSelectCategory: (category: FoodCategory | 'All') => void;
}

export const FoodCategoryTabs: React.FC<FoodCategoryTabsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const categories = ['All', ...FOOD_CATEGORIES];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.tab,
              selectedCategory === category && styles.activeTab,
            ]}
            onPress={() => onSelectCategory(category as FoodCategory | 'All')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                selectedCategory === category && styles.activeTabText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  activeTabText: {
    color: colors.white,
  },
});
