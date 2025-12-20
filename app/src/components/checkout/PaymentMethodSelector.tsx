import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { PaymentCard } from '../../types/user.types';
import { Button } from '../common/Button';
import { CardDisplay } from '../profile/CardDisplay';

interface PaymentMethodSelectorProps {
  cards: PaymentCard[];
  selectedCard: PaymentCard | null;
  onSelectCard: (card: PaymentCard) => void;
  onAddNew: () => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  cards,
  selectedCard,
  onSelectCard,
  onAddNew,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Method</Text>
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {cards.map((card) => (
          <CardDisplay
            key={card.id}
            card={card}
            onPress={() => onSelectCard(card)}
            isSelected={selectedCard?.id === card.id}
            showActions={false}
          />
        ))}
      </ScrollView>
      
      <Button
        title="Add New Card"
        onPress={onAddNew}
        variant="outline"
        style={styles.addButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  scrollView: {
    maxHeight: 300,
  },
  addButton: {
    marginTop: spacing.sm,
  },
});
