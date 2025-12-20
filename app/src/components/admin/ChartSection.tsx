import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { colors, spacing, typography } from '../../theme';

interface ChartSectionProps {
  title: string;
  type: 'line' | 'bar';
  data: {
    labels: string[];
    datasets: {
      data: number[];
    }[];
  };
}

const { width } = Dimensions.get('window');
const chartWidth = width - spacing.md * 4;

export const ChartSection: React.FC<ChartSectionProps> = ({
  title,
  type,
  data,
}) => {
  const chartConfig = {
    backgroundColor: colors.white,
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(192, 57, 43, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(44, 44, 44, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {type === 'line' ? (
        <LineChart
          data={data}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          fromZero
        />
      ) : (
        <BarChart
          data={data}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          fromZero
          yAxisLabel=""
          yAxisSuffix=""
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: 16,
  },
});