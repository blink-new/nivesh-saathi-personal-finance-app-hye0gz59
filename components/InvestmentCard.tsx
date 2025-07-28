import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface InvestmentCardProps {
  platform: string;
  title: string;
  description: string;
  expectedReturn: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  minInvestment: number;
  affiliateLink: string;
}

const platformColors: { [key: string]: string } = {
  'Groww': '#00D09C',
  'Zerodha': '#387ED1',
  'Paytm Money': '#002970'
};

const riskColors: { [key: string]: string } = {
  'Low': '#27AE60',
  'Medium': '#F39C12',
  'High': '#E74C3C'
};

export default function InvestmentCard({
  platform,
  title,
  description,
  expectedReturn,
  riskLevel,
  minInvestment,
  affiliateLink
}: InvestmentCardProps) {
  const handlePress = () => {
    Linking.openURL(affiliateLink);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={[styles.platformBadge, { backgroundColor: platformColors[platform] || '#3498DB' }]}>
          <Text style={styles.platformText}>{platform}</Text>
        </View>
        <View style={[styles.riskBadge, { backgroundColor: riskColors[riskLevel] }]}>
          <Text style={styles.riskText}>{riskLevel} Risk</Text>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.metricsContainer}>
        <View style={styles.metric}>
          <MaterialIcons name="trending-up" size={20} color="#27AE60" />
          <Text style={styles.metricLabel}>Expected Return</Text>
          <Text style={styles.metricValue}>{expectedReturn}</Text>
        </View>
        
        <View style={styles.metric}>
          <MaterialIcons name="account-balance-wallet" size={20} color="#3498DB" />
          <Text style={styles.metricLabel}>Min Investment</Text>
          <Text style={styles.metricValue}>₹{minInvestment.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.investButton}>
          Invest Now <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" />
        </Text>
      </View>

      <View style={styles.disclaimer}>
        <MaterialIcons name="info" size={14} color="#95A5A6" />
        <Text style={styles.disclaimerText}>
          Investments are subject to market risks. Please read all documents carefully.
        </Text>
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
    borderLeftWidth: 4,
    borderLeftColor: '#FF6F00',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  platformBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  platformText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 2,
  },
  footer: {
    backgroundColor: '#FF6F00',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  investButton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#95A5A6',
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
});