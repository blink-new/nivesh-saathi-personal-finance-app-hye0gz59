import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface GoalCardProps {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  onPress?: () => void;
}

export default function GoalCard({ title, targetAmount, currentAmount, targetDate, onPress }: GoalCardProps) {
  const progress = Math.min((currentAmount / targetAmount) * 100, 100);
  const remaining = Math.max(targetAmount - currentAmount, 0);
  const daysLeft = Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialIcons name="savings" size={24} color="#2E7D32" />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.daysLeft}>
          {daysLeft > 0 ? `${daysLeft} days left` : 'Target reached!'}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress.toFixed(1)}%</Text>
      </View>

      <View style={styles.amountContainer}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Current</Text>
          <Text style={styles.currentAmount}>₹{currentAmount.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Target</Text>
          <Text style={styles.targetAmount}>₹{targetAmount.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Remaining</Text>
          <Text style={styles.remainingAmount}>₹{remaining.toLocaleString('en-IN')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
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
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 8,
    flex: 1,
  },
  daysLeft: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E8F5E8',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    minWidth: 45,
    textAlign: 'right',
  },
  amountContainer: {
    gap: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  currentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  targetAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498DB',
  },
  remainingAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E67E22',
  },
});