import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { 
  User, 
  Globe, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Smartphone,
  Database,
  Wifi,
  WifiOff
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '@/contexts/LanguageContext';
import { blink } from '@/lib/blink';

export default function Profile() {
  const { t, language, setLanguage } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await blink.auth.me();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => blink.auth.logout()
        }
      ]
    );
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'hi' : 'en';
    setLanguage(newLanguage);
    Alert.alert(
      'Language Changed',
      `Language changed to ${newLanguage === 'en' ? 'English' : 'Hindi'}`,
      [{ text: 'OK' }]
    );
  };

  const ProfileOption = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    showChevron = true,
    rightComponent 
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showChevron?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.profileOption} onPress={onPress}>
      <View style={styles.optionLeft}>
        <View style={styles.optionIcon}>
          <Icon color="#2E7D32" size={20} />
        </View>
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>{title}</Text>
          {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.optionRight}>
        {rightComponent}
        {showChevron && <ChevronRight color="#BDBDBD" size={20} />}
      </View>
    </TouchableOpacity>
  );

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
          colors={['#2E7D32', '#388E3C']}
          style={styles.header}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.email?.split('@')[0] || 'User'}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4CAF50' : '#F44336' }]} />
                <Text style={styles.statusText}>
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <ProfileOption
            icon={Globe}
            title="Language"
            subtitle={`Currently: ${language === 'en' ? 'English' : 'Hindi'}`}
            onPress={toggleLanguage}
            rightComponent={
              <Text style={styles.languageToggle}>
                {language === 'en' ? 'EN' : 'हि'}
              </Text>
            }
          />

          <ProfileOption
            icon={Bell}
            title="Notifications"
            subtitle="Expense reminders and goal updates"
            showChevron={false}
            rightComponent={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#E0E0E0', true: '#C8E6C9' }}
                thumbColor={notifications ? '#2E7D32' : '#BDBDBD'}
              />
            }
          />

          <ProfileOption
            icon={offlineMode ? WifiOff : Wifi}
            title="Offline Mode"
            subtitle="Work without internet connection"
            showChevron={false}
            rightComponent={
              <Switch
                value={offlineMode}
                onValueChange={setOfflineMode}
                trackColor={{ false: '#E0E0E0', true: '#C8E6C9' }}
                thumbColor={offlineMode ? '#2E7D32' : '#BDBDBD'}
              />
            }
          />
        </View>

        {/* Data & Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          
          <ProfileOption
            icon={Database}
            title="Data Sync"
            subtitle="Last synced: Just now"
            onPress={() => Alert.alert('Data Sync', 'All data is up to date')}
          />

          <ProfileOption
            icon={Shield}
            title="Privacy Settings"
            subtitle="Manage your data and privacy"
            onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon')}
          />

          <ProfileOption
            icon={Smartphone}
            title="App Version"
            subtitle="Version 1.0.0"
            showChevron={false}
          />
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <ProfileOption
            icon={HelpCircle}
            title="Help & FAQ"
            subtitle="Get help with using the app"
            onPress={() => Alert.alert('Help', 'Help documentation coming soon')}
          />

          <ProfileOption
            icon={User}
            title="Contact Support"
            subtitle="Get in touch with our team"
            onPress={() => Alert.alert('Support', 'Email: support@niveshsaathi.com')}
          />
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut color="#F44336" size={20} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Nivesh Saathi</Text>
          <Text style={styles.appTagline}>Your Personal Finance Companion</Text>
          <Text style={styles.appVersion}>Made with ❤️ for Indian workers</Text>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F8E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#757575',
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageToggle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 12,
    color: '#BDBDBD',
  },
});