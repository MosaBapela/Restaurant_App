import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ChartSection } from '../../components/admin/ChartSection';
import { StatCard } from '../../components/admin/StatCard';
import { useAppSelector } from '../../redux/hooks';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<any, 'AdminDashboard'>;

export const AdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { orders } = useAppSelector((state) => state.order);
  const { items } = useAppSelector((state) => state.food);

  // Calculate stats
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;

  // Chart data - Last 7 days revenue
  const revenueChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [2500, 3200, 2800, 4100, 3500, 4800, 5200],
      },
    ],
  };

  // Chart data - Orders by category
  const categoryChartData = {
    labels: ['Burgers', 'Pizza', 'Mains', 'Dessert'],
    datasets: [
      {
        data: [45, 38, 28, 22],
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="cash-outline"
            title="Total Revenue"
            value={`R ${totalRevenue.toFixed(2)}`}
            change="+12.5%"
            changeType="increase"
            iconColor={colors.accent}
          />
          <StatCard
            icon="receipt-outline"
            title="Total Orders"
            value={totalOrders}
            change="+8.2%"
            changeType="increase"
            iconColor={colors.primary}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon="time-outline"
            title="Pending"
            value={pendingOrders}
            iconColor={colors.warning}
          />
          <StatCard
            icon="checkmark-circle-outline"
            title="Delivered"
            value={deliveredOrders}
            change="+15.3%"
            changeType="increase"
            iconColor={colors.success}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ManageFood')}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons name="fast-food-outline" size={32} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>Manage Food</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('OrderManagement')}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${colors.accent}20` }]}>
                <Ionicons name="list-outline" size={32} color={colors.accent} />
              </View>
              <Text style={styles.actionText}>View Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AddEditFood')}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${colors.secondary}20` }]}>
                <Ionicons name="add-circle-outline" size={32} color={colors.secondary} />
              </View>
              <Text style={styles.actionText}>Add Food</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: `${colors.success}20` }]}>
                <Ionicons name="settings-outline" size={32} color={colors.success} />
              </View>
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Charts */}
        <ChartSection
          title="Revenue (Last 7 Days)"
          type="line"
          data={revenueChartData}
        />

        <ChartSection
          title="Orders by Category"
          type="bar"
          data={categoryChartData}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  actionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    textAlign: 'center',
  },
});