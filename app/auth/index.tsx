import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/stores/auth-store';
import { ENV_CONFIG, validateEmail, validatePassword } from '@/utils/firebase-config';
import * as Icons from 'lucide-react-native';
import AdminDualLoginToggle from '@/components/AdminDualLoginToggle';

export default function AuthScreen() {
  const { login, signup, isLoading, isAuthenticated, user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'mechanic'>('customer');
  const [isLoginMode, setIsLoginMode] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Production logging
      console.log('User authenticated:', { userId: user.id, role: user.role, timestamp: new Date() });
      
      // Redirect based on role
      if (user.role === 'customer') {
        router.replace('/(customer)');
      } else if (user.role === 'mechanic') {
        router.replace('/(mechanic)');
      } else if (user.role === 'admin') {
        router.replace('/(admin)');
      } else {
        // Invalid role
        console.warn('Invalid role:', { userId: user.id, role: user.role });
        Alert.alert('Access Denied', 'You do not have permission to access this application.');
      }
    }
  }, [isAuthenticated, user]);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isLoginMode) {
      // Sign up validation
      if (!firstName.trim() || !lastName.trim()) {
        Alert.alert('Error', 'Please enter your first and last name');
        return;
      }

      // Email validation
      if (!validateEmail(email.trim())) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }

      // Password validation
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        Alert.alert('Error', passwordValidation.errors.join('\n'));
        return;
      }
    }

    // Production logging
    console.log('Authentication attempt:', { 
      email: email.trim(), 
      mode: isLoginMode ? 'login' : 'signup',
      role: isLoginMode ? 'N/A' : role,
      timestamp: new Date() 
    });

    let success = false;
    
    if (isLoginMode) {
      success = await login(email.trim(), password);
      if (!success) {
        Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
      }
    } else {
      success = await signup(email.trim(), password, firstName.trim(), lastName.trim(), phone.trim() || undefined, role);
      if (!success) {
        Alert.alert('Sign Up Failed', 'An account with this email already exists. Please try logging in instead.');
      }
    }

    if (!success) {
      console.log('Authentication failed:', { 
        email: email.trim(), 
        mode: isLoginMode ? 'login' : 'signup',
        timestamp: new Date() 
      });
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setRole('customer');
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    resetForm();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Heinicus</Text>
          <Text style={styles.logoSubtext}>Mobile Mechanic</Text>
        </View>
        <Text style={styles.subtitle}>
          Professional automotive service at your location
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>
          {isLoginMode ? 'Welcome Back' : 'Create Your Account'}
        </Text>
        <Text style={styles.formSubtitle}>
          {isLoginMode 
            ? 'Sign in to access your account' 
            : 'Join thousands of satisfied customers'
          }
        </Text>

        {!isLoginMode && (
          <>
            <View style={styles.nameRow}>
              <View style={[styles.inputGroup, styles.nameInput]}>
                <Text style={styles.inputLabel}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="John"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              <View style={[styles.inputGroup, styles.nameInput]}>
                <Text style={styles.inputLabel}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Doe"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Type *</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'customer' && styles.roleOptionActive
                  ]}
                  onPress={() => setRole('customer')}
                >
                  <Icons.User size={20} color={role === 'customer' ? Colors.white : Colors.textSecondary} />
                  <Text style={[
                    styles.roleOptionText,
                    role === 'customer' && styles.roleOptionTextActive
                  ]}>
                    Customer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'mechanic' && styles.roleOptionActive
                  ]}
                  onPress={() => setRole('mechanic')}
                >
                  <Icons.Wrench size={20} color={role === 'mechanic' ? Colors.white : Colors.textSecondary} />
                  <Text style={[
                    styles.roleOptionText,
                    role === 'mechanic' && styles.roleOptionTextActive
                  ]}>
                    Mechanic
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="john@example.com"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password *</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={isLoginMode ? "Enter your password" : "Create a password (min 6 characters)"}
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
          />
        </View>

        {!isLoginMode && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="(555) 123-4567"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
            />
          </View>
        )}

        <Button
          title={
            isLoading 
              ? (isLoginMode ? 'Signing In...' : 'Creating Account...') 
              : (isLoginMode ? 'Sign In' : 'Create Account')
          }
          onPress={handleAuth}
          disabled={isLoading}
          style={styles.authButton}
        />

        <TouchableOpacity
          style={styles.switchModeButton}
          onPress={switchMode}
          disabled={isLoading}
        >
          <Text style={styles.switchModeText}>
            {isLoginMode 
              ? "Don't have an account? Create one" 
              : 'Already have an account? Sign in'
            }
          </Text>
        </TouchableOpacity>
      </View>

      {/* Development Quick Access - Only show in development */}
      {ENV_CONFIG?.showQuickAccess && (
        <>
          <AdminDualLoginToggle />
          <View style={styles.quickAccessSection}>
            <Text style={styles.quickAccessTitle}>Manual Login (Development Only)</Text>
            <View style={styles.quickAccessButtons}>
              <TouchableOpacity
                style={styles.quickAccessButton}
                onPress={() => {
                  setEmail('customer@example.com');
                  setPassword('password');
                  setIsLoginMode(true);
                }}
              >
                <Text style={styles.quickAccessText}>Customer Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAccessButton}
                onPress={() => {
                  setEmail('matthew.heinen.2014@gmail.com');
                  setPassword('RoosTer669072!@');
                  setIsLoginMode(true);
                }}
              >
                <Text style={styles.quickAccessText}>Admin (Cody)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAccessButton}
                onPress={() => {
                  setEmail('cody@heinicus.com');
                  setPassword('RoosTer669072!@');
                  setIsLoginMode(true);
                }}
              >
                <Text style={styles.quickAccessText}>Mechanic (Cody)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* Production Info */}
      <View style={styles.productionInfo}>
        <View style={styles.productionBadge}>
          <Icons.Shield size={16} color={Colors.success} />
          <Text style={styles.productionText}>SECURE & TRUSTED</Text>
        </View>
        <Text style={styles.productionSubtext}>
          Licensed mechanic • Secure payments • Professional service
        </Text>
        
        {!isLoginMode && (
          <View style={styles.signupBenefits}>
            <View style={styles.benefitItem}>
              <Icons.Check size={16} color={Colors.success} />
              <Text style={styles.benefitText}>Free quotes and estimates</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icons.Check size={16} color={Colors.success} />
              <Text style={styles.benefitText}>Service at your location</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icons.Check size={16} color={Colors.success} />
              <Text style={styles.benefitText}>Professional certified mechanic</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 1,
  },
  logoSubtext: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 40,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
    color: Colors.text,
    fontSize: 16,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
  },
  roleOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  roleOptionTextActive: {
    color: Colors.white,
  },
  authButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  switchModeButton: {
    alignItems: 'center',
    padding: 8,
  },
  switchModeText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  quickAccessSection: {
    marginBottom: 40,
    padding: 16,
    backgroundColor: Colors.warning + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  quickAccessTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.warning,
    marginBottom: 12,
    textAlign: 'center',
  },
  quickAccessButtons: {
    gap: 8,
  },
  quickAccessButton: {
    backgroundColor: Colors.warning + '20',
    borderWidth: 1,
    borderColor: Colors.warning,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickAccessText: {
    color: Colors.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  productionInfo: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  productionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.success + '20',
    borderWidth: 1,
    borderColor: Colors.success,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  productionText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
  },
  productionSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  signupBenefits: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});