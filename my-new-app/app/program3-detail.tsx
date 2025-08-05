import { Header } from '@/components/Header';
import { StatusBarComponent } from '@/components/StatusBarComponent';
import { ThemedView } from '@/components/ThemedView';
import { auth } from '@/lib/firebase';
import { router } from 'expo-router';
import { User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface ProgramData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

const programsData: ProgramData[] = [
  {
    id: '1',
    title: 'Community Leadership',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
    imageUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b560aa2a706ac01ccfd8c2de723c2dee4b4bbba8?width=324'
  },
  {
    id: '2',
    title: 'Social Development',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
    imageUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/061a02ea488ed9a335e6628cb8298678b7bafade?width=324'
  },
  {
    id: '3',
    title: 'Community Outreach',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
    imageUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/86c2524410bd79706cb70addb26f9ad613e938d9?width=324'
  }
];

export default function Program3DetailScreen() {
  const [familyModalVisible, setFamilyModalVisible] = useState(false);
  const [volunteerModalVisible, setVolunteerModalVisible] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ProgramData | null>(null);
  const [user, setUser] = useState<User | null>(auth.currentUser);

  // Family form states
  const [familyName, setFamilyName] = useState('');
  const [familyMembers, setFamilyMembers] = useState('');
  const [familyEmail, setFamilyEmail] = useState('');

  // Volunteer form states
  const [volunteerName, setVolunteerName] = useState('');
  const [volunteerEmail, setVolunteerEmail] = useState('');
  const [volunteerGender, setVolunteerGender] = useState('');
  const [volunteerLeaves, setVolunteerLeaves] = useState('');

  // Event date and time
  const eventDate = '8/20/2025';
  const eventTime = '2:15pm';

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleSwipeLeft = (programId: string, title: string) => {
    Alert.alert('Swiped Left', `You swiped left on ${title}`);
  };

  const handleSwipeRight = (programId: string, title: string) => {
    Alert.alert('Swiped Right', `You swiped right on ${title}`);
  };

  const handleFamilyParticipant = (program: ProgramData) => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please sign in to join as a Family Participant',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(tabs)/login') }
        ]
      );
      return;
    }
    setSelectedProgram(program);
    setFamilyModalVisible(true);
  };

  const handleStudentVolunteer = (program: ProgramData) => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please sign in to join as a Student Volunteer',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(tabs)/login') }
        ]
      );
      return;
    }
    setSelectedProgram(program);
    setVolunteerModalVisible(true);
  };

  const submitFamilyForm = () => {
    if (!familyName || !familyMembers || !familyEmail) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    Alert.alert('Success', `Family registration submitted for ${selectedProgram?.title}`);
    setFamilyModalVisible(false);
    setFamilyName('');
    setFamilyMembers('');
    setFamilyEmail('');
  };

  const submitVolunteerForm = () => {
    if (!volunteerName || !volunteerEmail || !volunteerGender || !volunteerLeaves) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    Alert.alert('Success', `Volunteer registration submitted for ${selectedProgram?.title}`);
    setVolunteerModalVisible(false);
    setVolunteerName('');
    setVolunteerEmail('');
    setVolunteerGender('');
    setVolunteerLeaves('');
  };

  const SwipeableCard = ({ program, index }: { program: ProgramData, index: number }) => {
    const translateX = useSharedValue(0);

    const gestureHandler = useAnimatedGestureHandler({
      onStart: (_, context) => {
        context.startX = translateX.value;
      },
      onActive: (event, context) => {
        translateX.value = context.startX + event.translationX;
      },
      onEnd: (event) => {
        const shouldSwipeLeft = event.translationX < -100;
        const shouldSwipeRight = event.translationX > 100;

        if (shouldSwipeLeft) {
          runOnJS(handleSwipeLeft)(program.id, program.title);
        } else if (shouldSwipeRight) {
          runOnJS(handleSwipeRight)(program.id, program.title);
        }

        translateX.value = withSpring(0);
      },
    });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: translateX.value }],
      };
    });

    return (
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.programCard, animatedStyle]}>
          <Image source={{ uri: program.imageUrl }} style={styles.image} />
          <Text style={styles.title}>{program.title}</Text>
          <Text style={styles.description}>{program.description}</Text>
          <View style={styles.eventInfo}>
            <Text style={styles.eventDate}>Event Date: {eventDate}</Text>
            <Text style={styles.eventTime}>Time: {eventTime}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => handleFamilyParticipant(program)}>
              <Text style={styles.buttonText}>Family Participant</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => handleStudentVolunteer(program)}>
              <Text style={styles.buttonText}>Student Volunteer</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  const renderItem = ({ item, index }: { item: ProgramData, index: number }) => (
    <SwipeableCard program={item} index={index} />
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerBackground} />
      <ThemedView style={styles.blueBackground} />
      <StatusBarComponent />
      <Header title="Community Empowerment" />
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <FlatList
        data={programsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.flatList}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />

      {/* Family Participant Modal */}
      <Modal visible={familyModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Family Participant Registration</Text>
              <Text style={styles.modalSubtitle}>{selectedProgram?.title}</Text>
              
              <Text style={styles.label}>Name:</Text>
              <TextInput
                style={styles.input}
                value={familyName}
                onChangeText={setFamilyName}
                placeholder="Enter your name"
              />
              
              <Text style={styles.label}>How many family members:</Text>
              <TextInput
                style={styles.input}
                value={familyMembers}
                onChangeText={setFamilyMembers}
                placeholder="Number of family members"
                keyboardType="numeric"
              />
              
              <Text style={styles.label}>Email:</Text>
              <TextInput
                style={styles.input}
                value={familyEmail}
                onChangeText={setFamilyEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.submitButton} onPress={submitFamilyForm}>
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setFamilyModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Student Volunteer Modal */}
      <Modal visible={volunteerModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Student Volunteer Registration</Text>
              <Text style={styles.modalSubtitle}>{selectedProgram?.title}</Text>
              
              <Text style={styles.volunteerInfo}>
                As a volunteer, you will help organize events, assist participants, and support community activities. This is a great opportunity to gain experience and make a positive impact!
              </Text>
              
              <Text style={styles.label}>Name:</Text>
              <TextInput
                style={styles.input}
                value={volunteerName}
                onChangeText={setVolunteerName}
                placeholder="Enter your name"
              />
              
              <Text style={styles.label}>Email:</Text>
              <TextInput
                style={styles.input}
                value={volunteerEmail}
                onChangeText={setVolunteerEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
              
              <Text style={styles.label}>Gender:</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity 
                  style={[styles.genderButton, volunteerGender === 'Woman' && styles.genderButtonSelected]}
                  onPress={() => setVolunteerGender('Woman')}
                >
                  <Text style={[styles.genderButtonText, volunteerGender === 'Woman' && styles.genderButtonTextSelected]}>Woman</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.genderButton, volunteerGender === 'Man' && styles.genderButtonSelected]}
                  onPress={() => setVolunteerGender('Man')}
                >
                  <Text style={[styles.genderButtonText, volunteerGender === 'Man' && styles.genderButtonTextSelected]}>Man</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.label}>How many days can you volunteer:</Text>
              <TextInput
                style={styles.input}
                value={volunteerLeaves}
                onChangeText={setVolunteerLeaves}
                placeholder="Number of days available"
                keyboardType="numeric"
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.submitButton} onPress={submitVolunteerForm}>
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setVolunteerModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackground: {
    width: '100%',
    height: 103,
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: '#88C8E4',
  },
  blueBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 103,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 120,
    left: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  flatList: {
    flex: 1,
    marginTop: 25,
  },
  content: {
    paddingBottom: 100,
    paddingTop: 5,
  },
  programCard: {
    marginHorizontal: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 16,
  },
  eventInfo: {
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FB8500',
  },
  eventDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#FB8500',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#000',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  volunteerInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#FB8500',
    borderColor: '#FB8500',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#666',
  },
  genderButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#FB8500',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#DDD',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});