import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Program2DetailViewProps {
  onBack: () => void;
}

export const Program2DetailView: React.FC<Program2DetailViewProps> = ({ onBack }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>BFB #OneWorld Choir Details</Text>
      {/* Add your program 2 specific content here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});