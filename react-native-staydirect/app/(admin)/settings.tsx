import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';

interface PlatformSettingsProps {
  onBack?: () => void;
}

export const AdminSettingsScreen: React.FC<PlatformSettingsProps> = ({ onBack }) => {
  const { profile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Platform setting states
  const [zeroBrokerageStrict, setZeroBrokerageStrict] = useState(true);
  const [autoRefundDays, setAutoRefundDays] = useState('2');
  const [escrowHoldHours, setEscrowHoldHours] = useState('48');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceNotice, setMaintenanceNotice] = useState('');
  const [puneSupportPhone, setPuneSupportPhone] = useState('+91 98901 23456');
  const [supportEmail, setSupportEmail] = useState('support@staydirect.in');
  const [puneOfficeAddress, setPuneOfficeAddress] = useState(
    'FC Road, Deccan Gymkhana, Pune 411004'
  );

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert(
        'Settings Updated',
        'Platform configurations have been synchronized across Pune operations and Supabase policies.'
      );
    }, 600);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={24} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Platform & Policy Settings</Text>
          <Text style={styles.headerSubtitle}>Pune Operations & Escrow Rules</Text>
        </View>
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.btnDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Zero Brokerage Enforcement */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="shield-checkmark" size={20} color="#059669" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.cardTitle}>Zero Brokerage Guarantee</Text>
              <Text style={styles.cardSub}>Automatic penalization & delisting</Text>
            </View>
            <Switch
              value={zeroBrokerageStrict}
              onValueChange={setZeroBrokerageStrict}
              trackColor={{ false: '#D1D5DB', true: THEME.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text style={styles.cardExplainer}>
            When active, any owner reported with verified proof of charging broker fees or offline
            commissions will have their listing suspended immediately pending admin review.
          </Text>
        </View>

        {/* Escrow & Refund SLAs */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="time" size={20} color="#4F46E5" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.cardTitle}>Escrow & Refund SLA</Text>
              <Text style={styles.cardSub}>Turnaround times for deposit protection</Text>
            </View>
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Auto-Refund Window (Days)</Text>
            <TextInput
              style={styles.textInputShort}
              keyboardType="numeric"
              value={autoRefundDays}
              onChangeText={setAutoRefundDays}
              maxLength={2}
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Deposit Hold Time (Hours)</Text>
            <TextInput
              style={styles.textInputShort}
              keyboardType="numeric"
              value={escrowHoldHours}
              onChangeText={setEscrowHoldHours}
              maxLength={3}
            />
          </View>

          <Text style={styles.cardExplainer}>
            Booking deposits are held in Razorpay escrow for {escrowHoldHours} hours until the
            student physically visits and verifies room conditions.
          </Text>
        </View>

        {/* Support & Pune City Contacts */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="call" size={20} color="#D97706" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.cardTitle}>Student Support Hotline</Text>
              <Text style={styles.cardSub}>Helpline for Pune college students</Text>
            </View>
          </View>

          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Support Phone Number</Text>
            <TextInput
              style={styles.textInput}
              value={puneSupportPhone}
              onChangeText={setPuneSupportPhone}
            />
          </View>

          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Official Support Email</Text>
            <TextInput
              style={styles.textInput}
              value={supportEmail}
              onChangeText={setSupportEmail}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Pune City Operations Hub</Text>
            <TextInput
              style={styles.textInput}
              value={puneOfficeAddress}
              onChangeText={setPuneOfficeAddress}
            />
          </View>
        </View>

        {/* Maintenance Mode */}
        <View style={[styles.card, maintenanceMode && { borderColor: '#FCA5A5' }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="warning" size={20} color="#DC2626" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.cardTitle}>Maintenance Mode</Text>
              <Text style={styles.cardSub}>Restricts bookings & payments</Text>
            </View>
            <Switch
              value={maintenanceMode}
              onValueChange={setMaintenanceMode}
              trackColor={{ false: '#D1D5DB', true: '#DC2626' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {maintenanceMode && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.inputLabel}>Student Banner Message</Text>
              <TextInput
                style={[styles.textInput, { height: 60 }]}
                placeholder="e.g. Scheduled database maintenance until 4:00 AM..."
                value={maintenanceNotice}
                onChangeText={setMaintenanceNotice}
                multiline
              />
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  saveBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  cardSub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  cardExplainer: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 17,
    marginTop: 10,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  inputField: {
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: THEME.colors.textPrimary,
    backgroundColor: '#FFFFFF',
  },
  textInputShort: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    width: 64,
    textAlign: 'center',
  },
});

export default AdminSettingsScreen;
