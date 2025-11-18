import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { emotions } from '../../data/emotions';
import EmotionStats from '../../components/EmotionStats';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

// Type definitions
interface Entry {
  date: string;
  emotion: string;
  note?: string;
}

// Calendar Component (remains the same)
const Calendar = ({ entries, onDateSelect, selectedDate, currentMonth, setCurrentMonth }) => {
    const { t } = useTranslation();

    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const getEmotionForDate = (date: Date) => {
        const entry = entries.find(e => new Date(e.date).toDateString() === date.toDateString());
        return entry?.emotion || null;
    };

    const changeMonth = (delta: number) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + delta);
            return newDate;
        });
    };

    const renderCalendar = () => {
        const days = [];
        const totalDays = daysInMonth(currentMonth);
        const firstDay = firstDayOfMonth(currentMonth);

        for (let i = 0; i < firstDay; i++) {
            days.push(<View key={`empty-${i}`} className="w-[14.28%] h-12" />);
        }

        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const emotionId = getEmotionForDate(date);
            const emotionObject = emotions.find(e => e.id === emotionId);
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();

            days.push(
                <TouchableOpacity
                    key={day}
                    onPress={() => onDateSelect(date)}
                    className={`w-[14.28%] h-12 items-center justify-center ${isSelected ? 'border-2 border-purple-500 rounded-full' : ''}`}
                >
                    <View
                        className={`w-8 h-8 rounded-full items-center justify-center ${isToday ? 'border-2 border-purple-500' : ''}`}
                        style={{ backgroundColor: emotionObject ? emotionObject.graphColor : 'transparent' }}
                    >
                        {emotionObject ? <Text className="text-2xl">{emotionObject.emoji}</Text> : <Text>{day}</Text>}
                    </View>
                </TouchableOpacity>
            );
        }
        return days;
    };

    return (
        <View className="bg-white rounded-3xl shadow-lg p-6">
            <View className="flex-row justify-between items-center mb-6">
                <TouchableOpacity onPress={() => changeMonth(-1)} className="p-2"><Text>←</Text></TouchableOpacity>
                <Text className="text-lg font-bold">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
                <TouchableOpacity onPress={() => changeMonth(1)} className="p-2"><Text>→</Text></TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap">
                {[t('sun'), t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat')].map(day => (
                    <View key={day} className="w-[14.28%] h-10 items-center justify-center">
                        <Text className="text-sm font-medium text-gray-800">{day}</Text>
                    </View>
                ))}
                {renderCalendar()}
            </View>
        </View>
    );
};

