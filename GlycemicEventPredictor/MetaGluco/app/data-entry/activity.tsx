// app/data-entry/activity.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TextInput, Button, Chip, RadioButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

export default function ActivityEntryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const [activityType, setActivityType] = useState('');
  const [duration, setDuration] = useState('30');
  const [intensity, setIntensity] = useState('moderate');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  
  const activityTypes = [
    { name: 'Walking', icon: 'walk' },
    { name: 'Running', icon: 'run' },
    { name: 'Cycling', icon: 'bike' },
    { name: 'Swimming', icon: 'swim' },
    { name: 'Gym', icon: 'weight-lifter' },
    { name: 'Yoga', icon: 'yoga' },
    { name: 'Other', icon: 'dumbbell' }
  ];
  
  const handleSave = () => {
    console.log('Saving activity entry:', {
      type: activityType,
      duration: parseInt(duration),
      intensity,
      date,
      notes
    });
    // Would save to storage here
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Log Activity</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Activity Type */}
        <View style={styles.card}>
          <Text style={[styles.label, { color: colors.text }]}>Activity Type</Text>
          <View style={styles.activityTypeContainer}>
            {activityTypes.map((activity) => (
              <Chip
                key={activity.name}
                mode="outlined"
                selected={activityType === activity.name}
                onPress={() => setActivityType(activity.name)}
                style={styles.activityChip}
                selectedColor={Colors.common.activity}
                icon={activity.icon}
              >
                {activity.name}
              </Chip>
            ))}
          </View>
        </View>
        
        {/* Duration */}
        <View style={styles.card}>
          <Text style={[styles.label, { color: colors.text }]}>Duration (minutes)</Text>
          <TextInput
            style={styles.durationInput}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            mode="outlined"
            placeholder="Enter duration in minutes"
            outlineStyle={{ borderRadius: 12 }}
          />
          
          {/* Duration slider */}
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={5}
              maximumValue={180}
              step={5}
              minimumTrackTintColor={Colors.common.activity}
              maximumTrackTintColor="#e0e0e0"
              thumbTintColor={Colors.common.activity}
              value={parseInt(duration) || 30}
              onValueChange={(value) => setDuration(value.toString())}
            />
            <View style={styles.durationMarksContainer}>
              <Text style={styles.durationMark}>5m</Text>
              <Text style={styles.durationMark}>30m</Text>
              <Text style={styles.durationMark}>60m</Text>
              <Text style={styles.durationMark}>120m</Text>
              <Text style={styles.durationMark}>180m</Text>
            </View>
          </View>
          
          {/* Quick duration buttons */}
          <View style={styles.quickDurationContainer}>
            {[15, 30, 45, 60, 90].map((value) => (
              <Chip
                key={value}
                mode="outlined"
                selected={parseInt(duration) === value}
                onPress={() => setDuration(value.toString())}
                style={styles.durationChip}
                selectedColor={Colors.common.activity}
              >
                {value} min
              </Chip>
            ))}
          </View>
        </View>
        
        {/* Intensity */}
        <View style={styles.card}>
          <Text style={[styles.label, { color: colors.text }]}>Intensity</Text>
          <RadioButton.Group onValueChange={value => setIntensity(value)} value={intensity}>
            <View style={styles.intensityOption}>
              <RadioButton value="light" color={Colors.common.activity} />
              <Text style={styles.intensityText}>Light - Easy, can talk or sing</Text>
            </View>
            <View style={styles.intensityOption}>
              <RadioButton value="moderate" color={Colors.common.activity} />
              <Text style={styles.intensityText}>Moderate - Breathing harder but can talk</Text>
            </View>
            <View style={styles.intensityOption}>
              <RadioButton value="vigorous" color={Colors.common.activity} />
              <Text style={styles.intensityText}>Vigorous - Breathing hard, difficult to talk</Text>
            </View>
          </RadioButton.Group>
        </View>
        
        {/* Date and Time Selector */}
        <View style={styles.card}>
          <Text style={[styles.label, { color: colors.text }]}>When did you exercise?</Text>
          <TouchableOpacity 
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={24} color={colors.tint} />
            <Text style={[styles.dateText, { color: colors.text }]}>
              {date.toLocaleString()}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}
        </View>
        
        {/* Notes */}
        <View style={styles.card}>
          <Text style={[styles.label, { color: colors.text }]}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={3}
            placeholder="Add any additional notes about your activity"
            outlineStyle={{ borderRadius: 12 }}
          />
        </View>
        
        {/* Save Button */}
        <Button
          mode="contained"
          style={styles.saveButton}
          contentStyle={{ paddingVertical: 8 }}
          onPress={handleSave}
          buttonColor={Colors.common.activity}
        >
          Save Activity Record
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  activityTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  activityChip: {
    margin: 4,
  },
  durationInput: {
    fontSize: 18,
  },
  sliderContainer: {
    marginVertical: 16,
  },
  slider: {
    height: 40,
  },
  durationMarksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  durationMark: {
    fontSize: 12,
    color: '#888',
  },
  quickDurationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  durationChip: {
    margin: 4,
  },
  intensityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  intensityText: {
    marginLeft: 8,
    fontSize: 16,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 16,
  },
  notesInput: {
    backgroundColor: 'transparent',
  },
  saveButton: {
    marginVertical: 24,
    borderRadius: 12,
  },
});