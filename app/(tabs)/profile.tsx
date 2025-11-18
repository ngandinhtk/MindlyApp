import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, Pressable, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { emotions } from '../../data/emotions';
import { useRouter } from 'expo-router';

interface UserData {
  username: string;
  avatar: string | null;
}

interface EmotionEntry {
  date: string;
  emotion: string;
  note?: string;
}

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [emotionHistory, setEmotionHistory] = useState<EmotionEntry[]>([]);
  const [userData, setUserData] = useState<UserData>({
    username: '',
    avatar: null
  });
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const handleNoteClick = (note: string) => {
    setSelectedNote(note);
    setShowNoteModal(true);
  };

  const closeNoteModal = () => {
    setShowNoteModal(false);
    setSelectedNote(null);
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logout_confirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('logout'),
          onPress: async () => {
            await AsyncStorage.removeItem('username');
            // Navigate to the initial screen or login screen
            router.replace('/');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleClearData = () => {
    Alert.alert(
      t('clear_data'), // Assuming 'clear_data' key exists or will be added
      t('clear_data_confirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('clear'), // Assuming 'clear' key exists or will be added
          onPress: async () => {
            await AsyncStorage.removeItem('moodEntries');
            setEmotionHistory([]); // Clear history in state
            // Optionally reload data or navigate
            router.replace('/'); // Or reload the profile screen data
          },
        },
      ],
      { cancelable: true }
    );
  };

  const loadProfileData = useCallback(async () => {
    const savedEntries = await AsyncStorage.getItem('moodEntries');
    if (savedEntries) {
      const entries: EmotionEntry[] = JSON.parse(savedEntries);
      const sortedEntries = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEmotionHistory(sortedEntries);
    }

    const storedUsername = await AsyncStorage.getItem('username');
    if (storedUsername) {
      setUserData(prevUserData => ({ ...prevUserData, username: storedUsername }));
    }
  }, []);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const getEmotionColor = (emotionId: string) => {
    const emotion = emotions.find(e => e.id === emotionId);
    return emotion ? emotion.graphColor : '#E0E0E0';
  };

  const getChartData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toDateString();
    }).reverse();

    return last7Days.map(dateString => {
      const entry = emotionHistory.find(e => new Date(e.date).toDateString() === dateString);
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString(i18n.language, { weekday: 'short', month: 'numeric', day: 'numeric' }),
        emotion: entry?.emotion || 'no_data',
        note: entry?.note || ''
      };
    });
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      {/* Profile Header */}
      <View className="bg-white rounded-3xl shadow-lg p-4 mb-6">
        <View className="flex-row items-center space-x-4">
          <View className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            {userData.avatar ? (
              <Image
                source={{ uri: userData.avatar }}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Feather name="user" size={48} color="#A0AEC0" />
            )}
          </View>
          <View className="flex-1 flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-semibold text-gray-800">{userData.username || t('mindly_user')}</Text>
              <Text className="text-gray-500 text-sm">{t('your_emotion_journal')}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} className="p-2">
              <Feather name="log-out" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Emotion Chart */}
      <View className="bg-white rounded-3xl shadow-lg p-4 mb-6">
        <View className="flex-row items-center gap-2 mb-6">
          <Feather name="bar-chart-2" size={20} color="#8B5CF6" />
          <Text className="text-lg font-medium text-gray-700">{t('emotion_history_7_days')}</Text>
        </View>
        
        <View className="space-y-4">
          {getChartData().map((day, index) => (
            <View key={index} className="flex-row items-center gap-4">
              <Text className="w-16 text-sm text-gray-600">
                {day.date}
              </Text>
              <View className="flex-1">
                <View
                  className="h-8 rounded-lg justify-center"
                  style={{
                    backgroundColor: day.emotion === 'no_data'
                      ? '#F3F4F6'
                      : getEmotionColor(day.emotion),
                  }}
                >
                  {day.emotion !== 'no_data' && (
                    <Text className="text-sm text-gray-800 ml-3">{t(day.emotion)}</Text>
                  )}
                </View>
                {day.note && (
                  <TouchableOpacity onPress={() => handleNoteClick(day.note)}>
                    <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
                      {day.note}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Legend */}
        <View className="mt-6 pt-6 border-t border-gray-200">
          <View className="flex-row flex-wrap gap-4">
            {emotions.map(emotion => (
              <View key={emotion.id} className="flex-row items-center gap-1">
                <View
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getEmotionColor(emotion.id) }}
                />
                <Text className="text-sm text-gray-600">
                  {t(emotion.id)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Clear Data Button */}
      <TouchableOpacity
        onPress={handleClearData}
        className="bg-red-500 p-3 rounded-xl flex-row items-center justify-center mb-6"
      >
        <Feather name="trash-2" size={20} color="white" />
        <Text className="text-white font-medium ml-2">{t('clear_data')}</Text>
      </TouchableOpacity>

      {/* Note Popup Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showNoteModal}
        onRequestClose={closeNoteModal}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black/50"
          onPress={closeNoteModal}
        >
          <Pressable
            className="bg-white rounded-2xl shadow-2xl p-8 w-4/5 max-w-xl"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-xl font-semibold text-gray-800 mb-4">{t('note_details')}</Text>
            <ScrollView className="max-h-60 mb-6">
              <Text className="text-gray-600 whitespace-pre-wrap">{selectedNote}</Text>
            </ScrollView>
            <TouchableOpacity
              onPress={closeNoteModal}
              className="w-full bg-purple-600 py-3 rounded-lg items-center"
            >
              <Text className="text-white font-bold">{t('close')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Author Information */}
      <View className="mt-6 text-center text-gray-400 text-sm">
        <Text className="text-gray-400 text-sm">{t('developed_by')}</Text>
      </View>
    </ScrollView>
  );
}
