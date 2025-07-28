import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { Plus, X, Target } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '@/contexts/LanguageContext';
import { blink } from '@/lib/blink';

// const { width } = Dimensions.get('window');

interface GoalData {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  user_id: string;
  created_at: string;
}

export default function Goals() {
  const { t } = useLanguage();
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const user = await blink.auth.me();
      const goalData = await blink.db.goals.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' }
      });
      setGoals(goalData);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.name || !newGoal.targetAmount) {
      Alert.alert('Error', 'Please fill in goal name and target amount');
      return;
    }

    try {
      const user = await blink.auth.me();
      const goal = await blink.db.goals.create({
        name: newGoal.name,
        target_amount: parseFloat(newGoal.targetAmount),
        current_amount: parseFloat(newGoal.currentAmount) || 0,
        user_id: user.id,
        created_at: new Date().toISOString(),
      });

      setGoals([goal, ...goals]);
      setNewGoal({ name: '', targetAmount: '', currentAmount: '' });
      setShowAddModal(false);
      Alert.alert('Success', 'Goal created successfully');
    } catch (error) {
      console.error('Error adding goal:', error);
      Alert.alert('Error', 'Failed to create goal');
    }
  };

  const updateGoalAmount = async (goalId: string, newAmount: number) => {
    try {
      await blink.db.goals.update(goalId, { current_amount: newAmount });
      setGoals(goals.map(goal => 
        goal.id === goalId ? { ...goal, current_amount: newAmount } : goal
      ));
      Alert.alert('Success', 'Goal updated successfully');
    } catch (error) {
      console.error('Error updating goal:', error);
      Alert.alert('Error', 'Failed to update goal');
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return '#4CAF50';
    if (percentage >= 75) return '#8BC34A';
    if (percentage >= 50) return '#FF9800';
    if (percentage >= 25) return '#FF6F00';
    return '#F44336';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('savingsGoals')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus color="#FFFFFF" size={24} />
        </TouchableOpacity>
      </View>

      {/* Goals List */}
      <ScrollView style={styles.goalsList} showsVerticalScrollIndicator={false}>
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Target color="#BDBDBD" size={64} />
            <Text style={styles.emptyStateText}>No savings goals yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Create your first savings goal to start building your financial future
            </Text>
            <TouchableOpacity
              style={styles.createFirstGoalButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.createFirstGoalButtonText}>{t('createGoal')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          goals.map((goal) => {
            const progressPercentage = getProgressPercentage(goal.current_amount, goal.target_amount);
            const progressColor = getProgressColor(progressPercentage);
            
            return (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalName}>{goal.name}</Text>
                  <Text style={styles.goalPercentage}>{progressPercentage.toFixed(0)}%</Text>
                </View>
                
                <View style={styles.goalAmounts}>
                  <Text style={styles.currentAmount}>
                    {t('rupees')}{goal.current_amount.toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.targetAmount}>
                    of {t('rupees')}{goal.target_amount.toLocaleString('en-IN')}
                  </Text>
                </View>

                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <LinearGradient
                      colors={[progressColor, progressColor]}
                      style={[
                        styles.progressBarFill,
                        { width: `${progressPercentage}%` }
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.goalActions}>
                  <TouchableOpacity
                    style={styles.addMoneyButton}
                    onPress={() => {
                      Alert.prompt(
                        'Add Money',
                        'Enter amount to add to this goal:',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Add',
                            onPress: (amount) => {
                              if (amount && !isNaN(parseFloat(amount))) {
                                updateGoalAmount(goal.id, goal.current_amount + parseFloat(amount));
                              }
                            }
                          }
                        ],
                        'plain-text',
                        '',
                        'numeric'
                      );
                    }}
                  >
                    <Text style={styles.addMoneyButtonText}>Add Money</Text>
                  </TouchableOpacity>
                  
                  {progressPercentage >= 100 && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>Completed! 🎉</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('createGoal')}</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X color="#757575" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Goal Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('goalName')}</Text>
              <TextInput
                style={styles.textInput}
                value={newGoal.name}
                onChangeText={(text) => setNewGoal({ ...newGoal, name: text })}
                placeholder="e.g., Emergency Fund, New Phone, Vacation"
                placeholderTextColor="#BDBDBD"
              />
            </View>

            {/* Target Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('targetAmount')}</Text>
              <TextInput
                style={styles.amountInput}
                value={newGoal.targetAmount}
                onChangeText={(text) => setNewGoal({ ...newGoal, targetAmount: text })}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#BDBDBD"
              />
            </View>

            {/* Current Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('currentAmount')} (Optional)</Text>
              <TextInput
                style={styles.amountInput}
                value={newGoal.currentAmount}
                onChangeText={(text) => setNewGoal({ ...newGoal, currentAmount: text })}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#BDBDBD"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={addGoal}>
              <Text style={styles.submitButtonText}>{t('createGoal')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#2E7D32',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#757575',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#BDBDBD',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  createFirstGoalButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  createFirstGoalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    flex: 1,
  },
  goalPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6F00',
  },
  goalAmounts: {
    marginBottom: 16,
  },
  currentAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  targetAmount: {
    fontSize: 14,
    color: '#757575',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addMoneyButton: {
    backgroundColor: '#FF6F00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addMoneyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2E7D32',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  amountInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});