const HomeScreen = () => {
  const { t, i18n } = useTranslation();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dailyQuote, setDailyQuote] = useState<{ text: string; author: string } | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  
  // State from Dashboard
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [activities, setActivities] = useState<any>({});

  const loadData = useCallback(async () => {
    const savedEntries = await AsyncStorage.getItem('moodEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
    const storedUsername = await AsyncStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    try {
      const lang = i18n.language.split('-')[0];
      const quotesModule = lang === 'vi' ? await import('../../data/quotes_vi.js') : await import('../../data/quotes_en.js');
      const activitiesModule = lang === 'vi' ? await import('../../data/activities_vi.js') : await import('../../data/activities_en.js');
      setActivities(activitiesModule.activities);
      const quotes = quotesModule.quotes;
      const today = new Date().getDate();
      const quoteIndex = today % quotes.length;
      setDailyQuote(quotes[quoteIndex]);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  }, [i18n.language]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const todayEntries = entries.filter(e => new Date(e.date).toDateString() === new Date().toDateString());

  const handleSaveEntry = async () => {
    if (!selectedEmotion) {
        Alert.alert('No Emotion Selected', 'Please select an emotion before saving.');
        return;
    }
    if (todayEntries.length >= 2) {
      Alert.alert("Limit Reached", "You have already checked in twice today.");
      return;
    }

    const newEntry: Entry = {
      date: new Date().toISOString(),
      emotion: selectedEmotion,
      note: note.trim()
    };

    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    await AsyncStorage.setItem('moodEntries', JSON.stringify(updatedEntries));
    
    setSelectedEmotion(null);
    setNote('');
  };

  const getRandomActivity = (emotion: string) => {
    if (!emotion || !activities[emotion]) return null;
    const emotionActivities = activities[emotion];
    return emotionActivities[Math.floor(Math.random() * emotionActivities.length)];
  };

  const getSelectedEntries = () => {
    if (!selectedDate) return [];
    return entries.filter(e => new Date(e.date).toDateString() === selectedDate.toDateString());
  };

  const selectedEntries = getSelectedEntries();

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        {/* Greeting */}
        <View className="px-4 pt-4 mb-6">
            <Text className="text-2xl font-bold text-gray-800 mb-1">{t('greeting')}<Text className='italic font-light'>{username || t('mindly_user')}</Text></Text>
            <Text className="text-gray-500 flex items-center">
                <Feather name="calendar" className="w-4 h-4 mr-2" />
                {new Date().toLocaleDateString(i18n.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
        </View>

        {/* Mood Selection */}
        {todayEntries.length < 2 ? (
            <View className="px-6 mb-6">
                <Text className="text-lg font-medium text-gray-700 mb-4">{t('how_are_you_today')}</Text>
                <View className="flex-row flex-wrap justify-center gap-3 mb-6">
                    {emotions.map((mood) => (
                        <TouchableOpacity
                            key={mood.id}
                            onPress={() => setSelectedEmotion(mood.id)}
                            className={`p-3 items-center rounded-xl transition-all transform w-[30%] ${selectedEmotion === mood.id ? 'ring-2 ring-purple-500 scale-105' : ''}`}
                            style={{backgroundColor: mood.graphColor}}
                        >
                            <Text className="text-3xl mb-1">{mood.emoji}</Text>
                            <Text className="text-xs font-medium text-gray-800">{t(mood.label)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {selectedEmotion && (
                    <View className="space-y-3">
                        <TextInput
                            value={note}
                            onChangeText={setNote}
                            placeholder={t('note_placeholder')}
                            className="shadow-lg w-full h-32 px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-purple-300 focus:bg-white"
                            multiline={true}
                            numberOfLines={4}
                        />
                        <TouchableOpacity onPress={handleSaveEntry} className="w-full px-8 py-3 bg-purple-500 rounded-xl flex-row items-center justify-center space-x-2">
                            <Feather name="plus" size={20} color="white" />
                            <Text className="text-white font-medium">{t('save')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        ) : (
            <View className="bg-white rounded-3xl shadow-lg p-6 mb-6">
                <Text className="text-lg font-bold text-gray-800 mb-4">{t('your_day')}</Text>
                {todayEntries.map((todayEntry, index) => (
                    <View key={index} className="mb-4">
                        <View className="flex-row items-center space-x-4 mb-4">
                            <Text className="text-2xl">{emotions.find(e => e.id === todayEntry.emotion)?.emoji}</Text>
                            <Text className="text-gray-600">{t(emotions.find(e => e.id === todayEntry.emotion)?.label || '')}</Text>
                            <Text className="text-xs text-gray-500">{new Date(todayEntry.date).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>
                        {todayEntry.note && <Text className="text-gray-600 italic">{todayEntry.note}</Text>}
                        <View className="mt-4 p-4 bg-purple-50 rounded-xl">
                            <Text className="text-sm font-medium text-purple-800 mb-2">{t('suggestion_for_you')}</Text>
                            <Text className="text-purple-900">{getRandomActivity(todayEntry.emotion)}</Text>
                        </View>
                    </View>
                ))}
            </View>
        )}

        {dailyQuote && (
          <View className="bg-white p-6 mb-6 rounded-3xl">
            <View className="flex-row items-center gap-2 mb-4">
                <Feather name="message-square" size={24} className="text-purple-600" />
                <Text className="text-gray-700 text-xl font-bold">{t('daily_quote')}</Text>
            </View>
            <View className="flex-row items-start gap-4">
              <View className="flex-1">
                <Text className="text-lg text-gray-800 font-medium mb-2">"{dailyQuote.text}"</Text>
                <Text className="text-sm text-gray-500">- {dailyQuote.author}</Text>
              </View>
            </View>
          </View>
        )}

        <Calendar entries={entries} onDateSelect={setSelectedDate} selectedDate={selectedDate} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
        <EmotionStats entries={entries} currentMonth={currentMonth} />

        {selectedDate && (
          <View className="bg-white mt-6 p-8 rounded-3xl shadow-lg">
            <Text className="text-lg font-medium text-gray-700 mb-4">{selectedDate.toLocaleDateString(i18n.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
            {selectedEntries.length > 0 ? (
              <View className="space-y-4">
                {selectedEntries.map((entry, index) => {
                  const emotion = emotions.find(e => e.id === entry.emotion);
                  return (
                    <View key={index} className="border-b border-gray-200 pb-4">
                      <View className="flex-row items-center gap-3 mb-2">
                        <Text className="text-3xl">{emotion?.emoji}</Text>
                        <View>
                          <Text className="font-bold text-gray-800">{t(emotion?.label || '')}</Text>
                          <Text className="text-sm text-gray-500 ml-2">{new Date(entry.date).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>
                      </View>
                      {entry.note && <Text className="text-gray-600 italic bg-gray-50 p-3 rounded-lg">{entry.note}</Text>}
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text className="text-gray-500">{t('no_entry')}</Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;