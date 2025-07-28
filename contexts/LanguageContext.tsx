import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    expenses: 'Expenses',
    goals: 'Goals',
    invest: 'Invest',
    profile: 'Profile',
    
    // Dashboard
    welcome: 'Welcome',
    monthlyOverview: 'Monthly Overview',
    totalExpenses: 'Total Expenses',
    savings: 'Savings',
    quickActions: 'Quick Actions',
    addExpense: 'Add Expense',
    viewGoals: 'View Goals',
    
    // Expenses
    addNewExpense: 'Add New Expense',
    amount: 'Amount',
    category: 'Category',
    description: 'Description',
    food: 'Food',
    transport: 'Transport',
    utilities: 'Utilities',
    entertainment: 'Entertainment',
    healthcare: 'Healthcare',
    other: 'Other',
    
    // Goals
    savingsGoals: 'Savings Goals',
    createGoal: 'Create Goal',
    goalName: 'Goal Name',
    targetAmount: 'Target Amount',
    currentAmount: 'Current Amount',
    
    // Investment
    investmentRecommendations: 'Investment Recommendations',
    disclaimer: 'Investment Disclaimer',
    disclaimerText: 'Investments are subject to market risks. Please read all scheme related documents carefully before investing.',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    rupees: '₹',
  },
  hi: {
    // Navigation
    dashboard: 'डैशबोर्ड',
    expenses: 'खर्च',
    goals: 'लक्ष्य',
    invest: 'निवेश',
    profile: 'प्रोफाइल',
    
    // Dashboard
    welcome: 'स्वागत',
    monthlyOverview: 'मासिक अवलोकन',
    totalExpenses: 'कुल खर्च',
    savings: 'बचत',
    quickActions: 'त्वरित कार्य',
    addExpense: 'खर्च जोड़ें',
    viewGoals: 'लक्ष्य देखें',
    
    // Expenses
    addNewExpense: 'नया खर्च जोड़ें',
    amount: 'राशि',
    category: 'श्रेणी',
    description: 'विवरण',
    food: 'भोजन',
    transport: 'परिवहन',
    utilities: 'उपयोगिताएं',
    entertainment: 'मनोरंजन',
    healthcare: 'स्वास्थ्य सेवा',
    other: 'अन्य',
    
    // Goals
    savingsGoals: 'बचत लक्ष्य',
    createGoal: 'लक्ष्य बनाएं',
    goalName: 'लक्ष्य का नाम',
    targetAmount: 'लक्षित राशि',
    currentAmount: 'वर्तमान राशि',
    
    // Investment
    investmentRecommendations: 'निवेश सुझाव',
    disclaimer: 'निवेश अस्वीकरण',
    disclaimerText: 'निवेश बाजार जोखिमों के अधीन हैं। निवेश से पहले सभी योजना संबंधी दस्तावेजों को ध्यान से पढ़ें।',
    
    // Common
    save: 'सेव करें',
    cancel: 'रद्द करें',
    submit: 'जमा करें',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    rupees: '₹',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};