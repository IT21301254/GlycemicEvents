// app/data-entry/insulin.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TextInput, Button, RadioButton, SegmentedButtons } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

export default function InsulinEntryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const [insulinType, setInsulinType] = useState('bolus');
  const [insulinDose, setInsulinDose] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  
  const handleSave = () => {
    console.log('Saving insulin entry:', {
      type: insulinType,
      dose: insulinDose,
      date: date,
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Log Insulin</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Insulin Type Selector */}
        <View style={styles.card}>
          <Text style={[styles.label, { color: colors.text }]}>Insulin Type</Text>
          <SegmentedButtons
            value={insulinType}
            onValueChange={setInsulinType}
            buttons={[
              { value: 'bolus', label: 'Bolus', icon: 'clock' },
              { value: 'basal', label: 'Basal', icon: 'repeat' },
            ]}
            style={styles.segmentedButtons}
          />
          
          {insulinType === 'bolus' && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={Colors.common.info} />
              <Text style={styles.infoText}>
                Bolus insulin is taken with meals or for corrections
              </Text>
            </View>
          )}
          
          {insulinType === 'basal' && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={Colors.common.info} />
              <Text style={styles.infoText}>
                Basal insulin provides background insulin throughout the day
              </Text>
            </View>
          )}
        </View>
        
        {/* Insulin Dose */}
        <View style={styles.card}>
          <Text style={[styles.label, { color: colors.text }]}>Insulin Dose (units)</Text>
          <TextInput
            style={styles.doseInput}
            value={insulinDose}
            onChangeText={setInsulinDose}
            keyboardType="numeric"
            mode="outlined"
            placeholder="Enter insulin units"
            outlineStyle={{ borderRadius: 12 }}
          />
        </View>
        
        {/* Date and Time Selector */}
        <View style={styles.card}>
          <Text style={[styles.label, { color: colors.text }]}>When was insulin taken?</Text>
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
            numberOfLines={4}
            placeholder="Add any additional notes"
            outlineStyle={{ borderRadius: 12 }}
          />
        </View>
        
        {/* Save Button */}
        <Button
          mode="contained"
          style={styles.saveButton}
          contentStyle={{ paddingVertical: 8 }}
          onPress={handleSave}
          buttonColor={Colors.common.insulin}
        >
          Save Insulin Record
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
  segmentedButtons: {
    marginBottom: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(49, 130, 206, 0.1)',
    borderRadius: 8,
    marginTop: 12,
  },
  infoText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  doseInput: {
    fontSize: 18,
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