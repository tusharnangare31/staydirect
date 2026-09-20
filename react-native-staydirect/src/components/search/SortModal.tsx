import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { SearchSortOption } from '../../types/database.types';

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  selectedSort: SearchSortOption;
  onSelectSort: (sort: SearchSortOption) => void;
}

const SORT_OPTIONS: { id: SearchSortOption; label: string; sub: string; icon: any }[] = [
  {
    id: 'relevance',
    label: 'Best Match (Relevance)',
    sub: 'Balanced score of location, price, and verification',
    icon: 'sparkles-outline',
  },
  {
    id: 'price_asc',
    label: 'Lowest Rent First',
    sub: 'Budget friendly options starting from low rent',
    icon: 'arrow-down-outline',
  },
  {
    id: 'price_desc',
    label: 'Highest Rent First',
    sub: 'Premium private and luxury student residences',
    icon: 'arrow-up-outline',
  },
  {
    id: 'rating',
    label: 'Highest Rating',
    sub: 'Top rated 4.8+ stars by verified Pune students',
    icon: 'star-outline',
  },
  {
    id: 'most_reviewed',
    label: 'Most Reviewed',
    sub: 'Hostels with the highest verified student review volume',
    icon: 'chatbubbles-outline',
  },
  {
    id: 'newest',
    label: 'Recently Added',
    sub: 'Latest verified hostels and newly listed beds in Pune',
    icon: 'time-outline',
  },
  {
    id: 'fast_response',
    label: 'Fastest Owner Response',
    sub: 'Owners who reply to student inquiries in under 1 hour',
    icon: 'flash-outline',
  },
  {
    id: 'popular',
    label: 'Most Popular',
    sub: 'Most booked and favorited by college students',
    icon: 'flame-outline',
  },
];

export const SortModal: React.FC<SortModalProps> = ({
  visible,
  onClose,
  selectedSort,
  onSelectSort,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.dragIndicator} />

              <View style={styles.header}>
                <Text style={styles.title}>Sort Hostels</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={20} color={THEME.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.optionsList}>
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = selectedSort === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                      onPress={() => {
                        onSelectSort(opt.id);
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}>
                        <Ionicons
                          name={opt.icon}
                          size={18}
                          color={isSelected ? THEME.colors.primary : THEME.colors.textSecondary}
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                          {opt.label}
                        </Text>
                        <Text style={styles.optionSub}>{opt.sub}</Text>
                      </View>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 28,
    paddingHorizontal: 16,
    maxHeight: '85%',
  },
  dragIndicator: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  optionsList: {
    marginTop: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  optionRowSelected: {
    backgroundColor: '#F0F9FF',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapSelected: {
    backgroundColor: '#E0F2FE',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  optionLabelSelected: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  optionSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  radioCircleSelected: {
    borderColor: THEME.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.colors.primary,
  },
});
