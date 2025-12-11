import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAppDispatch } from '../../redux/hooks';
import { loginSuccess } from '../../redux/slices/authSlice';
import { colors, spacing, typography } from '../../theme';
import { User } from '../../types/user.types';

type Props = NativeStackScreenProps<any, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newUser: User = {
        uid: `user_${Date.now()}`,
        email: formData.email,
        name: formData.name,
        surname: formData.surname,
        contactNumber: formData.contactNumber,
        addresses: [
          {
            id: 'addr1',
            street: formData.street,
            city: formData.city,
            province: formData.province,
            postalCode: formData.postalCode,
            isDefault: true,
          },
        ],
        paymentCards: [],
        createdAt: Date.now(),
        isAdmin: false,
      };
      
      dispatch(loginSuccess(newUser));
      setLoading(false);
    }, 1000);
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerShape} />
          <View style={styles.headerContent}>
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>Please fill the your details</Text>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <Input
            label="USER NAME"
            placeholder="John Doe"
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
            placeholder="example@email.com"
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

          <Input
            label="PASSWORD"
            placeholder="••••••••••"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            isPassword
            icon="lock-closed-outline"
          />

          <Input
            label="CONFIRM PASSWORD"
            placeholder="••••••••••"
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            isPassword
            icon="lock-closed-outline"
          />

          <Text style={styles.sectionTitle}>Address Details</Text>

          <Input
            label="STREET ADDRESS"
            placeholder="123 Main Street"
            value={formData.street}
            onChangeText={(value) => updateField('street', value)}
            icon="location-outline"
          />

          <Input
            label="CITY"
            placeholder="Pretoria"
            value={formData.city}
            onChangeText={(value) => updateField('city', value)}
          />

          <Input
            label="PROVINCE"
            placeholder="Gauteng"
            value={formData.province}
            onChangeText={(value) => updateField('province', value)}
          />

          <Input
            label="POSTAL CODE"
            placeholder="0001"
            value={formData.postalCode}
            onChangeText={(value) => updateField('postalCode', value)}
            keyboardType="numeric"
          />

          <Button
            title="Sign Up"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            style={styles.registerButton}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already Have An Account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    height: 180,
    position: 'relative',
    overflow: 'hidden',
  },
  headerShape: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 100,
    transform: [{ scaleX: 2 }],
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.white,
    opacity: 0.9,
  },
  form: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  registerButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  loginText: {
    fontSize: typography.sizes.base,
    color: colors.darkGray,
  },
  loginLink: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
});
