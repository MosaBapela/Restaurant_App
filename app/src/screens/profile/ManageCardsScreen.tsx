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
import { CardDisplay } from '../../components/profile/CardDisplay';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { updateUser } from '../../redux/slices/authSlice';
import { colors, spacing, typography } from '../../theme';
import { PaymentCard } from '../../types/user.types';

type Props = NativeStackScreenProps<any, 'ManageCards'>;

export const ManageCardsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  const handleAddCard = () => {
    if (!formData.cardNumber || !formData.cardHolder || !formData.expiryDate || !formData.cvv) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Mask card number
    const maskedNumber = formData.cardNumber.replace(
      /(\d{4})\d{8}(\d{4})/,
      '$1 **** **** $2'
    );

    const newCard: PaymentCard = {
      id: `card_${Date.now()}`,
      cardNumber: maskedNumber,
      cardHolder: formData.cardHolder,
      expiryDate: formData.expiryDate,
      cvv: '***',
      isDefault: user?.paymentCards.length === 0,
    };

    const updatedCards = [...(user?.paymentCards || []), newCard];
    dispatch(updateUser({ paymentCards: updatedCards }));
    
    setShowAddModal(false);
    setFormData({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
    Alert.alert('Success', 'Card added successfully');
  };

  const handleDeleteCard = (cardId: string) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedCards = user?.paymentCards.filter(
              (card) => card.id !== cardId
            );
            dispatch(updateUser({ paymentCards: updatedCards }));
          },
        },
      ]
    );
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Payment Methods"
        onBackPress={() => navigation.goBack()}
        rightIcon="add-outline"
        onRightPress={() => setShowAddModal(true)}
      />

      {user.paymentCards.length === 0 ? (
        <EmptyState
          icon="card-outline"
          title="No Payment Methods"
          message="Add your payment cards for quick and easy checkout"
        />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {user.paymentCards.map((card) => (
            <CardDisplay
              key={card.id}
              card={card}
              onDelete={() => handleDeleteCard(card.id)}
              showActions
            />
          ))}
        </ScrollView>
      )}

      {/* Add Card Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Card</Text>
            
            <Input
              label="CARD NUMBER"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, cardNumber: value }))
              }
              keyboardType="numeric"
              icon="card-outline"
              maxLength={16}
            />

            <Input
              label="CARD HOLDER NAME"
              placeholder="John Doe"
              value={formData.cardHolder}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, cardHolder: value }))
              }
              icon="person-outline"
            />

            <View style={styles.row}>
              <Input
                label="EXPIRY DATE"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, expiryDate: value }))
                }
                keyboardType="numeric"
                style={styles.halfInput}
                maxLength={5}
              />

              <Input
                label="CVV"
                placeholder="123"
                value={formData.cvv}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, cvv: value }))
                }
                keyboardType="numeric"
                style={styles.halfInput}
                maxLength={3}
                isPassword
              />
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowAddModal(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Add Card"
                onPress={handleAddCard}
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
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