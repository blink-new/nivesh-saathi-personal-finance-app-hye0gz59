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

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onExpenseAdded: () => void;
}

const categories = [
  { id: 'food', name: 'Food', nameHi: 'खाना', icon: 'restaurant', color: '#FF6B6B' },
  { id: 'transport', name: 'Transport', nameHi: 'यातायात', icon: 'directions-bus', color: '#4ECDC4' },
  { id: 'utilities', name: 'Utilities', nameHi: 'उपयोगिताएं', icon: 'electrical-services', color: '#45B7D1' },
  { id: 'healthcare', name: 'Healthcare', nameHi: 'स्वास्थ्य', icon: 'local-hospital', color: '#96CEB4' },
  { id: 'entertainment', name: 'Entertainment', nameHi: 'मनोरंजन', icon: 'movie', color: '#FFEAA7' },
  { id: 'shopping', name: 'Shopping', nameHi: 'खरीदारी', icon: 'shopping-cart', color: '#DDA0DD' },
  { id: 'education', name: 'Education', nameHi: 'शिक्षा', icon: 'school', color: '#98D8C8' },
  { id: 'other', name: 'Other', nameHi: 'अन्य', icon: 'category', color: '#F7DC6F' },
];

export default function AddExpenseModal({ visible, onClose, onExpenseAdded }: AddExpenseModalProps) {
  const { language, t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || !description || !selectedCategory) {
      Alert.alert(
        language === 'hi' ? 'त्रुटि' : 'Error',
        language === 'hi' ? 'कृपया सभी फ़ील्ड भरें' : 'Please fill all fields'
      );
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert(
        language === 'hi' ? 'त्रुटि' : 'Error',
        language === 'hi' ? 'कृपया वैध राशि दर्ज करें' : 'Please enter a valid amount'
      );
      return;
    }

    setLoading(true);
    try {
      const user = await blink.auth.me();
      await blink.db.expenses.create({
        user_id: user.id,
        amount: amountNum,
        category: selectedCategory,
        description,
        date: new Date().toISOString(),
      });

      setAmount('');
      setDescription('');
      setSelectedCategory('');
      onExpenseAdded();
      onClose();
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert(
        language === 'hi' ? 'त्रुटि' : 'Error',
        language === 'hi' ? 'खर्च जोड़ने में त्रुटि' : 'Error adding expense'
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
            {language === 'hi' ? 'खर्च जोड़ें' : 'Add Expense'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>
              {language === 'hi' ? 'राशि (₹)' : 'Amount (₹)'}
            </Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder={language === 'hi' ? 'राशि दर्ज करें' : 'Enter amount'}
              keyboardType="numeric"
              placeholderTextColor="#95A5A6"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              {language === 'hi' ? 'विवरण' : 'Description'}
            </Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder={language === 'hi' ? 'खर्च का विवरण' : 'Expense description'}
              placeholderTextColor="#95A5A6"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              {language === 'hi' ? 'श्रेणी' : 'Category'}
            </Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    selectedCategory === category.id && styles.selectedCategory,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <MaterialIcons
                      name={category.icon as keyof typeof MaterialIcons.glyphMap}
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={styles.categoryName}>
                    {language === 'hi' ? category.nameHi : category.name}
                  </Text>
                </TouchableOpacity>
              ))}
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
                : (language === 'hi' ? 'खर्च जोड़ें' : 'Add Expense')
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
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#ECF0F1',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '22%',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCategory: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E8',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#2C3E50',
    textAlign: 'center',
    fontWeight: '500',
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