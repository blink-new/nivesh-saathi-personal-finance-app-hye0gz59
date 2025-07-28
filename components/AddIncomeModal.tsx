import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { blink } from '../lib/blink';

interface AddIncomeModalProps {
  visible: boolean;
  onClose: () => void;
  onIncomeAdded: () => void;
}

const incomeSources = [
  { id: 'salary', icon: 'briefcase', color: '#2E7D32' },
  { id: 'overtime', icon: 'time', color: '#FF6F00' },
  { id: 'bonus', icon: 'gift', color: '#1976D2' },
  { id: 'freelance', icon: 'laptop', color: '#7B1FA2' },
  { id: 'rental', icon: 'home', color: '#388E3C' },
  { id: 'other', icon: 'cash', color: '#5D4037' },
];

export default function AddIncomeModal({ visible, onClose, onIncomeAdded }: AddIncomeModalProps) {
  const { language, t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddIncome = async () => {
    if (!amount || !selectedSource) {
      Alert.alert(
        t.error,
        language === 'hi' ? 'कृपया सभी आवश्यक फील्ड भरें' : 'Please fill all required fields'
      );
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert(
        t.error,
        language === 'hi' ? 'कृपया वैध राशि दर्ज करें' : 'Please enter a valid amount'
      );
      return;
    }

    setLoading(true);
    try {
      const user = await blink.auth.me();
      await blink.db.income.create({
        id: `income_${Date.now()}`,
        user_id: user.id,
        amount: numAmount,
        source: selectedSource,
        description: description || '',
        date: new Date().toISOString().split('T')[0],
      });

      Alert.alert(
        language === 'hi' ? 'सफल!' : 'Success!',
        language === 'hi' ? 'आय सफलतापूर्वक जोड़ी गई' : 'Income added successfully'
      );

      setAmount('');
      setSelectedSource('');
      setDescription('');
      onIncomeAdded();
      onClose();
    } catch (error) {
      console.error('Error adding income:', error);
      Alert.alert(
        t.error,
        language === 'hi' ? 'आय जोड़ने में त्रुटि' : 'Error adding income'
      );
    } finally {
      setLoading(false);
    }
  };

  const getSourceName = (sourceId: string) => {
    const sourceNames = {
      salary: language === 'hi' ? 'वेतन' : 'Salary',
      overtime: language === 'hi' ? 'ओवरटाइम' : 'Overtime',
      bonus: language === 'hi' ? 'बोनस' : 'Bonus',
      freelance: language === 'hi' ? 'फ्रीलांस' : 'Freelance',
      rental: language === 'hi' ? 'किराया' : 'Rental',
      other: language === 'hi' ? 'अन्य' : 'Other',
    };
    return sourceNames[sourceId as keyof typeof sourceNames] || sourceId;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {language === 'hi' ? 'आय जोड़ें' : 'Add Income'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'hi' ? 'राशि (₹)' : 'Amount (₹)'}
            </Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder={language === 'hi' ? 'राशि दर्ज करें' : 'Enter amount'}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'hi' ? 'आय का स्रोत' : 'Income Source'}
            </Text>
            <View style={styles.sourceGrid}>
              {incomeSources.map((source) => (
                <TouchableOpacity
                  key={source.id}
                  style={[
                    styles.sourceCard,
                    selectedSource === source.id && styles.selectedSourceCard,
                  ]}
                  onPress={() => setSelectedSource(source.id)}
                >
                  <View style={[styles.sourceIcon, { backgroundColor: source.color }]}>
                    <Ionicons name={source.icon as any} size={24} color="white" />
                  </View>
                  <Text style={[
                    styles.sourceName,
                    selectedSource === source.id && styles.selectedSourceName,
                  ]}>
                    {getSourceName(source.id)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'hi' ? 'विवरण (वैकल्पिक)' : 'Description (Optional)'}
            </Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder={language === 'hi' ? 'विवरण जोड़ें...' : 'Add description...'}
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.addButton, loading && styles.disabledButton]}
            onPress={handleAddIncome}
            disabled={loading}
          >
            <Text style={styles.addButtonText}>
              {loading 
                ? (language === 'hi' ? 'जोड़ा जा रहा है...' : 'Adding...') 
                : (language === 'hi' ? 'आय जोड़ें' : 'Add Income')
              }
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2E7D32',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  amountInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    color: '#333',
  },
  sourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sourceCard: {
    width: '30%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    minHeight: 100,
  },
  selectedSourceCard: {
    borderColor: '#2E7D32',
    backgroundColor: '#F1F8E9',
  },
  sourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sourceName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  selectedSourceName: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  descriptionInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    color: '#333',
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  addButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});