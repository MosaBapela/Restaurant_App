import React, { useEffect } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/common/Button";
import { colors, spacing, typography } from "../../theme";

const ClosingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  useEffect(() => {
    // After a short delay navigate to welcome/login
    const t = setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
    }, 2500);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Goodbye!</Text>
        <Text style={styles.subtitle}>
          Thanks for visiting — we hope to see you again soon.
        </Text>
        <Button
          title="Back to Welcome"
          onPress={() =>
            navigation.reset({ index: 0, routes: [{ name: "Welcome" }] })
          }
          fullWidth
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, justifyContent: "center", flex: 1 },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.darkGray,
    marginBottom: spacing.lg,
  },
  button: { marginBottom: spacing.md },
});

export default ClosingScreen;
