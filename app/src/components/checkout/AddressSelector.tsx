import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Address } from '../../types/user.types';
import { Button } from '../common/Button';
import { AddressCard } from '../profile/AddressCard';

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddress: Address | null;
  onSelectAddress: (address: Address) => void;
  onAddNew: () => void;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  addresses,
  selectedAddress,
  onSelectAddress,
  onAddNew,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Address</Text>
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {addresses.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            onPress={() => onSelectAddress(address)}
            isSelected={selectedAddress?.id === address.id}
            showActions={false}
          />
        ))}
      </ScrollView>
      
      <Button
        title="Add New Address"
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