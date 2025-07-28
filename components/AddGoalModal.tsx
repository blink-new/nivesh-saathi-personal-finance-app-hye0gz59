import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { blink } from '../lib/blink';

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onGoalAdded: () => void;
}

export default function AddGoalModal({ visible, onClose, onGoalAdded }: AddGoalModalProps) {
  const { language } = useLanguage();
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !targetAmount || !targetDate) {
      Alert.alert(
        language === 'hi' ? 'त्रुटि' : 'Error',
        language === 'hi' ? 'कृपया सभी फ़ील्ड भरें' : 'Please fill all fields'
      );
      return;
    }

    const amountNum = parseFloat(targetAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert(
        language === 'hi' ? 'त्रुटि' : 'Error',
        language === 'hi' ? 'कृपया वैध राशि दर्ज करें' : 'Please enter a valid amount'
      );
      return;
    }

    // Simple date validation (YYYY-MM-DD format)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(targetDate)) {
      Alert.alert(
        language === 'hi' ? 'त्रुटि' : 'Error',
        language === 'hi' ? 'कृपया वैध तारीख दर्ज करें (YYYY-MM-DD)' : 'Please enter a valid date (YYYY-MM-DD)'
      );
      return;
    }

    setLoading(true);
    try {
      const user = await blink.auth.me();
      await blink.db.goals.create({
        user_id: user.id,
        title,
        target_amount: amountNum,
        current_amount: 0,
        target_date: targetDate,
        created_at: new Date().toISOString(),
      });

      setTitle('');
      setTargetAmount('');
      setTargetDate('');
      onGoalAdded();
      onClose();
    } catch (error) {
      console.error('Error adding goal:', error);
      Alert.alert(
        language === 'hi' ? 'त्रुटि' : 'Error',
        language === 'hi' ? 'लक्ष्य जोड़ने में त्रुटि' : 'Error adding goal'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#2C3E50" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {language === 'hi' ? 'नया लक्ष्य जोड़ें' : 'Add New Goal'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>
              {language === 'hi' ? 'लक्ष्य का नाम' : 'Goal Title'}
            </Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder={language === 'hi' ? 'जैसे: नई बाइक' : 'e.g., New Bike'}
              placeholderTextColor="#95A5A6"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              {language === 'hi' ? 'लक्ष्य राशि (₹)' : 'Target Amount (₹)'}
            </Text>
            <TextInput
              style={styles.amountInput}
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder={language === 'hi' ? 'राशि दर्ज करें' : 'Enter amount'}
              keyboardType="numeric"
              placeholderTextColor="#95A5A6"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              {language === 'hi' ? 'लक्ष्य तारीख' : 'Target Date'}
            </Text>
            <TextInput
              style={styles.input}
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#95A5A6"
            />
            <Text style={styles.helpText}>
              {language === 'hi' 
                ? 'तारीख इस प्रारूप में दर्ज करें: 2024-12-31' 
                : 'Enter date in format: 2024-12-31'
              }
            </Text>
          </View>

          <View style={styles.exampleSection}>
            <Text style={styles.exampleTitle}>
              {language === 'hi' ? 'उदाहरण लक्ष्य:' : 'Example Goals:'}
            </Text>
            <View style={styles.exampleItem}>
              <MaterialIcons name="two-wheeler" size={20} color="#2E7D32" />
              <Text style={styles.exampleText}>
                {language === 'hi' ? 'नई बाइक - ₹80,000' : 'New Bike - ₹80,000'}
              </Text>
            </View>
            <View style={styles.exampleItem}>
              <MaterialIcons name="home" size={20} color="#2E7D32" />
              <Text style={styles.exampleText}>
                {language === 'hi' ? 'घर की मरम्मत - ₹50,000' : 'Home Repair - ₹50,000'}
              </Text>
            </View>
            <View style={styles.exampleItem}>
              <MaterialIcons name="school" size={20} color="#2E7D32" />
              <Text style={styles.exampleText}>
                {language === 'hi' ? 'बच्चों की शिक्षा - ₹25,000' : 'Children Education - ₹25,000'}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading
                ? (language === 'hi' ? 'जोड़ा जा रहा है...' : 'Adding...')
                : (language === 'hi' ? 'लक्ष्य जोड़ें' : 'Add Goal')
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  amountInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  helpText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
    fontStyle: 'italic',
  },
  exampleSection: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 12,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#95A5A6',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});