import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from './src/constants/theme';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { StudentHomeScreen } from './src/screens/student/StudentHomeScreen';
import { HostelDetailScreen } from './src/screens/student/HostelDetailScreen';
import { StudentBookingsScreen } from './src/screens/student/StudentBookingsScreen';
import { StudentFavoritesScreen } from './src/screens/student/StudentFavoritesScreen';
import { StudentProfileScreen } from './src/screens/student/StudentProfileScreen';
import { OwnerDashboardScreen } from './src/screens/owner/OwnerDashboardScreen';
import { AddHostelScreen } from './src/screens/owner/AddHostelScreen';
import { AuthModal } from './src/components/AuthModal';
import { Hostel } from './src/types/database.types';

const queryClient = new QueryClient();

type StudentTab = 'explore' | 'saved' | 'bookings' | 'profile';

function MainAppNavigation() {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<StudentTab>('explore');
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [isAddingHostel, setIsAddingHostel] = useState(false);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);

  // OWNER MODE
  if (role === 'owner') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.colors.primary} />
        {isAddingHostel ? (
          <AddHostelScreen
            onBack={() => setIsAddingHostel(false)}
            onSuccess={() => setIsAddingHostel(false)}
          />
        ) : (
          <OwnerDashboardScreen onAddNewHostel={() => setIsAddingHostel(true)} />
        )}
      </SafeAreaView>
    );
  }

  // STUDENT MODE: If hostel selected, show detail screen
  if (selectedHostel) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.colors.primary} />
        <HostelDetailScreen
          hostel={selectedHostel}
          onBack={() => setSelectedHostel(null)}
        />
      </SafeAreaView>
    );
  }

  // STUDENT MODE: Tab Views
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.primary} />

      {/* Screen Views */}
      <View style={styles.contentArea}>
        {activeTab === 'explore' && (
          <StudentHomeScreen onSelectHostel={(h) => setSelectedHostel(h)} />
        )}
        {activeTab === 'saved' && (
          <StudentFavoritesScreen
            onSelectHostel={(h) => setSelectedHostel(h)}
            onExplore={() => setActiveTab('explore')}
          />
        )}
        {activeTab === 'bookings' && (
          <StudentBookingsScreen onExplore={() => setActiveTab('explore')} />
        )}
        {activeTab === 'profile' && (
          <StudentProfileScreen onOpenAuthModal={() => setIsAuthModalVisible(true)} />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('explore')}
        >
          <Ionicons
            name={activeTab === 'explore' ? 'search' : 'search-outline'}
            size={22}
            color={activeTab === 'explore' ? THEME.colors.primary : THEME.colors.textMuted}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'explore' && styles.navLabelActive,
            ]}
          >
            Explore
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('saved')}
        >
          <Ionicons
            name={activeTab === 'saved' ? 'heart' : 'heart-outline'}
            size={22}
            color={activeTab === 'saved' ? THEME.colors.primary : THEME.colors.textMuted}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'saved' && styles.navLabelActive,
            ]}
          >
            Saved
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('bookings')}
        >
          <Ionicons
            name={activeTab === 'bookings' ? 'receipt' : 'receipt-outline'}
            size={22}
            color={activeTab === 'bookings' ? THEME.colors.primary : THEME.colors.textMuted}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'bookings' && styles.navLabelActive,
            ]}
          >
            Bookings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={22}
            color={activeTab === 'profile' ? THEME.colors.primary : THEME.colors.textMuted}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'profile' && styles.navLabelActive,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Auth Modal */}
      <AuthModal
        visible={isAuthModalVisible}
        onClose={() => setIsAuthModalVisible(false)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MainAppNavigation />
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.primary,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  contentArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    ...THEME.shadows.medium,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  navLabelActive: {
    color: THEME.colors.primary,
    fontWeight: '800',
  },
});
