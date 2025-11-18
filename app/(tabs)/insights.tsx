import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { emotions } from '../../data/emotions';
import WeeklySummary from '../../components/WeeklySummary';

interface EmotionStat {
  id: string;
  count: number;
  percentage: number;
  label: string;
  emoji: string;
  color: string; // This will be a Tailwind class string
}

export default function InsightsScreen() {
  const { t } = useTranslation();
  const [emotionStats, setEmotionStats] = useState<EmotionStat[]>([]);
  const insightRef = useRef(null); // For future PDF export or view snapshotting

  useEffect(() => {
    const loadMoodEntries = async () => {
      const savedEntries = await AsyncStorage.getItem('moodEntries');
      if (savedEntries) {
        const parsedEntries = JSON.parse(savedEntries);
        calculateStats(parsedEntries);
      }
    };
    loadMoodEntries();
  }, []);

  const calculateStats = (entries: any[]) => {
    if (!entries || entries.length === 0) {
      setEmotionStats([]);
      return;
    }

    const emotionCounts = entries.reduce((acc: { [key: string]: number }, entry: any) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    }, {});

    const totalEntries = entries.length;
    const stats: EmotionStat[] = Object.entries(emotionCounts)
      .map(([emotionId, count]) => {
        const emotionDetails = emotions.find(e => e.id === emotionId);
        return {
          id: emotionId,
          count: count as number,
          percentage: Math.round(((count as number) / totalEntries) * 100),
          label: emotionDetails?.label || 'Unknown',
          emoji: emotionDetails?.emoji || '❓',
          color: emotionDetails?.color || 'bg-gray-200', // Assuming color is a Tailwind class
        };
      })
      .sort((a, b) => b.count - a.count);

    setEmotionStats(stats);
  };

  const getOverallTrend = () => {
    if (emotionStats.length === 0) {
      return t('no_data_trend');
    }
    const topEmotion = emotionStats[0];
    
    if (['happy', 'excited', 'grateful', 'amazing', 'satisfied'].includes(topEmotion.id)) {
      return t('positive_trend');
    }
    if (['sad', 'angry', 'anxious', 'worried'].includes(topEmotion.id)) {
      return t('negative_trend');
    }
    return t('netive_trend'); // Typo from original, keeping for now
  };

  // TODO: Implement PDF export functionality for React Native
  const handleExportPDF = () => {
    console.log('PDF export not yet implemented for React Native.');
    // This will involve using libraries like 'expo-print' and 'expo-sharing'
    // along with a view snapshotting library like 'react-native-view-shot'.
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6" ref={insightRef}>
        <Text className="text-2xl font-bold text-gray-800 mb-6">{t('emotion_stats')}</Text>              
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {emotionStats.length > 0 ? (
            emotionStats.map(stat => (
              <View key={stat.id} className={`${stat.color} items-center justify-center p-6 rounded-xl w-[48%]`} style={{ aspectRatio: 1 }}>
                <Text className="text-4xl mb-2">{stat.emoji}</Text>
                <Text className="text-2xl font-bold text-gray-800">{stat.percentage}%</Text>
                <Text className="text-sm text-gray-600">{stat.count} {t('day')} {t(stat.label)}</Text>
              </View>
            ))
          ) : (
            <View className="w-full items-center py-8">
              <Text className="text-gray-600">{t('no_data_to_display')}</Text>
              <Text className="text-sm text-gray-400">{t('start_logging_emotions')}</Text>
            </View>
          )}
        </View>
        
        <View className="mt-6">
          <Text className="text-gray-600">{getOverallTrend()}</Text>
        </View>
        
        <View className="items-center mt-6">
          <TouchableOpacity
            onPress={handleExportPDF}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md"
          >
            <Text className="text-white font-bold">{t('export_pdf')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <WeeklySummary />
    </ScrollView>
  );
}
