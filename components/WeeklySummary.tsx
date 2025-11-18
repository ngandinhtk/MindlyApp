import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { emotions } from '../data/emotions';

interface WeeklyStat {
  id: string;
  count: number;
  percentage: number;
  label: string;
  emoji: string;
  graphColor: string;
}

const WeeklySummary: React.FC = () => {
  const { t } = useTranslation();
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [weekRange, setWeekRange] = useState('');

  useEffect(() => {
    const calculateWeeklyStats = async () => {
      const savedEntries = await AsyncStorage.getItem('moodEntries');
      const entries = savedEntries ? JSON.parse(savedEntries) : [];

      if (!entries || entries.length === 0) {
        return;
      }

      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      
      startOfWeek.setHours(0, 0, 0, 0);
      endOfWeek.setHours(23, 59, 59, 999);

      setWeekRange(`${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`);

      const weeklyEntries = entries.filter((entry: any) => {
        const entryDate = new Date(entry.date);
        return entryDate >= startOfWeek && entryDate <= endOfWeek;
      });

      if (weeklyEntries.length === 0) {
        setWeeklyStats([]);
        return;
      }

      const emotionCounts = weeklyEntries.reduce((acc: any, entry: any) => {
        acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
        return acc;
      }, {});

      const totalEntries = weeklyEntries.length;
      const stats: WeeklyStat[] = Object.entries(emotionCounts)
        .map(([emotionId, count]) => {
          const emotionDetails = emotions.find(e => e.id === emotionId);
          return {
            id: emotionId,
            count: count as number,
            percentage: Math.round(((count as number) / totalEntries) * 100),
            label: emotionDetails?.label || 'Unknown',
            emoji: emotionDetails?.emoji || '❓',
            graphColor: emotionDetails?.graphColor || '#CCCCCC',
          };
        })
        .sort((a, b) => b.count - a.count);

      setWeeklyStats(stats);
    };

    calculateWeeklyStats();
  }, []);

  const getWeeklyTrend = () => {
    if (weeklyStats.length === 0) {
      return t('no_data_for_week');
    }
    const topEmotion = weeklyStats[0];

    if (['happy', 'excited', 'grateful', 'amazing', 'satisfied'].includes(topEmotion.id)) {
      return t('positive_week_trend');
    }
    if (['sad', 'angry', 'anxious', 'worried'].includes(topEmotion.id)) {
      return t('negative_week_trend');
    }
    return t('mixed_week_trend');
  };

  return (
    <View className="p-6 mb-6 border-t border-gray-200">
      <Text className="text-xl font-bold text-gray-800 mb-4">{t('weekly_summary')}</Text>
      <Text className="text-sm text-gray-500 mb-4">{weekRange}</Text>
      
      {weeklyStats.length > 0 ? (
        <View>
          <View className="flex-row flex-wrap justify-center gap-4">
            {weeklyStats.map(stat => (
              <View key={stat.id} className="p-4 rounded-lg items-center w-[45%]" style={{ backgroundColor: stat.graphColor }}>
                <Text className="text-3xl">{stat.emoji}</Text>
                <Text className="font-bold text-lg text-white">{stat.percentage}%</Text>
                <Text className="text-sm text-white">{stat.count} {t('day')} {t(stat.label)}</Text>
              </View>
            ))}
          </View>
          <View className="pt-4 mt-4">
            <Text className="font-semibold text-gray-700 mb-2">{t('weekly_trend')}</Text>
            <Text className="text-gray-600">{getWeeklyTrend()}</Text>
          </View>
        </View>
      ) : (
        <View className="items-center py-4">
          <Text className="text-gray-600">{t('no_data_for_week')}</Text>
          <Text className="text-sm text-gray-400">{t('add_entries_for_summary')}</Text>
        </View>
      )}
    </View>
  );
};

export default WeeklySummary;
