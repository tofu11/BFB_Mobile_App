import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProgramCardProps {
  imageUrl: string;
  title: string;
  description?: string;
  onPress?: () => void;
  style?: any;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
  imageUrl,
  title,
  description,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>More Info</Text>
          </View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 30,
  },
  image: {
    width: 118,
    height: 118,
    borderRadius: 8,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  titleContainer: {
    width: 167,
    marginBottom: 16,
  },
  title: {
    color: '#000',
    textAlign: 'center',
    fontSize: 10,
    fontFamily: 'Poppins',
    fontWeight: '700',
  },
  buttonContainer: {
    width: 100,
    height: 30,
  },
  button: {
    width: 100,
    height: 30,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FB8500',
  },
  buttonText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 13,
    fontFamily: 'Poppins',
    fontWeight: '400',
  },
});
