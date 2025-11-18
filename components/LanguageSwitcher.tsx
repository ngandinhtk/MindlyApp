import React from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, Text } from 'react-native';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  return (
    <TouchableOpacity
      onPress={toggleLanguage}
      className="p-2 border border-gray-400 rounded-md w-10 h-10 flex items-center justify-center bg-gray-200"
    >
      <Text className="text-xs font-bold uppercase text-gray-700">
        {i18n.language === 'en' ? 'EN' : 'VI'}
      </Text>
    </TouchableOpacity>
  );
};

export default LanguageSwitcher;
