import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { ExternalLink, AlertTriangle, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '@/contexts/LanguageContext';
import { blink } from '@/lib/blink';

// const { width } = Dimensions.get('window');

interface InvestmentPlatform {
  name: string;
  description: string;
  features: string[];
  affiliateLink: string;
  color: string;
  logo: string;
}

const investmentPlatforms: InvestmentPlatform[] = [
  {
    name: 'Groww',
    description: 'Simple investing for everyone. Start with mutual funds, stocks, and more.',
    features: ['Zero commission on equity delivery', 'Mutual funds starting ₹500', 'Easy KYC process'],
    affiliateLink: 'https://groww.in',
    color: '#00D09C',
    logo: '🌱'
  },
  {
    name: 'Zerodha',
    description: 'India\'s largest stock broker offering trading and investment services.',
    features: ['₹20 per trade', 'Advanced trading tools', 'Educational resources'],
    affiliateLink: 'https://zerodha.com',
    color: '#387ED1',
    logo: '📈'
  },
  {
    name: 'Paytm Money',
    description: 'Invest in mutual funds, stocks, and digital gold with zero commission.',
    features: ['Zero commission mutual funds', 'Digital gold investment', 'SIP starting ₹100'],
    affiliateLink: 'https://www.paytmmoney.com',
    color: '#00BAF2',
    logo: '💰'
  }
];

interface AIRecommendation {
  type: string;
  title: string;
  description: string;
  amount: number;
  risk: 'Low' | 'Medium' | 'High';
  timeframe: string;
  platform: string;
}

export default function Invest() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [surplus, setSurplus] = useState(0);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await blink.auth.me();
      setUserProfile(user);

      // Calculate monthly expenses
      const expenseData = await blink.db.expenses.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' },
        limit: 100
      });

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyExpenseTotal = expenseData
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

      setMonthlyExpenses(monthlyExpenseTotal);
      
      // For demo purposes, assume income based on target demographic
      const estimatedIncome = 75000; // ₹75,000 average for target demographic
      setMonthlyIncome(estimatedIncome);
      setSurplus(estimatedIncome - monthlyExpenseTotal);

      // Generate AI recommendations
      await generateRecommendations(estimatedIncome, monthlyExpenseTotal);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async (income: number, expenses: number) => {
    const surplus = income - expenses;
    const recommendations: AIRecommendation[] = [];

    if (surplus > 5000) {
      recommendations.push({
        type: 'Emergency Fund',
        title: 'Build Emergency Fund',
        description: 'Start with a liquid fund to cover 3-6 months of expenses. This is your financial safety net.',
        amount: Math.min(surplus * 0.4, 10000),
        risk: 'Low',
        timeframe: '6-12 months',
        platform: 'Groww'
      });

      if (surplus > 10000) {
        recommendations.push({
          type: 'SIP',
          title: 'Systematic Investment Plan',
          description: 'Start a monthly SIP in diversified equity mutual funds for long-term wealth creation.',
          amount: Math.min(surplus * 0.3, 5000),
          risk: 'Medium',
          timeframe: '5+ years',
          platform: 'Paytm Money'
        });
      }

      if (surplus > 15000) {
        recommendations.push({
          type: 'Digital Gold',
          title: 'Digital Gold Investment',
          description: 'Invest small amounts in digital gold as a hedge against inflation.',
          amount: Math.min(surplus * 0.1, 2000),
          risk: 'Low',
          timeframe: '1-3 years',
          platform: 'Paytm Money'
        });
      }
    } else if (surplus > 1000) {
      recommendations.push({
        type: 'Micro SIP',
        title: 'Start Small with Micro SIP',
        description: 'Begin your investment journey with a small monthly SIP of ₹500-1000.',
        amount: Math.min(surplus * 0.5, 1000),
        risk: 'Low',
        timeframe: '3+ years',
        platform: 'Groww'
      });
    }

    setRecommendations(recommendations);
  };

  const openPlatform = async (platform: InvestmentPlatform) => {
    try {
      // Track affiliate link click
      await blink.analytics.log('affiliate_link_clicked', {
        platform: platform.name,
        user_id: userProfile?.id
      });

      const supported = await Linking.canOpenURL(platform.affiliateLink);
      if (supported) {
        await Linking.openURL(platform.affiliateLink);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      console.error('Error opening platform:', error);
      Alert.alert('Error', 'Failed to open platform');
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'High': return '#F44336';
      default: return '#757575';
    }
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#1976D2', '#2196F3']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{t('investmentRecommendations')}</Text>
            <Text style={styles.headerSubtitle}>Personalized for your financial profile</Text>
          </View>
        </LinearGradient>

        {/* Financial Overview */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Your Financial Overview</Text>
          <View style={styles.overviewCards}>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewLabel}>Monthly Income</Text>
              <Text style={styles.overviewAmount}>{t('rupees')}{monthlyIncome.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewLabel}>Monthly Expenses</Text>
              <Text style={styles.overviewAmount}>{t('rupees')}{monthlyExpenses.toLocaleString('en-IN')}</Text>
            </View>
            <View style={[styles.overviewCard, styles.surplusCard]}>
              <Text style={styles.overviewLabel}>Available for Investment</Text>
              <Text style={[styles.overviewAmount, styles.surplusAmount]}>
                {t('rupees')}{surplus.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <View style={styles.recommendationsSection}>
            <View style={styles.aiHeaderContainer}>
              <Sparkles color="#FF6F00" size={24} />
              <Text style={styles.sectionTitle}>AI Recommendations</Text>
            </View>
            {recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationCard}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationType}>{rec.type}</Text>
                  <View style={[styles.riskBadge, { backgroundColor: getRiskColor(rec.risk) }]}>
                    <Text style={styles.riskText}>{rec.risk} Risk</Text>
                  </View>
                </View>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <Text style={styles.recommendationDescription}>{rec.description}</Text>
                <View style={styles.recommendationDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Suggested Amount</Text>
                    <Text style={styles.detailValue}>{t('rupees')}{rec.amount.toLocaleString('en-IN')}/month</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Time Frame</Text>
                    <Text style={styles.detailValue}>{rec.timeframe}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Recommended Platform</Text>
                    <Text style={styles.detailValue}>{rec.platform}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Investment Platforms */}
        <View style={styles.platformsSection}>
          <Text style={styles.sectionTitle}>Investment Platforms</Text>
          {investmentPlatforms.map((platform, index) => (
            <TouchableOpacity
              key={index}
              style={styles.platformCard}
              onPress={() => openPlatform(platform)}
            >
              <View style={styles.platformHeader}>
                <View style={styles.platformInfo}>
                  <Text style={styles.platformLogo}>{platform.logo}</Text>
                  <View style={styles.platformDetails}>
                    <Text style={styles.platformName}>{platform.name}</Text>
                    <Text style={styles.platformDescription}>{platform.description}</Text>
                  </View>
                </View>
                <ExternalLink color="#757575" size={20} />
              </View>
              <View style={styles.platformFeatures}>
                {platform.features.map((feature, featureIndex) => (
                  <Text key={featureIndex} style={styles.platformFeature}>• {feature}</Text>
                ))}
              </View>
              <View style={[styles.platformButton, { backgroundColor: platform.color }]}>
                <Text style={styles.platformButtonText}>Open {platform.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerSection}>
          <View style={styles.disclaimerHeader}>
            <AlertTriangle color="#FF6F00" size={24} />
            <Text style={styles.disclaimerTitle}>{t('disclaimer')}</Text>
          </View>
          <Text style={styles.disclaimerText}>
            {t('disclaimerText')} These recommendations are AI-generated based on your spending patterns and are for educational purposes only. Please consult with a financial advisor before making investment decisions.
          </Text>
        </View>
      </ScrollView>
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
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
  overviewCards: {
    gap: 12,
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  surplusCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  overviewLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  overviewAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  surplusAmount: {
    color: '#4CAF50',
  },
  recommendationsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  aiHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationCard: {
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
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6F00',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
    marginBottom: 16,
  },
  recommendationDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#757575',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  platformsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  platformCard: {
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
  platformHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  platformInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  platformLogo: {
    fontSize: 32,
    marginRight: 16,
  },
  platformDetails: {
    flex: 1,
  },
  platformName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  platformDescription: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  platformFeatures: {
    marginBottom: 16,
  },
  platformFeature: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  platformButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  platformButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  disclaimerSection: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6F00',
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6F00',
    marginLeft: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
});