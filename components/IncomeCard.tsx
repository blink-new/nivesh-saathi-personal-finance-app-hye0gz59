import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';

interface IncomeCardProps {
  income: {
    id: string;
    amount: number;
    source: string;
    description?: string;
    date: string;
  };
}

const sourceConfig = {
  salary: { icon: 'briefcase', color: '#2E7D32' },
  overtime: { icon: 'time', color: '#FF6F00' },
  bonus: { icon: 'gift', color: '#1976D2' },
  freelance: { icon: 'laptop', color: '#7B1FA2' },
  rental: { icon: 'home', color: '#388E3C' },
  other: { icon: 'cash', color: '#5D4037' },
};

export default function IncomeCard({ income }: IncomeCardProps) {
  const { language } = useLanguage();

  const getSourceName = (source: string) => {
    const sourceNames = {
      salary: language === 'hi' ? 'वेतन' : 'Salary',
      overtime: language === 'hi' ? 'ओवरटाइम' : 'Overtime',
      bonus: language === 'hi' ? 'बोनस' : 'Bonus',
      freelance: language === 'hi' ? 'फ्रीलांस' : 'Freelance',
      rental: language === 'hi' ? 'किराया' : 'Rental',
      other: language === 'hi' ? 'अन्य' : 'Other',
    };
    return sourceNames[source as keyof typeof sourceNames] || source;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat(language === 'hi' ? 'hi-IN' : 'en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const config = sourceConfig[income.source as keyof typeof sourceConfig] || sourceConfig.other;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
            <Ionicons name={config.icon as any} size={20} color="white" />
          </View>
          <View style={styles.info}>
            <Text style={styles.sourceName}>{getSourceName(income.source)}</Text>
            {income.description ? (
              <Text style={styles.description} numberOfLines={1}>
                {income.description}
              </Text>
            ) : null}
            <Text style={styles.date}>{formatDate(income.date)}</Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.amount}>+{formatAmount(income.amount)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
  },
});