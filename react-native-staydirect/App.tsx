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

// Student Routes
import StudentHomeRoute from './app/(student)/index';
import StudentSearchRoute from './app/(student)/search';
import StudentSavedRoute from './app/(student)/saved';
import HostelDetailRoute from './app/hostel/[id]';
import { StudentBookingsScreen } from './src/screens/student/StudentBookingsScreen';
import { StudentProfileScreen } from './src/screens/student/StudentProfileScreen';

// Owner Routes (Phase 3)
import { OwnerDashboardScreen } from './app/(owner)/index';
import { OwnerListingsScreen } from './app/(owner)/listings';
import { OwnerInquiriesScreen } from './app/(owner)/inquiries';
import { OwnerProfileScreen } from './app/(owner)/profile';
import { AddHostelScreen } from './app/(owner)/add-hostel';
import { EditHostelScreen } from './app/(owner)/edit-hostel/[id]';

import { AuthModal } from './src/components/AuthModal';
import { Hostel } from './src/types/database.types';

const queryClient = new QueryClient();

type StudentTab = 'home' | 'search' | 'saved' | 'bookings' | 'profile';
type OwnerTab = 'dashboard' | 'listings' | 'inquiries' | 'profile';

function MainAppNavigation() {
  const { role, switchDevRole } = useAuth();

  // Student Navigation State
  const [studentTab, setStudentTab] = useState<StudentTab>('home');
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [searchParams, setSearchParams] = useState<{ query: string; area: string }>({
    query: '',
    area: 'All',
  });

  // Owner Navigation State (Phase 3)
  const [ownerTab, setOwnerTab] = useState<OwnerTab>('dashboard');
  const [isAddingHostel, setIsAddingHostel] = useState<boolean>(false);
  const [editingHostelId, setEditingHostelId] = useState<string | null>(null);

  const [isAuthModalVisible, setIsAuthModalVisible] = useState<boolean>(false);

  // OWNER EXPERIENCE (Phase 3)
  if (role === 'owner') {
    // 1. Add Hostel Screen
    if (isAddingHostel) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" backgroundColor={THEME.colors.primary} />
          <AddHostelScreen
            onSuccess={() => setIsAddingHostel(false)}
            onCancel={() => setIsAddingHostel(false)}
          />
        </SafeAreaView>
      );
    }

    // 2. Edit Hostel Screen
    if (editingHostelId) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" backgroundColor={THEME.colors.primary} />
          <EditHostelScreen
            hostelId={editingHostelId}
            onGoBack={() => setEditingHostelId(null)}
            onSaved={() => setEditingHostelId(null)}
          />
        </SafeAreaView>
      );
    }

    // 3. 4-Tab Owner Experience: Dashboard, My Listings, Inquiries, Profile
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.colors.primary} />

        {/* Content Area */}
        <View style={styles.contentArea}>
          {ownerTab === 'dashboard' && (
            <OwnerDashboardScreen
              onNavigateToAddHostel={() => setIsAddingHostel(true)}
              onNavigateToEditHostel={(id) => setEditingHostelId(id)}
              onNavigateToListings={() => setOwnerTab('listings')}
              onNavigateToInquiries={() => setOwnerTab('inquiries')}
              onNavigateToProfile={() => setOwnerTab('profile')}
            />
          )}

          {ownerTab === 'listings' && (
            <OwnerListingsScreen
              onNavigateToAddHostel={() => setIsAddingHostel(true)}
              onNavigateToEditHostel={(id) => setEditingHostelId(id)}
            />
          )}

          {ownerTab === 'inquiries' && <OwnerInquiriesScreen />}

          {ownerTab === 'profile' && (
            <OwnerProfileScreen
              onSwitchToStudentView={() => {
                switchDevRole('student');
                setStudentTab('home');
              }}
            />
          )}
        </View>

        {/* 4 Bottom Navigation Tabs for Owners */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setOwnerTab('dashboard')}
          >
            <Ionicons
              name={ownerTab === 'dashboard' ? 'grid' : 'grid-outline'}
              size={20}
              color={ownerTab === 'dashboard' ? THEME.colors.primary : THEME.colors.textMuted}
            />
            <Text
              style={[
                styles.navLabel,
                ownerTab === 'dashboard' && styles.navLabelActive,
              ]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setOwnerTab('listings')}
          >
            <Ionicons
              name={ownerTab === 'listings' ? 'business' : 'business-outline'}
              size={20}
              color={ownerTab === 'listings' ? THEME.colors.primary : THEME.colors.textMuted}
            />
            <Text
              style={[
                styles.navLabel,
                ownerTab === 'listings' && styles.navLabelActive,
              ]}
            >
              My Listings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setOwnerTab('inquiries')}
          >
            <Ionicons
              name={ownerTab === 'inquiries' ? 'chatbubbles' : 'chatbubbles-outline'}
              size={20}
              color={ownerTab === 'inquiries' ? THEME.colors.primary : THEME.colors.textMuted}
            />
            <Text
              style={[
                styles.navLabel,
                ownerTab === 'inquiries' && styles.navLabelActive,
              ]}
            >
              Inquiries
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setOwnerTab('profile')}
          >
            <Ionicons
              name={ownerTab === 'profile' ? 'person' : 'person-outline'}
              size={20}
              color={ownerTab === 'profile' ? THEME.colors.primary : THEME.colors.textMuted}
            />
            <Text
              style={[
                styles.navLabel,
                ownerTab === 'profile' && styles.navLabelActive,
              ]}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Auth Modal if needed */}
        <AuthModal
          visible={isAuthModalVisible}
          onClose={() => setIsAuthModalVisible(false)}
        />
      </SafeAreaView>
    );
  }

  // STUDENT EXPERIENCE (Phase 2)
  // Hostel Details View
  if (selectedHostel) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.colors.primary} />
        <HostelDetailRoute
          hostel={selectedHostel}
          onBack={() => setSelectedHostel(null)}
        />
      </SafeAreaView>
    );
  }

  // Navigate to search screen with preset filters
  const handleNavigateToSearch = (query: string = '', area: string = 'All') => {
    setSearchParams({ query, area });
    setStudentTab('search');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.primary} />

      {/* Screen Views */}
      <View style={styles.contentArea}>
        {studentTab === 'home' && (
          <StudentHomeRoute
            onSelectHostel={(h) => setSelectedHostel(h)}
            onNavigateToSearch={handleNavigateToSearch}
          />
        )}
        {studentTab === 'search' && (
          <StudentSearchRoute
            initialSearchQuery={searchParams.query}
            initialArea={searchParams.area}
            onSelectHostel={(h) => setSelectedHostel(h)}
          />
        )}
        {studentTab === 'saved' && (
          <StudentSavedRoute
            onSelectHostel={(h) => setSelectedHostel(h)}
            onExplore={() => setStudentTab('home')}
          />
        )}
        {studentTab === 'bookings' && (
          <StudentBookingsScreen onExplore={() => setStudentTab('home')} />
        )}
        {studentTab === 'profile' && (
          <StudentProfileScreen onOpenAuthModal={() => setIsAuthModalVisible(true)} />
        )}
      </View>

      {/* 5 Bottom Tabs for Students */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setStudentTab('home')}
        >
          <Ionicons
            name={studentTab === 'home' ? 'home' : 'home-outline'}
            size={21}
            color={studentTab === 'home' ? THEME.colors.primary : THEME.colors.textMuted}
          />
          <Text
            style={[
              styles.navLabel,
              studentTab === 'home' && styles.navLabelActive,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setStudentTab('search')}
        >
          <Ionicons
            name={studentTab === 'search' ? 'search' : 'search-outline'}
            size={21}
            color={studentTab === 'search' ? THEME.colors.primary : THEME.colors.textMuted}
          />
          <Text
            style={[
              styles.navLabel,
              studentTab === 'search' && styles.navLabelActive,
            ]}
          >
            Search
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setStudentTab('saved')}
        >
          <Ionicons
            name={studentTab === 'saved' ? 'heart' : 'heart-outline'}
            size={21}
            color={studentTab === 'saved' ? THEME.colors.primary : THEME.colors.textMuted}
          />
          <Text
            style={[
              styles.navLabel,
              studentTab === 'saved' && styles.navLabelActive,
            ]}
          >
            Saved
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setStudentTab('bookings')}
        >
          <Ionicons
            name={studentTab === 'bookings' ? 'receipt' : 'receipt-outline'}
            size={21}
            color={studentTab === 'bookings' ? THEME.colors.primary : THEME.colors.textMuted}
          />
          <Text
            style={[
              styles.navLabel,
              studentTab === 'bookings' && styles.navLabelActive,
            ]}
          >
            Bookings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setStudentTab('profile')}
        >
          <Ionicons
            name={studentTab === 'profile' ? 'person' : 'person-outline'}
            size={21}
            color={studentTab === 'profile' ? THEME.colors.primary : THEME.colors.textMuted}
          />
          <Text
            style={[
              styles.navLabel,
              studentTab === 'profile' && styles.navLabelActive,
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
    paddingVertical: 7,
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
