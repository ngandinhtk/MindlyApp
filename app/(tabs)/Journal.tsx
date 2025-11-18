import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { emotions } from '../../data/emotions';
import EmotionStats from '../../components/EmotionStats';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

// Helper to get the number of days in a month
const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

// Helper to get the first day of the month
const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

// Type definitions
interface Entry {
  date: string;
  emotion: string;
  note?: string;
}

interface CalendarProps {
  entries: Entry[];
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
  currentMonth: Date;
  setCurrentMonth: (update: (date: Date) => Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ entries, onDateSelect, selectedDate, currentMonth, setCurrentMonth }) => {
  const { t } = useTranslation();

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
            {emotionObject ? (
              <Text className="text-2xl">{emotionObject.emoji}</Text>
            ) : (
              <Text>{day}</Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }
    return days;
  };

  return (
    <View className="bg-white rounded-3xl shadow-lg p-6">
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity onPress={() => changeMonth(-1)} className="p-2">
          <Text>←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)} className="p-2">
          <Text>→</Text>
        </TouchableOpacity>
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


const JournalScreen = () => {
  const { t, i18n } = useTranslation();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dailyQuote, setDailyQuote] = useState<{ text: string; author: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const savedEntries = await AsyncStorage.getItem('moodEntries');
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }
      try {
        const lang = i18n.language.split('-')[0];
        const quotesModule = lang === 'vi' 
            ? await import('../../data/quotes_vi.js') 
            : await import('../../data/quotes_en.js');
        const quotes = quotesModule.quotes;
        const today = new Date().getDate();
        const quoteIndex = today % quotes.length;
        setDailyQuote(quotes[quoteIndex]);
      } catch (error) {
        console.error("Failed to load quotes:", error);
        const quotesModule = await import('../../data/quotes_en.js');
        const quotes = quotesModule.quotes;
        const today = new Date().getDate();
        const quoteIndex = today % quotes.length;
        setDailyQuote(quotes[quoteIndex]);
      }
    };
    loadData();
  }, [i18n.language]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const getSelectedEntries = () => {
    if (!selectedDate) return [];
    return entries.filter(e => new Date(e.date).toDateString() === selectedDate.toDateString());
  };

  const selectedEntries = getSelectedEntries();

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        {dailyQuote && (
          <View className="bg-white p-6 mb-6 rounded-3xl">
            <View className="flex-row items-center gap-2 mb-4">
                <Feather name="calendar" size={24} className="text-purple-600" />
                <Text className="text-gray-700 text-xl font-bold">{t('daily_quote')}</Text>
            </View>
            <View className="flex-row items-start gap-4">
              <Feather name="message-square" size={20} className="text-purple-400 flex-shrink-0" />
              <View className="flex-1">
                <Text className="text-lg text-gray-800 font-medium mb-2">"{dailyQuote.text}"</Text>
                <Text className="text-sm text-gray-500">- {dailyQuote.author}</Text>
              </View>
            </View>
          </View>
        )}

        <Calendar
          entries={entries}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
        />

        <EmotionStats entries={entries} currentMonth={currentMonth} />

        {selectedDate && (
          <View className="bg-white mt-6 p-8 rounded-3xl shadow-lg">
            <Text className="text-lg font-medium text-gray-700 mb-4">
              {selectedDate.toLocaleDateString(i18n.language, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
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
                          <Text className="text-sm text-gray-500 ml-2">
                            {new Date(entry.date).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      </View>
                      {entry.note && (
                        <Text className="text-gray-600 italic bg-gray-50 p-3 rounded-lg">{entry.note}</Text>
                      )}
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

export default JournalScreen;