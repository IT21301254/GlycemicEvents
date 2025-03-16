// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import Animated, { FadeIn } from 'react-native-reanimated';

// Import components when they're created
import GlucoseStatusCard from '../../components/home/GlucoseStatusCard';
import PredictionCard from '../../components/home/PredictionCard';
import DailyOverviewChart from '../../components/home/DailyOverviewChart';
import RecentEntriesTimeline from '../../components/home/RecentEntriesTimeline';
import QuickActionsBar from '../../components/home/QuickActionsBar';

// Import services
import { dataService, predictionService } from '../../services';

// Sample data for demonstration
const sampleEntries = [
  { type: 'glucose', value: 120, time: 'Today, 10:30 AM', id: '1' },
  { type: 'insulin', value: 5, time: 'Today, 8:15 AM', insulinType: 'bolus', id: '2' },
  { type: 'meal', value: 45, time: 'Today, 8:00 AM', mealType: 'Breakfast', id: '3' },
  { type: 'activity', value: 30, time: 'Yesterday, 5:30 PM', activityType: 'Walking', id: '4' },
];

// Sample glucose data for the chart
const sampleGlucoseData = [
  { time: '00:00', value: 110 },
  { time: '02:00', value: 100 },
  { time: '04:00', value: 92 },
  { time: '06:00', value: 98 },
  { time: '08:00', value: 130 },
  { time: '10:00', value: 120 },
  { time: '12:00', value: 145 },
  { time: '14:00', value: 135 },
];

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  // State for glucose data
  const [currentGlucose, setCurrentGlucose] = useState<number | null>(120);
  const [lastReadingTime, setLastReadingTime] = useState('Today, 10:30 AM');
  const [trend, setTrend] = useState<'rising' | 'falling' | 'stable' | null>('stable');
  
  // State for prediction data
  const [hypoPrediction, setHypoPrediction] = useState({
    probability: 0.15,
    timeToEvent: 150, // in minutes
    riskLevel: 'low'
  });
  
  const [hyperPrediction, setHyperPrediction] = useState({
    probability: 0.65,
    timeToEvent: 45, // in minutes
    riskLevel: 'medium'
  });
  
  // State for timeline entries
  const [recentEntries, setRecentEntries] = useState(sampleEntries);
  
  // Handle navigation to data entry screens
  const handleLogGlucose = () => {
    router.navigate("../data-entry/glucose");
  };
  
  const handleLogInsulin = () => {
    router.navigate("../data-entry/insulin");
  };
  
  const handleLogMeal = () => {
    router.navigate("../data-entry/meal");
  };
  
  const handleLogActivity = () => {
    router.navigate("../data-entry/activity");
  };
  
  // Generate recommendation based on predictions
  const getRecommendation = () => {
    if (hypoPrediction.riskLevel === 'high' && hypoPrediction.timeToEvent < 30) {
      return "Consume 15g of carbohydrates to prevent low blood sugar.";
    }
    if (hyperPrediction.riskLevel === 'high' && hyperPrediction.timeToEvent < 30) {
      return "Consider checking your insulin. Blood sugar may rise significantly soon.";
    }
    if (hyperPrediction.riskLevel === 'medium') {
      return "Monitor your glucose over the next hour. Consider a short walk if convenient.";
    }
    return "Your glucose levels appear stable. Continue monitoring as usual.";
  };
  
  // In a real app, we would fetch data and update predictions here
  useEffect(() => {
    // This would call your prediction model service
    // For now, we'll use the sample data
    console.log('Would fetch real data and predictions here');
  }, []);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.greeting, { color: colors.text }]}>
          Good morning!
        </Text>

        {/* Glucose Status Card */}
        <Animated.View entering={FadeIn.delay(100).duration(600)}>
          <GlucoseStatusCard
            currentGlucose={currentGlucose}
            lastReadingTime={lastReadingTime}
            trend={trend}
            onLogGlucose={handleLogGlucose}
          />
        </Animated.View>
        
        {/* Predictions Card */}
        <Animated.View entering={FadeIn.delay(200).duration(600)}>
          <PredictionCard
            hypoPrediction={hypoPrediction}
            hyperPrediction={hyperPrediction}
            recommendation={getRecommendation()}
          />
        </Animated.View>
        
        {/* Quick Actions Bar */}
        <Animated.View entering={FadeIn.delay(300).duration(600)}>
          <QuickActionsBar
            onLogGlucose={handleLogGlucose}
            onLogInsulin={handleLogInsulin}
            onLogMeal={handleLogMeal}
            onLogActivity={handleLogActivity}
          />
        </Animated.View>
        
        {/* Daily Overview Chart */}
        <Animated.View entering={FadeIn.delay(400).duration(600)}>
          <DailyOverviewChart
            glucoseData={sampleGlucoseData}
            lowThreshold={70}
            highThreshold={180}
          />
        </Animated.View>
        
        {/* Recent Entries Timeline */}
        <Animated.View entering={FadeIn.delay(500).duration(600)}>
          <RecentEntriesTimeline entries={recentEntries} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});