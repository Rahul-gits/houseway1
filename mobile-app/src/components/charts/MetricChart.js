import React from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';
import { colors, spacing, borderRadius } from '../../styles/theme';

const { width: screenWidth } = Dimensions.get('window');

const MetricChart = ({
  type,
  data,
  title,
  subtitle,
  style,
  height = 200,
  showGrid = true,
  showLegend = true,
  colors: customColors,
}) => {
  // Default chart colors
  const chartColors = customColors || [
    colors.blue[500],
    colors.blue[600],
    colors.beige[500],
    colors.success[500],
    colors.warning[500],
    colors.danger[500],
  ];

  // Format chart data for different types
  const formatChartData = () => {
    switch (type) {
      case 'pie':
        return {
          labels: data.labels,
          datasets: [{
            data: data.values,
            color: (opacity = 1) => {
              const index = chartColors.length % chartColors.length;
              return chartColors[index] + Math.round(opacity * 255).toString(16).padStart(2, '0');
            }
          }]
        };

      case 'line':
        return {
          labels: data.labels,
          datasets: [{
            data: data.values,
            color: (opacity = 1) => chartColors[0] + Math.round(opacity * 255).toString(16).padStart(2, '0'),
            strokeWidth: 2
          }]
        };

      case 'bar':
        return {
          labels: data.labels,
          datasets: [{
            data: data.values
          }]
        };

      default:
        return null;
    }
  };

  // Chart configurations
  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    decimalPlaces: 0,
    color: (opacity = 1) => colors.neutral[800] + Math.round(opacity * 255).toString(16).padStart(2, '0'),
    labelColor: (opacity = 1) => colors.neutral[600] + Math.round(opacity * 255).toString(16).padStart(2, '0'),
    style: {
      borderRadius: borderRadius.lg,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.blue[500],
    },
    propsForLabels: {
      fontSize: 10,
      fontFamily: 'Inter-Regular',
    },
  };

  // Render chart based on type
  const renderChart = () => {
    const chartData = formatChartData();

    if (!chartData) return null;

    switch (type) {
      case 'pie':
        return (
          <PieChart
            data={chartData}
            width={screenWidth - spacing.lg * 2}
            height={height}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 10]}
            absolute
            hasLegend={showLegend}
          />
        );

      case 'line':
        return (
          <LineChart
            data={chartData}
            width={screenWidth - spacing.lg * 2}
            height={height}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots={true}
            withShadow={false}
            withInnerLines={showGrid}
            withOuterLines={showGrid}
          />
        );

      case 'bar':
        return (
          <BarChart
            data={chartData}
            width={screenWidth - spacing.lg * 2}
            height={height}
            chartConfig={{
              ...chartConfig,
              fillColor: (opacity = 1) => chartColors[0] + Math.round(opacity * 255).toString(16).padStart(2, '0'),
            }}
            style={styles.chart}
            withInnerLines={showGrid}
            withOuterLines={showGrid}
            showValuesOnTopOfBars={true}
          />
        );

      default:
        return null;
    }
  };

  // Custom pie chart legend
  const renderPieLegend = () => {
    if (type !== 'pie' || !showLegend) return null;

    return (
      <View style={styles.pieLegend}>
        {data.labels.map((label, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: chartColors[index % chartColors.length] }
              ]}
            />
            <Text style={styles.legendText}>{label}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Summary statistics
  const renderSummary = () => {
    if (!data.summary) return null;

    return (
      <View style={styles.summaryContainer}>
        {Object.entries(data.summary).map(([key, value]) => (
          <View key={key} style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{key}</Text>
            <Text style={styles.summaryValue}>{value}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[colors.beige[100], colors.beige[200]]}
      style={[styles.container, style]}
    >
      {/* Header */}
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}

      {/* Chart */}
      <View style={styles.chartContainer}>
        {renderChart()}
      </View>

      {/* Pie Legend */}
      {renderPieLegend()}

      {/* Summary */}
      {renderSummary()}
    </LinearGradient>
  );
};

// Specialized chart components for specific metrics
export const ClientGrowthChart = ({ data, ...props }) => (
  <MetricChart
    type="line"
    title="Client Growth"
    subtitle="Monthly new client acquisitions"
    data={{
      labels: data.labels,
      values: data.values,
      summary: {
        'Total Clients': data.total,
        'Growth Rate': `${data.growthRate}%`,
        'This Month': data.currentMonth
      }
    }}
    colors={[colors.success[500]]}
    {...props}
  />
);

export const ProjectStatusChart = ({ data, ...props }) => (
  <MetricChart
    type="pie"
    title="Project Status"
    subtitle="Distribution of project statuses"
    data={{
      labels: ['Planning', 'In Progress', 'Completed', 'On Hold'],
      values: [
        data.planning || 0,
        data.inProgress || 0,
        data.completed || 0,
        data.onHold || 0
      ]
    }}
    colors={[colors.warning[500], colors.blue[500], colors.success[500], colors.neutral[400]]}
    {...props}
  />
);

export const RevenueChart = ({ data, ...props }) => (
  <MetricChart
    type="bar"
    title="Revenue Overview"
    subtitle="Monthly revenue breakdown"
    data={{
      labels: data.labels,
      values: data.values,
      summary: {
        'Total Revenue': `$${data.total.toLocaleString()}`,
        'Average': `$${data.average.toLocaleString()}`,
        'Peak Month': data.peakMonth
      }
    }}
    colors={[colors.blue[500]]}
    {...props}
  />
);

export const ClientDistributionChart = ({ data, ...props }) => (
  <MetricChart
    type="pie"
    title="Client Distribution"
    subtitle="Clients by type and risk level"
    data={{
      labels: data.labels,
      values: data.values
    }}
    colors={[colors.blue[500], colors.success[500], colors.warning[500], colors.danger[500]]}
    {...props}
  />
);

export const TimelineActivityChart = ({ data, ...props }) => (
  <MetricChart
    type="bar"
    title="Timeline Activity"
    subtitle="Events by type this month"
    data={{
      labels: data.labels,
      values: data.values,
      summary: {
        'Total Events': data.total,
        'Most Active': data.mostActive
      }
    }}
    colors={[colors.blue[600]]}
    {...props}
  />
);

// Mini chart for dashboard cards
export const MiniChart = ({ type, data, height = 60, color }) => (
  <View style={styles.miniChartContainer}>
    {type === 'line' && (
      <LineChart
        data={{
          labels: [],
          datasets: [{ data }]
        }}
        width={120}
        height={height}
        chartConfig={{
          backgroundColor: 'transparent',
          backgroundGradientFrom: 'transparent',
          backgroundGradientTo: 'transparent',
          decimalPlaces: 0,
          color: () => color || colors.blue[500],
          labelColor: () => 'transparent',
          propsForDots: { r: '0' },
          strokeWidth: 2,
        }}
        bezier
        withDots={false}
        withShadow={false}
        withInnerLines={false}
        withOuterLines={false}
        style={styles.miniChart}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginVertical: spacing.sm,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: colors.neutral[800],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  pieLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
    marginVertical: spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.neutral[600],
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.beige[300],
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.neutral[500],
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: colors.neutral[800],
  },
  miniChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniChart: {
    margin: 0,
    padding: 0,
  },
});

export default MetricChart;