import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text } from 'react-native';
import { emotions } from '../data/emotions';

// Basic type definitions for the props
interface Entry {
  date: string; // Assuming date is a string in ISO format
  emotion: string;
}

interface Props {
  entries: Entry[];
  currentMonth: Date;
}

const EmotionStats: React.FC<Props> = ({ entries, currentMonth }) => {
  const { t } = useTranslation();

  const getEmotionCounts = () => {
    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === currentMonth.getFullYear() &&
             entryDate.getMonth() === currentMonth.getMonth();
    });

    const counts: { [key: string]: number } = {};
    for (const emotion of emotions) {
      counts[emotion.id] = 0;
    }

    for (const entry of monthEntries) {
      if (counts[entry.emotion] !== undefined) {
        counts[entry.emotion]++;
      }
    }

    return counts;
  };

  const emotionCounts = getEmotionCounts();
  const totalEntries = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0);

  if (totalEntries === 0) {
    return null; // Don't render anything if there are no entries for the month
  }

  return (
    <View className="bg-white rounded-3xl shadow-lg p-6 mt-6">
      <Text className="text-lg font-bold text-gray-700 mb-4">{t('monthly_summary')}</Text>
      <View className="space-y-2">
        {emotions.map(emotion => {
          const count = emotionCounts[emotion.id];
          if (count === 0) return null;
          const percentage = totalEntries > 0 ? (count / totalEntries) * 100 : 0;
          return (
            <View key={emotion.id} className="flex-row items-center">
              <Text className="w-[33.33%] text-sm text-gray-600">{t(emotion.id)}</Text>
              <View className="w-[50%] bg-gray-200 rounded-full h-4">
                <View
                  className="h-4 rounded-full"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: emotion.graphColor,
                  }}
                />
              </View>
              <Text className="w-[16.66%] text-right text-gray-600">{count}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default EmotionStats;
