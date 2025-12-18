import React, { useEffect, useState } from 'react';
import { Button, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { auth } from '../../services/firebase/config';
import { getUserProfile } from '../../services/firebase/profileService';
import { colors, spacing, typography } from '../../theme';

export const ProfileDebugScreen: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const load = async () => {
    // eslint-disable-next-line no-console
    const current = auth?.currentUser ?? null;
    setUser(current);
    if (current?.uid) {
      const p = await getUserProfile(current.uid);
      setProfile(p);
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile Debug</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Firebase Auth currentUser</Text>
          <Text style={styles.mono}>{JSON.stringify(user, null, 2)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Firestore users/{`{uid}`}</Text>
          <Text style={styles.mono}>{JSON.stringify(profile, null, 2)}</Text>
        </View>

        <View style={styles.actions}>
          <Button title="Refresh" onPress={load} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  title: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, marginBottom: spacing.md },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontWeight: typography.weights.semibold, marginBottom: spacing.sm },
  mono: { fontFamily: 'monospace', backgroundColor: colors.white, padding: spacing.sm, borderRadius: 8 },
  actions: { marginTop: spacing.lg },
});
