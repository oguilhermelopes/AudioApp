import { Button, Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'
import { styles } from './styles';
import { useEffect, useState } from 'react';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { Alert } from 'react-native';

export default function App() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingFileURI, setRecordingFileURI] = useState<string | null>(null);

  async function handleRecordingStart() {
    const { granted } = await Audio.getPermissionsAsync();
    
    if (granted) {
      try {
        const { recording } = await Audio.Recording.createAsync();
        setRecording(recording)
      } catch (error) {
        console.log(error)
        Alert.alert('Error ao Gravar', 'Não foi possivel iniciar a gravação do áudio !!!')
      }
    }
  }

  async function handleRecordingStop() {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const fileURI = recording.getURI();
        setRecordingFileURI(fileURI);
        setRecording(null);
      }
    } catch (error) {
      console.log(error)
      Alert.alert('Error ao Pausar', 'Não foi possivel pausar a gravação do áudio !!!')
    }
  }

  async function handleAudioPlay() {
    if (recordingFileURI) {
      const { sound } = await Audio.Sound.createAsync({ uri: recordingFileURI }, { shouldPlay: true });
      await sound.setPositionAsync(0);
      await sound.playAsync();
    }
  }

  useEffect(() => {
    Audio
      .requestPermissionsAsync()
      .then(({ granted }) => {
        if (granted) {
          Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix, 
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
            playThroughEarpieceAndroid: true,
          })
        }
      })

  }, []);

  return (
    <View style={styles.container}>
      <Pressable 
        style={[styles.button, recording && styles.recording]}
        onPressIn={handleRecordingStart}
        onPressOut={handleRecordingStop}
        >
        <MaterialIcons 
          name="mic"
          size={44}
          color="#212121"
        />
      </Pressable>

      {
        recording &&
        <Text style={styles.label}>
          Gravando ...
        </Text>
      }

      {
        recordingFileURI &&
        <Button 
          title='Ouvir Áudio'
          onPress={handleAudioPlay}
        />
      }
    </View>
  );
};