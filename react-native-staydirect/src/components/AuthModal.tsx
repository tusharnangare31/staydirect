import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/database.types';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<UserRole>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      if (isSignUp) {
        if (!fullName.trim()) {
          Alert.alert('Name Required', 'Please enter your full name.');
          return;
        }

        const { error } = await signUp(
          email.trim(),
          password,
          fullName.trim(),
          role,
          phone.trim(),
          college.trim()
        );

        if (error) {
          Alert.alert('Sign Up Issue', error.message);
        } else {
          Alert.alert('Account Created! 🎉', 'Welcome to StayDirect Pune.');
          onClose();
        }
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          Alert.alert('Login Failed', error.message);
        } else {
          Alert.alert('Welcome back!', 'Signed in successfully.');
          onClose();
        }
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isSignUp ? 'Create StayDirect Account' : 'Welcome to StayDirect'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Tagline */}
            <Text style={styles.tagline}>
              Find Your Home. Zero Brokerage. Connect directly with owners in Pune.
            </Text>

            {/* Role Picker (if Sign Up) */}
            {isSignUp && (
              <View style={styles.rolePickerRow}>
                <TouchableOpacity
                  style={[styles.roleBtn, role === 'student' && styles.roleBtnActive]}
                  onPress={() => setRole('student')}
                >
                  <Ionicons
                    name="school"
                    size={16}
                    color={role === 'student' ? THEME.colors.white : THEME.colors.primary}
                  />
                  <Text
                    style={[
                      styles.roleBtnText,
                      role === 'student' && styles.roleBtnTextActive,
                    ]}
                  >
                    I am a Student
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleBtn, role === 'owner' && styles.roleBtnActive]}
                  onPress={() => setRole('owner')}
                >
                  <Ionicons
                    name="business"
                    size={16}
                    color={role === 'owner' ? THEME.colors.white : THEME.colors.primary}
                  />
                  <Text
                    style={[
                      styles.roleBtnText,
                      role === 'owner' && styles.roleBtnTextActive,
                    ]}
                  >
                    Hostel Owner
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {isSignUp && (
              <>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="e.g. Rahul Deshmukh"
                  placeholderTextColor={THEME.colors.textMuted}
                  style={styles.input}
                />
              </>
            )}

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@college.edu or gmail.com"
              placeholderTextColor={THEME.colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={THEME.colors.textMuted}
              secureTextEntry
              style={styles.input}
            />

            {isSignUp && (
              <>
                <Text style={styles.label}>Phone Number (For Owner WhatsApp / Call)</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+91 98901 23456"
                  placeholderTextColor={THEME.colors.textMuted}
                  keyboardType="phone-pad"
                  style={styles.input}
                />

                <Text style={styles.label}>
                  {role === 'student' ? 'College / University' : 'Hostel Brand / Company'}
                </Text>
                <TextInput
                  value={college}
                  onChangeText={setCollege}
                  placeholder={role === 'student' ? 'e.g. MIT WPU Pune / COEP' : 'e.g. Deshmukh Hostels'}
                  placeholderTextColor={THEME.colors.textMuted}
                  style={styles.input}
                />
              </>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={THEME.colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isSignUp ? 'Sign Up with Supabase' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle Mode */}
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.toggleText}>
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Create one"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 28, 45, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.borderRadius.xl,
    borderTopRightRadius: THEME.borderRadius.xl,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.lg,
    paddingBottom: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  headerTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
  },
  tagline: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  roleBtnActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  roleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  roleBtnTextActive: {
    color: THEME.colors.white,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: THEME.colors.surfaceVariant,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: THEME.colors.textPrimary,
  },
  submitBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    color: THEME.colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  toggleRow: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  toggleText: {
    fontSize: 12,
    color: THEME.colors.primary,
    fontWeight: '700',
  },
});
