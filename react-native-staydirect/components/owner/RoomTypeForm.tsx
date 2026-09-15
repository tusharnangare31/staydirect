import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, formatIndianRupees } from '../../src/constants/theme';
import { AppInput } from '../ui/AppInput';
import { AppButton } from '../ui/AppButton';

export interface RoomEntry {
  id?: string;
  room_type: string;
  monthly_rent: number;
  security_deposit?: number;
  total_beds: number;
  available_beds: number;
  has_ac?: boolean;
  has_attached_washroom?: boolean;
}

export interface RoomTypeFormProps {
  rooms: RoomEntry[];
  onChange: (updatedRooms: RoomEntry[]) => void;
}

const ROOM_OPTIONS = [
  'Single Sharing',
  'Double Sharing',
  'Triple Sharing',
  'Four Sharing',
];

export const RoomTypeForm: React.FC<RoomTypeFormProps> = ({ rooms, onChange }) => {
  const [selectedType, setSelectedType] = useState<string>('Double Sharing');
  const [rentInput, setRentInput] = useState<string>('8500');
  const [depositInput, setDepositInput] = useState<string>('15000');
  const [totalBedsInput, setTotalBedsInput] = useState<string>('6');
  const [availableBedsInput, setAvailableBedsInput] = useState<string>('2');
  const [hasAc, setHasAc] = useState<boolean>(false);
  const [hasWashroom, setHasWashroom] = useState<boolean>(true);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddOrUpdateRoom = () => {
    const rent = parseInt(rentInput, 10);
    const deposit = parseInt(depositInput, 10) || 0;
    const totalBeds = parseInt(totalBedsInput, 10);
    const availableBeds = parseInt(availableBedsInput, 10);

    if (isNaN(rent) || rent <= 0) {
      Alert.alert('Invalid Rent', 'Please enter a valid monthly rent amount in rupees.');
      return;
    }
    if (isNaN(totalBeds) || totalBeds <= 0) {
      Alert.alert('Invalid Beds', 'Total beds must be at least 1.');
      return;
    }
    if (isNaN(availableBeds) || availableBeds < 0 || availableBeds > totalBeds) {
      Alert.alert('Invalid Vacant Beds', 'Available beds must be between 0 and total beds.');
      return;
    }

    const newRoom: RoomEntry = {
      room_type: selectedType,
      monthly_rent: rent,
      security_deposit: deposit,
      total_beds: totalBeds,
      available_beds: availableBeds,
      has_ac: hasAc,
      has_attached_washroom: hasWashroom,
    };

    if (editingIndex !== null) {
      const updated = [...rooms];
      updated[editingIndex] = { ...updated[editingIndex], ...newRoom };
      onChange(updated);
      setEditingIndex(null);
    } else {
      onChange([...rooms, newRoom]);
    }

    // Reset default for next entry
    setRentInput('8000');
    setDepositInput('15000');
    setTotalBedsInput('4');
    setAvailableBedsInput('2');
  };

  const handleEditRoom = (index: number) => {
    const r = rooms[index];
    setSelectedType(r.room_type);
    setRentInput(String(r.monthly_rent));
    setDepositInput(String(r.security_deposit || 0));
    setTotalBedsInput(String(r.total_beds));
    setAvailableBedsInput(String(r.available_beds));
    setHasAc(!!r.has_ac);
    setHasWashroom(!!r.has_attached_washroom);
    setEditingIndex(index);
  };

  const handleDeleteRoom = (index: number) => {
    Alert.alert('Remove Room Configuration', 'Delete this room type entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = [...rooms];
          updated.splice(index, 1);
          onChange(updated);
          if (editingIndex === index) {
            setEditingIndex(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Room Configurations & Vacancies <Text style={styles.requiredStar}>*</Text>
      </Text>
      <Text style={styles.helperText}>
        Specify each room sharing type, monthly pricing, total bed capacity, and available beds.
      </Text>

      {/* Existing Configured Rooms List */}
      {rooms.length > 0 && (
        <View style={styles.roomsList}>
          {rooms.map((room, idx) => (
            <View key={idx} style={styles.roomCard}>
              <View style={styles.roomCardTop}>
                <View>
                  <Text style={styles.roomTypeTitle}>{room.room_type}</Text>
                  <Text style={styles.roomPrice}>
                    {formatIndianRupees(room.monthly_rent)}/mo
                    {room.security_deposit ? (
                      <Text style={styles.depositText}>
                        {' '}
                        • Dep: {formatIndianRupees(room.security_deposit)}
                      </Text>
                    ) : null}
                  </Text>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.cardActionBtn}
                    onPress={() => handleEditRoom(idx)}
                  >
                    <Ionicons name="pencil" size={14} color={THEME.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cardActionBtn, styles.deleteCardActionBtn]}
                    onPress={() => handleDeleteRoom(idx)}
                  >
                    <Ionicons name="trash" size={14} color={THEME.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.roomCardBottom}>
                <View style={styles.badgePill}>
                  <Ionicons name="bed-outline" size={12} color={THEME.colors.textSecondary} />
                  <Text style={styles.badgePillText}>
                    {room.available_beds} of {room.total_beds} beds free
                  </Text>
                </View>

                {room.has_ac && (
                  <View style={[styles.badgePill, styles.featurePill]}>
                    <Text style={styles.featurePillText}>AC</Text>
                  </View>
                )}

                {room.has_attached_washroom && (
                  <View style={[styles.badgePill, styles.featurePill]}>
                    <Text style={styles.featurePillText}>Attach Bath</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Add / Edit Form Card */}
      <View style={styles.formBox}>
        <Text style={styles.formBoxTitle}>
          {editingIndex !== null ? 'Edit Room Type' : 'Add Room Configuration'}
        </Text>

        {/* Room Type Selector Chips */}
        <Text style={styles.miniLabel}>Sharing Type</Text>
        <View style={styles.chipRow}>
          {ROOM_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.chip,
                selectedType === opt && styles.chipSelected,
              ]}
              onPress={() => setSelectedType(opt)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedType === opt && styles.chipTextSelected,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rent & Deposit Inputs */}
        <View style={styles.rowInputs}>
          <View style={styles.flexHalf}>
            <AppInput
              label="Monthly Rent (₹)"
              prefix="₹"
              keyboardType="numeric"
              value={rentInput}
              onChangeText={setRentInput}
              placeholder="e.g. 8000"
              required
            />
          </View>
          <View style={styles.flexHalf}>
            <AppInput
              label="Deposit (₹)"
              prefix="₹"
              keyboardType="numeric"
              value={depositInput}
              onChangeText={setDepositInput}
              placeholder="e.g. 15000"
            />
          </View>
        </View>

        {/* Beds & Vacancies */}
        <View style={styles.rowInputs}>
          <View style={styles.flexHalf}>
            <AppInput
              label="Total Beds"
              keyboardType="numeric"
              value={totalBedsInput}
              onChangeText={setTotalBedsInput}
              placeholder="e.g. 6"
              required
            />
          </View>
          <View style={styles.flexHalf}>
            <AppInput
              label="Available / Vacant"
              keyboardType="numeric"
              value={availableBedsInput}
              onChangeText={setAvailableBedsInput}
              placeholder="e.g. 2"
              required
            />
          </View>
        </View>

        {/* Room Feature Toggles */}
        <View style={styles.togglesRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, hasAc && styles.toggleBtnActive]}
            onPress={() => setHasAc(!hasAc)}
          >
            <Ionicons
              name={hasAc ? 'checkbox' : 'square-outline'}
              size={16}
              color={hasAc ? THEME.colors.primary : THEME.colors.textMuted}
            />
            <Text style={[styles.toggleBtnText, hasAc && styles.toggleBtnTextActive]}>
              Air Conditioned
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, hasWashroom && styles.toggleBtnActive]}
            onPress={() => setHasWashroom(!hasWashroom)}
          >
            <Ionicons
              name={hasWashroom ? 'checkbox' : 'square-outline'}
              size={16}
              color={hasWashroom ? THEME.colors.primary : THEME.colors.textMuted}
            />
            <Text style={[styles.toggleBtnText, hasWashroom && styles.toggleBtnTextActive]}>
              Attached Washroom
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonActionRow}>
          {editingIndex !== null && (
            <TouchableOpacity
              style={styles.cancelEditBtn}
              onPress={() => setEditingIndex(null)}
            >
              <Text style={styles.cancelEditText}>Cancel</Text>
            </TouchableOpacity>
          )}

          <AppButton
            title={editingIndex !== null ? 'Update Room' : '+ Add Room Type'}
            onPress={handleAddOrUpdateRoom}
            variant="secondary"
            size="md"
            fullWidth={editingIndex === null}
            style={editingIndex !== null ? { flex: 1 } : undefined}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  requiredStar: {
    color: THEME.colors.error,
  },
  helperText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 14,
    lineHeight: 16,
  },
  roomsList: {
    marginBottom: 16,
    gap: 10,
  },
  roomCard: {
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.soft,
  },
  roomCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roomTypeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  roomPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.primary,
    marginTop: 2,
  },
  depositText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
  },
  cardActionBtn: {
    padding: 6,
    backgroundColor: THEME.colors.secondary,
    borderRadius: 6,
  },
  deleteCardActionBtn: {
    backgroundColor: '#FEE2E2',
  },
  roomCardBottom: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  featurePill: {
    backgroundColor: '#EBF6EC',
  },
  featurePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  formBox: {
    backgroundColor: '#FAFDF9',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
    padding: 14,
  },
  formBoxTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginBottom: 10,
  },
  miniLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  chipSelected: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primaryDark,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  chipTextSelected: {
    color: THEME.colors.white,
    fontWeight: '700',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  flexHalf: {
    flex: 1,
  },
  togglesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  toggleBtnActive: {},
  toggleBtnText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  toggleBtnTextActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  buttonActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cancelEditBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cancelEditText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
});
