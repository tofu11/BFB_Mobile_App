import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const BridgesText: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.text}>Bridges From Borders</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 130,
    position: 'absolute',
    left: 52,
    top: -31, // Moved up from 12
  },
  textContainer: {
    width: 48,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#9E005D',
    fontSize: 10,
    lineHeight: 9,
    fontFamily: 'Poppins',
    fontWeight: '400',
    textAlign: 'center',
  },
});
