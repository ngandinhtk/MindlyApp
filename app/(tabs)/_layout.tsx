import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import Colors from '../../src/constants/Colors';
import { useColorScheme } from '../../src/components/useColorScheme';
import { useClientOnlyValue } from '../../src/components/useClientOnlyValue';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Feather>['name'];
  color: string;
}) {
  return <Feather size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('Dashboard'),
          tabBarIcon: ({ color }) => <TabBarIcon name="book-open" color={color} />,
          
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: t('Journal'),
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: t('insights'),
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart-2" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
