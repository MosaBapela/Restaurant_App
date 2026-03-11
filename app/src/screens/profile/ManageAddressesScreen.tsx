import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { AddressCard } from '../../components/profile/AddressCard';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { updateUser } from '../../redux/slices/authSlice';
import {
    addUserAddress,
    deleteUserAddress,
    setDefaultAddress,
    updateUserAddress,
} from '../../services/firebase/profileService';
import { colors, spacing, typography } from '../../theme';
import { Address } from '../../types/user.types';

type Props = NativeStackScreenProps<any, 'ManageAddresses'>;

const EMPTY_FORM = { street: '', city: '', province: '', postalCode: '' };

export const ManageAddressesScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  //  Helpers 

  const openAdd = () => {
    setEditingAddress(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      street: address.street,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAddress(null);
    setFormData(EMPTY_FORM);
  };

  //  Save (add or edit) 

  const handleSave = () => {
    if (!formData.street || !formData.city || !formData.province || !formData.postalCode) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!user) return;

    if (editingAddress) {
      closeModal();
      (async () => {
        try {
          const updated = await updateUserAddress(user.uid, editingAddress.id, { ...formData });
          dispatch(updateUser(updated));
          Alert.alert('Success', 'Address updated successfully');
        } catch (err: any) {
          Alert.alert('Update failed', err?.message ?? String(err));
        }
      })();
    } else {
      const newAddress: Address = {
        id: `addr_${Date.now()}`,
        ...formData,
        isDefault: user.addresses.length === 0,
      };
      closeModal();
      (async () => {
        try {
          const updated = await addUserAddress(user.uid, newAddress);
          dispatch(updateUser(updated));
          Alert.alert('Success', 'Address added successfully');
        } catch (err: any) {
          Alert.alert('Add address failed', err?.message ?? String(err));
        }
      })();
    }
  };

  //  Set default 

  const handleSetDefault = (addressId: string) => {
    if (!user) return;
    (async () => {
      try {
        const updated = await setDefaultAddress(user.uid, addressId);
        dispatch(updateUser(updated));
      } catch (err: any) {
        Alert.alert('Error', err?.message ?? String(err));
      }
    })();
  };

  //  Delete 

  const handleDelete = (addressId: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (!user) return;
          (async () => {
            try {
              const updated = await deleteUserAddress(user.uid, addressId);
              dispatch(updateUser(updated));
            } catch (err: any) {
              Alert.alert('Delete failed', err?.message ?? String(err));
            }
          })();
        },
      },
    ]);
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="My Addresses"
        onBackPress={() => navigation.goBack()}
        rightIcon="add-outline"
        onRightPress={openAdd}
      />

      {user.addresses.length === 0 ? (
        <EmptyState
          icon="location-outline"
          title="No Addresses"
          message="Add your delivery addresses to make checkout easier"
        />
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {user.addresses.map((address) => (
            <View key={address.id}>
              <AddressCard
                address={address}
                onEdit={() => openEdit(address)}
                onDelete={() => handleDelete(address.id)}
                showActions
              />
              {!address.isDefault && (
                <TouchableOpacity style={styles.defaultBtn} onPress={() => handleSetDefault(address.id)}>
                  <Text style={styles.defaultBtnText}>  Set as Default</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add / Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingAddress ? 'Edit Address' : 'Add New Address'}</Text>

            <Input
              label="STREET ADDRESS"
              placeholder="123 Main Street"
              value={formData.street}
              onChangeText={(v) => setFormData((p) => ({ ...p, street: v }))}
              icon="location-outline"
            />

            <Input
              label="CITY"
              placeholder="Pretoria"
              value={formData.city}
              onChangeText={(v) => setFormData((p) => ({ ...p, city: v }))}
            />

            <Input
              label="PROVINCE"
              placeholder="Gauteng"
              value={formData.province}
              onChangeText={(v) => setFormData((p) => ({ ...p, province: v }))}
            />

            <Input
              label="POSTAL CODE"
              placeholder="0001"
              value={formData.postalCode}
              onChangeText={(v) => setFormData((p) => ({ ...p, postalCode: v }))}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={closeModal} variant="outline" style={styles.modalButton} />
              <Button title={editingAddress ? 'Save' : 'Add Address'} onPress={handleSave} style={styles.modalButton} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.md, flexGrow: 1, paddingBottom: 140 },
  defaultBtn: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    marginHorizontal: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignSelf: 'flex-start',
  },
  defaultBtnText: {
    fontSize: typography.sizes.sm,
    color: colors.white,
    fontWeight: typography.weights.semibold,
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
  modalButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  modalButton: { flex: 1 },
});
