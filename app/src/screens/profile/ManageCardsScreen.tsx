import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { Header } from "../../components/common/Header";
import { Input } from "../../components/common/Input";
import { CardDisplay } from "../../components/profile/CardDisplay";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { updateUser } from "../../redux/slices/authSlice";
import {
  addPaymentCard,
  deletePaymentCard,
  setDefaultPaymentCard,
  updatePaymentCard,
} from "../../services/firebase/profileService";
import { colors, spacing, typography } from "../../theme";
import { PaymentCard } from "../../types/user.types";

type Props = NativeStackScreenProps<any, "ManageCards">;

const EMPTY_FORM = { cardNumber: "", cardHolder: "", expiryDate: "", cvv: "" };

export const ManageCardsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<PaymentCard | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingCard(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (card: PaymentCard) => {
    setEditingCard(card);
    setFormData({
      cardNumber: card.cardNumber,
      cardHolder: card.cardHolder,
      expiryDate: card.expiryDate,
      cvv: "", // never pre-fill CVV for security
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCard(null);
    setFormData(EMPTY_FORM);
  };

  /** Auto-insert "/" after MM when user types expiry */
  const handleExpiryChange = (value: string) => {
    // Strip non-digits
    const digits = value.replace(/\D/g, "");
    let formatted = digits;
    if (digits.length >= 3) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    } else if (digits.length === 2 && !value.includes("/")) {
      formatted = `${digits}/`;
    }
    setFormData((prev) => ({ ...prev, expiryDate: formatted }));
  };

  /** Auto-insert spaces every 4 digits: "4242424242424242" → "4242 4242 4242 4242" */
  const handleCardNumberChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
    setFormData((prev) => ({ ...prev, cardNumber: formatted }));
  };

  // ── Save (add or edit) ────────────────────────────────────────────────────

  const handleSave = () => {
    if (!formData.cardHolder || !formData.expiryDate) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (!editingCard && (!formData.cardNumber || !formData.cvv)) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (!user) return;

    if (editingCard) {
      // Edit existing
      const updates: Partial<PaymentCard> = {
        cardHolder: formData.cardHolder,
        expiryDate: formData.expiryDate,
      };
      closeModal();
      (async () => {
        try {
          const updated = await updatePaymentCard(
            user.uid,
            editingCard.id,
            updates,
          );
          dispatch(updateUser(updated));
          Alert.alert("Success", "Card updated successfully");
        } catch (err: any) {
          Alert.alert("Update failed", err?.message ?? String(err));
        }
      })();
    } else {
      // Add new — strip spaces from formatted card number before masking
      const rawDigits = formData.cardNumber.replace(/\s/g, "");
      const maskedNumber = rawDigits.replace(
        /(\d{4})(\d{4})(\d{4})(\d{4})/,
        "$1 **** **** $4",
      );
      const newCard: PaymentCard = {
        id: `card_${Date.now()}`,
        cardNumber: maskedNumber || formData.cardNumber,
        cardHolder: formData.cardHolder,
        expiryDate: formData.expiryDate,
        cvv: "***",
        isDefault: user.paymentCards.length === 0,
      };
      closeModal();
      (async () => {
        try {
          const updated = await addPaymentCard(user.uid, newCard);
          dispatch(updateUser(updated));
          Alert.alert("Success", "Card added successfully");
        } catch (err: any) {
          Alert.alert("Add card failed", err?.message ?? String(err));
        }
      })();
    }
  };

  // ── Set default ───────────────────────────────────────────────────────────

  const handleSetDefault = (cardId: string) => {
    if (!user) return;
    (async () => {
      try {
        const updated = await setDefaultPaymentCard(user.uid, cardId);
        dispatch(updateUser(updated));
      } catch (err: any) {
        Alert.alert("Error", err?.message ?? String(err));
      }
    })();
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = (cardId: string) => {
    Alert.alert("Delete Card", "Are you sure you want to delete this card?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          if (!user) return;
          (async () => {
            try {
              const updated = await deletePaymentCard(user.uid, cardId);
              dispatch(updateUser(updated));
            } catch (err: any) {
              Alert.alert("Delete failed", err?.message ?? String(err));
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
        title="Payment Methods"
        onBackPress={() => navigation.goBack()}
        rightIcon="add-outline"
        onRightPress={openAdd}
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
            <View key={card.id}>
              <CardDisplay
                card={card}
                onDelete={() => handleDelete(card.id)}
                showActions
              />
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => openEdit(card)}
                >
                  <Text style={styles.actionBtnText}>✏️ Edit</Text>
                </TouchableOpacity>
                {!card.isDefault && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.defaultBtn]}
                    onPress={() => handleSetDefault(card.id)}
                  >
                    <Text style={styles.defaultBtnText}>★ Set as Default</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add / Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCard ? "Edit Card" : "Add New Card"}
            </Text>

            {/* Card number — only for new cards */}
            {!editingCard && (
              <Input
                label="CARD NUMBER"
                placeholder="4242 4242 4242 4242"
                value={formData.cardNumber}
                onChangeText={handleCardNumberChange}
                keyboardType="numeric"
                icon="card-outline"
                maxLength={19}
              />
            )}

            <Input
              label="CARD HOLDER NAME"
              placeholder="John Doe"
              value={formData.cardHolder}
              onChangeText={(v) =>
                setFormData((p) => ({ ...p, cardHolder: v }))
              }
              icon="person-outline"
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Input
                  label="EXPIRY DATE"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChangeText={handleExpiryChange}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              {/* CVV — only for new cards */}
              {!editingCard && (
                <View style={styles.cvvField}>
                  <Input
                    label="CVV"
                    placeholder="123"
                    value={formData.cvv}
                    onChangeText={(v) => setFormData((p) => ({ ...p, cvv: v }))}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              )}
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={closeModal}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title={editingCard ? "Save" : "Add Card"}
                onPress={handleSave}
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
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.md, flexGrow: 1, paddingBottom: 140 },
  cardActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  actionBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  actionBtnText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  defaultBtn: { backgroundColor: colors.accent },
  defaultBtnText: {
    fontSize: typography.sizes.sm,
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  row: { flexDirection: "row", gap: spacing.md },
  halfInput: { flex: 1 },
  halfField: { flex: 1 },
  cvvField: { flex: 1, minWidth: 110 },
  modalButtons: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalButton: { flex: 1 },
});
