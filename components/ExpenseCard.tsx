import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ExpenseCardProps {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  onPress?: () => void;
}

const categoryIcons: { [key: string]: keyof typeof MaterialIcons.glyphMap } = {
  food: 'restaurant',
  transport: 'directions-bus',
  utilities: 'electrical-services',
  healthcare: 'local-hospital',
  entertainment: 'movie',
  shopping: 'shopping-cart',
  education: 'school',
  other: 'category'
};

const categoryColors: { [key: string]: string } = {
  food: '#FF6B6B',
  transport: '#4ECDC4',
  utilities: '#45B7D1',
  healthcare: '#96CEB4',
  entertainment: '#FFEAA7',
  shopping: '#DDA0DD',
  education: '#98D8C8',
  other: '#F7DC6F'
};

export default function ExpenseCard({ amount, category, description, date, onPress }: ExpenseCardProps) {
  const iconName = categoryIcons[category] || 'category';
  const iconColor = categoryColors[category] || '#F7DC6F';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        <MaterialIcons name={iconName} size={24} color="#FFFFFF" />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.description} numberOfLines={1}>{description}</Text>
        <Text style={styles.category}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
        <Text style={styles.date}>{new Date(date).toLocaleDateString('en-IN')}</Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>₹{amount.toLocaleString('en-IN')}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#95A5A6',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
});