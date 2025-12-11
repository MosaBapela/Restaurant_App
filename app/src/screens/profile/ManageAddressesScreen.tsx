import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { AddressCard } from '../../components/profile/AddressCard';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { updateUser } from '../../redux/slices/authSlice';
import { colors, spacing, typography } from '../../theme';
import { Address } from '../../types/user.types';

type Props = NativeStackScreenProps<any, 'ManageAddresses'>;

export const ManageAddressesScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    province: '',
    postalCode: '',
  });

  const handleAddAddress = () => {
    if (!formData.street || !formData.city || !formData.province || !formData.postalCode) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newAddress: Address = {
      id: `addr_${Date.now()}`,
      ...formData,
      isDefault: user?.addresses.length === 0,
    };

    const updatedAddresses = [...(user?.addresses || []), newAddress];
    dispatch(updateUser({ addresses: updatedAddresses }));
    
    setShowAddModal(false);
    setFormData({ street: '', city: '', province: '', postalCode: '' });
    Alert.alert('Success', 'Address added successfully');
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedAddresses = user?.addresses.filter(
              (addr) => addr.id !== addressId
            );
            dispatch(updateUser({ addresses: updatedAddresses }));
          },
        },
      ]
    );
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="My Addresses"
        onBackPress={() => navigation.goBack()}
        rightIcon="add-outline"
        onRightPress={() => setShowAddModal(true)}
      />

      {user.addresses.length === 0 ? (
        <EmptyState
          icon="location-outline"
          title="No Addresses"
          message="Add your delivery addresses to make checkout easier"
        />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {user.addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onDelete={() => handleDeleteAddress(address.id)}
              showActions
            />
          ))}
        </ScrollView>
      )}

      {/* Add Address Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Address</Text>
            
            <Input
              label="STREET ADDRESS"
              placeholder="123 Main Street"
              value={formData.street}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, street: value }))
              }
              icon="location-outline"
            />

            <Input
              label="CITY"
              placeholder="Pretoria"
              value={formData.city}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, city: value }))
              }
            />

            <Input
              label="PROVINCE"
              placeholder="Gauteng"
              value={formData.province}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, province: value }))
              }
            />

            <Input
              label="POSTAL CODE"
              placeholder="0001"
              value={formData.postalCode}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, postalCode: value }))
              }
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowAddModal(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Add Address"
                onPress={handleAddAddress}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    padding: spacing.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
  },
});