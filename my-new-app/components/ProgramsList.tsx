import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ProgramCard } from './ProgramCard';

interface Program {
  id: string;
  imageUrl: string;
  title: string;
}

interface ProgramsListProps {
  onProgramPress?: (programId: string) => void;
}

export const ProgramsList: React.FC<ProgramsListProps> = ({ onProgramPress }) => {
  const programs: Program[] = [
    {
      id: '1',
      imageUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/8bd3dde113ea38d34d6ba36c1c1d841e7f99a4b4?width=236',
      title: 'Mental Health Ambassador Program',
    },
    {
      id: '2',
      imageUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/a25517b2c724eafd0b475222caf30a1eb6ffb0d8?width=236',
      title: 'Youth Empowerment',
    },
    {
      id: '3',
      imageUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/4bbfffc8c5c30f4500140aa86e3ae758a0ebb93e?width=236',
      title: 'Community Empowerment',
    },
    {
      id: '4',
      imageUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/9f8e0c78c97c6c74e501a4782d5a6221cd083c83?width=236',
      title: 'BFB Research & Innovation',
    },
  ];

  return (
    <View style={styles.container}>
      {programs.map((program) => (
        <ProgramCard
          key={program.id}
          imageUrl={program.imageUrl}
          title={program.title}
          onPress={() => onProgramPress?.(program.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});
