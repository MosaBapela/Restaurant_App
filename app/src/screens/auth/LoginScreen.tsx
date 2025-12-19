import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Alert,
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
import { loginSuccess, updateUser } from '../../redux/slices/authSlice';
import { loginWithEmail } from '../../services/firebase/authService';
import { getUserProfile } from '../../services/firebase/profileService';
import { timeAsync } from '../../services/firebase/timing';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<any, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    // basic validation with inline errors
    const emailRegex = /^\S+@\S+\.\S+$/;
    setEmailError(null);
    setPasswordError(null);
    let hasError = false;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Please enter your password');
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);
    try {
      const credential = await loginWithEmail(email, password);
      const firebaseUser = credential.user;

      // Optimistic UI: dispatch minimal user immediately so navigation feels instant
      const optimisticUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? email,
        name: '',
        surname: '',
        contactNumber: '',
        addresses: [],
        paymentCards: [],
        createdAt: Date.now(),
        isAdmin: false,
      };
      dispatch(loginSuccess(optimisticUser));

      // Navigate immediately
      setLoading(false);
      const isAdminEmail = email.toLowerCase() === 'admin@restaurant.com';
      Alert.alert('Success', 'Logged in successfully', [
        {
          text: 'OK',
          onPress: () => {
            try {
              let rootNav: any = navigation as any;
              while (rootNav.getParent && rootNav.getParent()) {
                rootNav = rootNav.getParent();
              }
              rootNav.reset({ index: 0, routes: [{ name: isAdminEmail ? 'Admin' : 'Main' }] });
            } catch (e) {
              // fallback
              (navigation as any).reset({ index: 0, routes: [{ name: isAdminEmail ? 'Admin' : 'Main' }] });
            }
          },
        },
      ]);

      // Background reconciliation: fetch real profile and update the Redux store when available.
      (async () => {
        try {
          const profile = await timeAsync('getUserProfile', () => getUserProfile(firebaseUser.uid));
          if (profile) {
            dispatch(updateUser(profile));
            // If this account is an admin, navigate to Admin stack (reconcile navigation)
            if (profile.isAdmin) {
              try {
                let rootNav: any = navigation as any;
                while (rootNav.getParent && rootNav.getParent()) {
                  rootNav = rootNav.getParent();
                }
                rootNav.reset({ index: 0, routes: [{ name: 'Admin' }] });
              } catch (e) {
                (navigation as any).reset({ index: 0, routes: [{ name: 'Admin' }] });
              }
            }
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('[login] background reconciliation failed', err);
        }
      })();
    } catch (err: any) {
      setLoading(false);
      const message = err?.message ?? String(err);
      Alert.alert('Login failed', message);
    }
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
              <Text style={styles.title}>Log In</Text>
              <Text style={styles.subtitle}>Please log in to use the restaurant app</Text>
          </View>
        </View>

        <View style={styles.form}>
          <Input
            label="EMAIL ADDRESS"
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
            error={emailError || undefined}
          />

          <Input
            label="PASSWORD"
            placeholder="••••••••••"
            value={password}
            onChangeText={setPassword}
            isPassword
            icon="lock-closed-outline"
            error={passwordError || undefined}
          />

          <View style={styles.options}>
            <TouchableOpacity
              style={styles.rememberMe}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <View style={styles.checkboxInner} />}
              </View>
              <Text style={styles.rememberMeText}>Remember Me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPassword}>Forgot Password ?</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Log In"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            style={styles.loginButton}
          />

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't Have An Account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Demo credentials info */}
          <View style={styles.demoInfo}>
            <Text style={styles.demoTitle}>Demo Credentials:</Text>
            <Text style={styles.demoText}>User: any email + password</Text>
            <Text style={styles.demoText}>Admin: admin@restaurant.com</Text>
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
    paddingBottom: 140,
  },
  header: {
    height: 200,
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
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.white,
  },
  rememberMeText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  forgotPassword: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  loginButton: {
    marginBottom: spacing.lg,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: typography.sizes.base,
    color: colors.darkGray,
  },
  signupLink: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  demoInfo: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  demoTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  demoText: {
    fontSize: typography.sizes.sm,
    color: colors.darkGray,
  },
});