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
} from 'react-native';
import { Plus, X, ShoppingCart, Car, Zap, Gamepad2, Heart, MoreHorizontal } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { blink } from '@/lib/blink';

interface ExpenseData {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  userId: string;
}

const categories = [
  { key: 'food', icon: ShoppingCart, color: '#FF6F00' },
  { key: 'transport', icon: Car, color: '#2196F3' },
  { key: 'utilities', icon: Zap, color: '#9C27B0' },
  { key: 'entertainment', icon: Gamepad2, color: '#E91E63' },
  { key: 'healthcare', icon: Heart, color: '#F44336' },
  { key: 'other', icon: MoreHorizontal, color: '#607D8B' },
];

export default function Expenses() {
  const { t } = useLanguage();
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'food',
    description: '',
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const user = await blink.auth.me();
      const expenseData = await blink.db.expenses.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' },
        limit: 100
      });
      setExpenses(expenseData);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async () => {
    if (!newExpense.amount || !newExpense.description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const user = await blink.auth.me();
      const expense = await blink.db.expenses.create({
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        description: newExpense.description,
        date: new Date().toISOString(),
        user_id: user.id,
      });

      setExpenses([expense, ...expenses]);
      setNewExpense({ amount: '', category: 'food', description: '' });
      setShowAddModal(false);
      Alert.alert('Success', 'Expense added successfully');
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense');
    }
  };

  const getCategoryIcon = (categoryKey: string) => {
    const category = categories.find(cat => cat.key === categoryKey);
    return category || categories[categories.length - 1];
  };

  const getCurrentMonthExpenses = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
  };

  const totalMonthlyExpenses = getCurrentMonthExpenses().reduce((sum, expense) => sum + expense.amount, 0);

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
        <Text style={styles.headerTitle}>{t('expenses')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus color="#FFFFFF" size={24} />
        </TouchableOpacity>
      </View>

      {/* Monthly Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>This Month</Text>
        <Text style={styles.summaryAmount}>{t('rupees')}{totalMonthlyExpenses.toLocaleString('en-IN')}</Text>
        <Text style={styles.summarySubtext}>{getCurrentMonthExpenses().length} transactions</Text>
      </View>

      {/* Expenses List */}
      <ScrollView style={styles.expensesList} showsVerticalScrollIndicator={false}>
        {expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No expenses recorded yet</Text>
            <Text style={styles.emptyStateSubtext}>Tap the + button to add your first expense</Text>
          </View>
        ) : (
          expenses.map((expense) => {
            const categoryInfo = getCategoryIcon(expense.category);
            const IconComponent = categoryInfo.icon;
            
            return (
              <View key={expense.id} style={styles.expenseItem}>
                <View style={[styles.categoryIcon, { backgroundColor: categoryInfo.color }]}>
                  <IconComponent color="#FFFFFF" size={24} />
                </View>
                <View style={styles.expenseDetails}>
                  <Text style={styles.expenseCategory}>{t(expense.category)}</Text>
                  <Text style={styles.expenseDescription}>{expense.description}</Text>
                  <Text style={styles.expenseDate}>
                    {new Date(expense.date).toLocaleDateString('en-IN')}
                  </Text>
                </View>
                <Text style={styles.expenseAmount}>-{t('rupees')}{expense.amount}</Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('addNewExpense')}</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X color="#757575" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('amount')}</Text>
              <TextInput
                style={styles.amountInput}
                value={newExpense.amount}
                onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#BDBDBD"
              />
            </View>

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('category')}</Text>
              <View style={styles.categoryGrid}>
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const isSelected = newExpense.category === category.key;
                  
                  return (
                    <TouchableOpacity
                      key={category.key}
                      style={[
                        styles.categoryOption,
                        isSelected && styles.categoryOptionSelected,
                        { borderColor: category.color }
                      ]}
                      onPress={() => setNewExpense({ ...newExpense, category: category.key })}
                    >
                      <View style={[styles.categoryOptionIcon, { backgroundColor: category.color }]}>
                        <IconComponent color="#FFFFFF" size={20} />
                      </View>
                      <Text style={[
                        styles.categoryOptionText,
                        isSelected && styles.categoryOptionTextSelected
                      ]}>
                        {t(category.key)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('description')}</Text>
              <TextInput
                style={styles.textInput}
                value={newExpense.description}
                onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
                placeholder="Enter description..."
                placeholderTextColor="#BDBDBD"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={addExpense}>
              <Text style={styles.submitButtonText}>{t('save')}</Text>
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    color: '#757575',
  },
  expensesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#BDBDBD',
    textAlign: 'center',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 2,
  },
  expenseDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 2,
  },
  expenseDate: {
    fontSize: 12,
    color: '#BDBDBD',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6F00',
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
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2E7D32',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryOption: {
    width: '30%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  categoryOptionSelected: {
    borderWidth: 2,
    backgroundColor: '#F1F8E9',
  },
  categoryOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#757575',
    textAlign: 'center',
  },
  categoryOptionTextSelected: {
    color: '#2E7D32',
    fontWeight: '600',
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