import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity } from 'react-native';
import { emotions } from '../../src/data/emotions';

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
  setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
}

const Calendar = ({ entries, onDateSelect, selectedDate, currentMonth, setCurrentMonth }: CalendarProps) => {
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

export default Calendar;