import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Target, TrendingUp, Globe, DollarSign } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { blink } from '@/lib/blink';
import AddIncomeModal from '@/components/AddIncomeModal';
import IncomeCard from '@/components/IncomeCard';

interface ExpenseData {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  user_id: string;
}

interface GoalData {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  user_id: string;
}

interface IncomeData {
  id: string;
  amount: number;
  source: string;
  description: string;
  date: string;
  user_id: string;
}

export default function Dashboard() {
  const { t, language, setLanguage } = useLanguage();
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [income, setIncome] = useState<IncomeData[]>([]);
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await blink.auth.me();
      setUser(userData);
      
      // Load expenses for current month
      const expenseData = await blink.db.expenses.list({
        where: { user_id: userData.id },
        orderBy: { created_at: 'desc' },
        limit: 50
      });
      setExpenses(expenseData);

      // Load income for current month
      const incomeData = await blink.db.income.list({
        where: { user_id: userData.id },
        orderBy: { created_at: 'desc' },
        limit: 50
      });
      setIncome(incomeData);

      // Load goals
      const goalData = await blink.db.goals.list({
        where: { user_id: userData.id },
        orderBy: { created_at: 'desc' }
      });
      setGoals(goalData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const getCurrentMonthExpenses = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
  };

  const getCurrentMonthIncome = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return income.filter(incomeItem => {
      const incomeDate = new Date(incomeItem.date);
      return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
    });
  };

  const totalMonthlyExpenses = getCurrentMonthExpenses().reduce((sum, expense) => sum + expense.amount, 0);
  const totalMonthlyIncome = getCurrentMonthIncome().reduce((sum, incomeItem) => sum + incomeItem.amount, 0);
  const totalSavings = goals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const netIncome = totalMonthlyIncome - totalMonthlyExpenses;

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const handleIncomeAdded = () => {
    loadUserData();
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
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={['#2E7D32', '#388E3C']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>{t('welcome')}</Text>
              <Text style={styles.userName}>{user?.email?.split('@')[0] || 'User'}</Text>
            </View>
            <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
              <Globe color="#FFFFFF" size={24} />
              <Text style={styles.languageText}>{language.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Add Income Button - Prominent Feature */}
        <View style={styles.addIncomeSection}>
          <TouchableOpacity 
            style={styles.addIncomeButton}
            onPress={() => setShowIncomeModal(true)}
          >
            <LinearGradient
              colors={['#2E7D32', '#4CAF50']}
              style={styles.addIncomeGradient}
            >
              <DollarSign color="#FFFFFF" size={32} />
              <Text style={styles.addIncomeText}>
                {language === 'hi' ? 'आय जोड़ें' : 'Add Income'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Monthly Overview Cards */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>{t('monthlyOverview')}</Text>
          <View style={styles.cardRow}>
            <View style={[styles.overviewCard, styles.incomeCard]}>
              <Text style={styles.cardLabel}>
                {language === 'hi' ? 'कुल आय' : 'Total Income'}
              </Text>
              <Text style={styles.cardAmount}>₹{totalMonthlyIncome.toLocaleString('en-IN')}</Text>
            </View>
            <View style={[styles.overviewCard, styles.expenseCard]}>
              <Text style={styles.cardLabel}>{t('totalExpenses')}</Text>
              <Text style={styles.cardAmount}>₹{totalMonthlyExpenses.toLocaleString('en-IN')}</Text>
            </View>
          </View>
          <View style={styles.cardRow}>
            <View style={[styles.overviewCard, styles.netIncomeCard]}>
              <Text style={styles.cardLabel}>
                {language === 'hi' ? 'शुद्ध आय' : 'Net Income'}
              </Text>
              <Text style={[styles.cardAmount, netIncome < 0 && styles.negativeAmount]}>
                ₹{netIncome.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={[styles.overviewCard, styles.savingsCard]}>
              <Text style={styles.cardLabel}>{t('savings')}</Text>
              <Text style={styles.cardAmount}>₹{totalSavings.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Plus color="#FFFFFF" size={28} />
              </View>
              <Text style={styles.actionButtonText}>{t('addExpense')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIconContainer, styles.goalIconContainer]}>
                <Target color="#FFFFFF" size={28} />
              </View>
              <Text style={styles.actionButtonText}>{t('viewGoals')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIconContainer, styles.investIconContainer]}>
                <TrendingUp color="#FFFFFF" size={28} />
              </View>
              <Text style={styles.actionButtonText}>{t('invest')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Income */}
        {income.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>
              {language === 'hi' ? 'हाल की आय' : 'Recent Income'}
            </Text>
            {getCurrentMonthIncome().slice(0, 3).map((incomeItem) => (
              <IncomeCard key={incomeItem.id} income={incomeItem} />
            ))}
          </View>
        )}

        {/* Recent Expenses */}
        {expenses.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>
              {language === 'hi' ? 'हाल के खर्च' : 'Recent Expenses'}
            </Text>
            {getCurrentMonthExpenses().slice(0, 3).map((expense) => (
              <View key={expense.id} style={styles.expenseItem}>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseCategory}>{expense.category}</Text>
                  <Text style={styles.expenseDescription}>{expense.description}</Text>
                </View>
                <Text style={styles.expenseAmount}>-₹{expense.amount.toLocaleString('en-IN')}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <AddIncomeModal
        visible={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        onIncomeAdded={handleIncomeAdded}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
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
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  languageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  addIncomeSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  addIncomeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addIncomeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  addIncomeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  overviewSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6F00',
  },
  netIncomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  savingsCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  cardLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  cardAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  negativeAmount: {
    color: '#F44336',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalIconContainer: {
    backgroundColor: '#FF6F00',
  },
  investIconContainer: {
    backgroundColor: '#1976D2',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2E7D32',
    textAlign: 'center',
  },
  recentSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  expenseInfo: {
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
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6F00',
  },
});