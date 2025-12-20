import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography } from '../../theme';

const WelcomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Our Restaurant</Text>
        <Text style={styles.subtitle}>
          Discover delicious meals and order with ease. Sign in to get started or create an account.
        </Text>
        <Button title="Get Started" onPress={() => navigation.navigate('Login')} fullWidth style={styles.button} />
        <Button title="Create Account" onPress={() => navigation.navigate('Register')} variant="outline" fullWidth style={styles.button} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, justifyContent: 'center', flex: 1 },
  title: { fontSize: typography.sizes.xxxl, fontWeight: typography.weights.bold, color: colors.text, marginBottom: spacing.md },
  subtitle: { fontSize: typography.sizes.base, color: colors.darkGray, marginBottom: spacing.lg },
  button: { marginBottom: spacing.md },
});

export default WelcomeScreen;
