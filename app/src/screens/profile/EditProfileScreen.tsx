import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet
} from 'react-native';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { updateUser } from '../../redux/slices/authSlice';
import { updateUserProfile } from '../../services/firebase/profileService';
import { colors, spacing } from '../../theme';

type Props = NativeStackScreenProps<any, 'EditProfile'>;

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    email: user?.email || '',
    contactNumber: user?.contactNumber || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Call Firestore to update the authoritative user profile
      const updated = await updateUserProfile(user.uid, formData as any);

      // Update redux with the normalized user returned from Firestore
      dispatch(updateUser(updated));
      setLoading(false);
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      setLoading(false);
      const message = err?.message ?? String(err);
      Alert.alert('Update failed', message);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Edit Profile"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="FIRST NAME"
          placeholder="John"
          value={formData.name}
          onChangeText={(value) => updateField('name', value)}
          icon="person-outline"
        />

        <Input
          label="SURNAME"
          placeholder="Doe"
          value={formData.surname}
          onChangeText={(value) => updateField('surname', value)}
          icon="person-outline"
        />

        <Input
          label="EMAIL ADDRESS"
          placeholder="john.doe@example.com"
          value={formData.email}
          onChangeText={(value) => updateField('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          icon="mail-outline"
        />

        <Input
          label="CONTACT NUMBER"
          placeholder="0821234567"
          value={formData.contactNumber}
          onChangeText={(value) => updateField('contactNumber', value)}
          keyboardType="phone-pad"
          icon="call-outline"
        />

        <Button
          title="Save Changes"
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
    flexGrow: 1,
    paddingBottom: 140,
  },
  saveButton: {
    marginTop: spacing.lg,
  },
});