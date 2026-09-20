/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Hostel, UserRole, UserProfile, Inquiry } from './types';
import {
  INITIAL_HOSTELS,
  INITIAL_AREAS,
  INITIAL_INQUIRIES,
  DEFAULT_STUDENT_PROFILE,
  DEFAULT_OWNER_PROFILE,
} from './data/mockData';

// Components
import { Header } from './components/Header';
import { NavigationDrawer } from './components/NavigationDrawer';
import { BottomNav } from './components/BottomNav';
import { StudentHomeView } from './components/StudentHomeView';
import { SearchHostelsView } from './components/SearchHostelsView';
import { HostelDetailsModal } from './components/HostelDetailsModal';
import { OwnerHomeView } from './components/OwnerHomeView';
import { OwnerListingsView } from './components/OwnerListingsView';
import { OwnerInquiriesView } from './components/OwnerInquiriesView';
import { AddHostelView } from './components/AddHostelView';
import { StudentProfileView } from './components/StudentProfileView';
import { SavedHostelsView } from './components/SavedHostelsView';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { LandingView } from './components/LandingView';
import { ChatView } from './components/ChatView';
import { AboutView } from './components/AboutView';
import { HelpSupportView } from './components/HelpSupportView';
import { InteractiveMapView } from './components/InteractiveMapView';
import { FilterModal } from './components/FilterModal';
import { NotificationsModal } from './components/NotificationsModal';
import { PWAInstallBar } from './components/PWAInstallBar';
import { MobileAppModal } from './components/MobileAppModal';
import { MobileDeviceSimulator } from './components/MobileDeviceSimulator';
import { LocationDrawer } from './components/LocationDrawer';
import { Footer } from './components/Footer';

export default function App() {
  // Application State
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [currentScreen, setCurrentScreen] = useState<string>('student-home');
  const [screenHistory, setScreenHistory] = useState<string[]>(['student-home']);
  const [isMobileAppModalOpen, setIsMobileAppModalOpen] = useState(false);
  const [isLocationDrawerOpen, setIsLocationDrawerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('Kothrud');
  const [isMobileFrameActive, setIsMobileFrameActive] = useState<boolean>(false);

  // Data State
  const [hostels, setHostels] = useState<Hostel[]>(INITIAL_HOSTELS);
  const [areas] = useState(INITIAL_AREAS);
  const [inquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);
  const [savedHostelIds, setSavedHostelIds] = useState<Set<string>>(
    new Set(['sunrise-pg', 'city-stay-pg'])
  );
  const [studentProfile, setStudentProfile] = useState<UserProfile>(DEFAULT_STUDENT_PROFILE);
  const [ownerProfile] = useState<UserProfile>(DEFAULT_OWNER_PROFILE);

  // Active Selected Items
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [chatHostel, setChatHostel] = useState<Hostel | undefined>(INITIAL_HOSTELS[0]);
  const [chatRecipientName, setChatRecipientName] = useState('Sunil Patil');
  const [chatRecipientRole, setChatRecipientRole] = useState('Owner, Sunrise PG');
  const [searchInitialQuery, setSearchInitialQuery] = useState('Hinjewadi, Pune');
  const [searchInitialCategory, setSearchInitialCategory] = useState('all');
  const [activeMapArea, setActiveMapArea] = useState('Hinjewadi');

  // Modal Visibility
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Navigation Helper
  const navigateTo = (screen: string) => {
    setScreenHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (screenHistory.length > 1) {
      const nextHistory = [...screenHistory];
      nextHistory.pop();
      const previousScreen = nextHistory[nextHistory.length - 1];
      setScreenHistory(nextHistory);
      setCurrentScreen(previousScreen);
    } else {
      navigateTo(userRole === 'student' ? 'student-home' : 'owner-home');
    }
  };

  const handleToggleRole = () => {
    const nextRole: UserRole = userRole === 'student' ? 'owner' : 'student';
    setUserRole(nextRole);
    if (nextRole === 'owner') {
      navigateTo('owner-home');
    } else {
      navigateTo('student-home');
    }
  };

  const handleToggleSave = (id: string) => {
    setSavedHostelIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  // Chat Launcher
  const handleOpenDirectChat = (hostel: Hostel) => {
    setChatHostel(hostel);
    setChatRecipientName(hostel.owner.name);
    setChatRecipientRole(`Owner, ${hostel.name}`);
    navigateTo('chat');
  };

  const handleOpenChatWithStudent = (inq: Inquiry) => {
    setChatRecipientName(inq.studentName);
    setChatRecipientRole(`Student • Interested in ${inq.hostelName}`);
    navigateTo('chat');
  };

  // Map Launcher
  const handleOpenMap = (areaName = 'Hinjewadi') => {
    setActiveMapArea(areaName);
    navigateTo('map');
  };

  // Search Launcher
  const handleNavigateToSearch = (query = '', category = 'all') => {
    setSearchInitialQuery(query || 'Hinjewadi, Pune');
    setSearchInitialCategory(category || 'all');
    navigateTo('search');
  };

  // Add Hostel Publish Handler
  const handlePublishHostel = (newHostelData: Partial<Hostel>) => {
    const newHostel: Hostel = {
      id: `hostel-${Date.now()}`,
      name: newHostelData.name || 'New Pune PG',
      area: newHostelData.area || 'Hinjewadi',
      fullAddress: newHostelData.fullAddress || 'Hinjewadi, Pune',
      monthlyRent: newHostelData.monthlyRent || 8000,
      rating: 4.8,
      reviewCount: 1,
      category: 'PG',
      gender: 'Boys',
      roomTypeTag: 'Single & Twin',
      distanceTag: '200m from Bus Stop',
      imageUrl:
        newHostelData.imageUrl ||
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD1KkFT9k3kOXuW6VgmXM000pzW2PqIyvkF_Bx3pT5_qCPMjBmTbLWcffGZS1ZiG6BA3RqQDU-myVh2IQpGxvVrSlGO6emRMYV8pJYcCMBtO3XVtaQiGARUMRKHAlFPMZdyGrb16xDW6RC2Ucmvz0htylnCJsf6-fVEFQX17CZ2MqzJ6G6Tic_9sLZ3Tc-dC9jTUcqjR9lngRe2suIH4k6cpeKcXBqfEGOJJBPfl2kUsFhgsJgOVrDw',
      galleryImages: newHostelData.galleryImages || [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD1KkFT9k3kOXuW6VgmXM000pzW2PqIyvkF_Bx3pT5_qCPMjBmTbLWcffGZS1ZiG6BA3RqQDU-myVh2IQpGxvVrSlGO6emRMYV8pJYcCMBtO3XVtaQiGARUMRKHAlFPMZdyGrb16xDW6RC2Ucmvz0htylnCJsf6-fVEFQX17CZ2MqzJ6G6Tic_9sLZ3Tc-dC9jTUcqjR9lngRe2suIH4k6cpeKcXBqfEGOJJBPfl2kUsFhgsJgOVrDw',
      ],
      description: newHostelData.description || 'Verified student hostel in Pune with 0% brokerage.',
      amenities: newHostelData.amenities || ['Free Wi-Fi', '3 Meals Included', 'Laundry Service'],
      verified: true,
      zeroBrokerage: true,
      instantVisit: true,
      isActive: true,
      owner: {
        id: 'owner-me',
        name: ownerProfile.name,
        phone: ownerProfile.phone,
        avatarUrl: ownerProfile.avatarUrl,
        responseTime: 'Responds in ~5 mins',
        tagline: 'Pune Native • Direct Verified Owner',
      },
      occupancies: [
        { type: 'Single Room', price: (newHostelData.monthlyRent || 8000) + 2000, left: 2, details: 'Attached Bath & Balcony' },
        { type: 'Twin Sharing', price: newHostelData.monthlyRent || 8000, left: 4, details: 'Spacious with Wardrobe' },
      ],
      policies: ['Gate closes at 10:30 PM', 'Strictly non-smoking', '1 month refundable deposit'],
    };

    setHostels((prev) => [newHostel, ...prev]);
    setTimeout(() => {
      navigateTo('owner-listings');
    }, 800);
  };

  const handleToggleHostelActive = (id: string) => {
    setHostels((prev) =>
      prev.map((h) => (h.id === id ? { ...h, isActive: h.isActive === false ? true : false } : h))
    );
  };

  // Determine current screen title
  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'student-home':
        return 'Home Feed';
      case 'owner-home':
        return 'Owner Hub';
      case 'search':
        return 'Search Hostels';
      case 'saved':
        return 'Saved Hostels';
      case 'profile':
        return 'My Profile';
      case 'owner-listings':
        return 'My Listings';
      case 'owner-inquiries':
        return 'Student Inquiries';
      case 'add-hostel':
        return 'Add Hostel';
      case 'chat':
        return 'Chat Direct';
      case 'about':
        return 'About StayDirect';
      case 'help':
        return 'Help & Support';
      case 'map':
        return 'Pune Map Explorer';
      case 'login':
        return 'Log In';
      case 'register':
        return 'Create Account';
      case 'landing':
        return 'Welcome to StayDirect';
      default:
        return 'StayDirect';
    }
  };

  const isFullScreenView =
    currentScreen === 'landing' ||
    currentScreen === 'login' ||
    currentScreen === 'register';

  const hideBottomNav =
    isFullScreenView ||
    currentScreen === 'chat' ||
    currentScreen === 'map';

  const shouldShowBack =
    currentScreen !== 'student-home' &&
    currentScreen !== 'owner-home' &&
    currentScreen !== 'landing';

  const savedHostelsList = hostels.filter((h) => savedHostelIds.has(h.id));

  const appLayout = (
    <div
      className={`min-h-screen bg-[#F8F7F1] text-[#111C2D] font-sans antialiased selection:bg-[#DDE9D5] selection:text-[#173B2C] flex flex-col ${
        isMobileFrameActive ? 'w-full' : ''
      }`}
    >
      {/* Top Application Header (Hidden on standalone login/onboarding) */}
      {!isFullScreenView && (
        <Header
          title={getScreenTitle()}
          userRole={userRole}
          onToggleRole={handleToggleRole}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => navigateTo('profile')}
          onOpenLocationDrawer={() => setIsLocationDrawerOpen(true)}
          selectedLocation={selectedLocation}
          onNavigate={navigateTo}
          savedCount={savedHostelIds.size}
          onBack={handleBack}
          showBack={shouldShowBack}
        />
      )}

      {/* Main Content Viewport */}
      <main
        className={`w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 ${
          isFullScreenView
            ? 'pt-4'
            : isMobileFrameActive
            ? 'pt-3'
            : 'pt-4 sm:pt-6'
        } ${!hideBottomNav && !isMobileFrameActive ? 'pb-20 md:pb-6' : 'pb-6'}`}
      >
        {currentScreen === 'student-home' && (
          <StudentHomeView
            hostels={hostels}
            areas={areas}
            savedHostelIds={savedHostelIds}
            onToggleSave={handleToggleSave}
            onSelectHostel={(h) => setSelectedHostel(h)}
            onSelectArea={(areaName) => {
              setSelectedLocation(areaName);
              handleNavigateToSearch(areaName);
            }}
            onNavigateToSearch={handleNavigateToSearch}
            onOpenDirectChat={handleOpenDirectChat}
            onOpenFilter={() => setIsFilterModalOpen(true)}
            selectedLocation={selectedLocation}
            onOpenLocationDrawer={() => setIsLocationDrawerOpen(true)}
            onOpenSavedModal={() => navigateTo('saved')}
          />
        )}

        {currentScreen === 'search' && (
          <SearchHostelsView
            hostels={hostels}
            initialQuery={searchInitialQuery}
            initialCategory={searchInitialCategory}
            savedHostelIds={savedHostelIds}
            onToggleSave={handleToggleSave}
            onSelectHostel={(h) => setSelectedHostel(h)}
            onOpenMap={handleOpenMap}
            onOpenFilter={() => setIsFilterModalOpen(true)}
          />
        )}

        {currentScreen === 'saved' && (
          <SavedHostelsView
            savedHostels={savedHostelsList}
            onSelectHostel={(h) => setSelectedHostel(h)}
            onRemoveSave={handleToggleSave}
            onNavigateToSearch={() => navigateTo('search')}
          />
        )}

        {currentScreen === 'profile' && (
          <StudentProfileView
            profile={userRole === 'student' ? studentProfile : ownerProfile}
            savedCount={savedHostelIds.size}
            userRole={userRole}
            onToggleRole={handleToggleRole}
            onNavigateTo={navigateTo}
            onLogout={() => navigateTo('login')}
          />
        )}

        {currentScreen === 'owner-home' && (
          <OwnerHomeView
            inquiries={inquiries}
            hostels={hostels}
            onAddNewHostel={() => navigateTo('add-hostel')}
            onOpenChatWithStudent={handleOpenChatWithStudent}
            onViewAllInquiries={() => navigateTo('owner-inquiries')}
            onViewAllListings={() => navigateTo('owner-listings')}
          />
        )}

        {currentScreen === 'owner-listings' && (
          <OwnerListingsView
            hostels={hostels}
            onAddNewHostel={() => navigateTo('add-hostel')}
            onEditHostel={(h) => {
              setSelectedHostel(h);
            }}
            onViewLive={(h) => setSelectedHostel(h)}
            onToggleActive={handleToggleHostelActive}
          />
        )}

        {currentScreen === 'owner-inquiries' && (
          <OwnerInquiriesView
            inquiries={inquiries}
            onOpenChat={handleOpenChatWithStudent}
          />
        )}

        {currentScreen === 'add-hostel' && (
          <AddHostelView
            onPublish={handlePublishHostel}
            onCancel={() => navigateTo('owner-listings')}
          />
        )}

        {currentScreen === 'landing' && (
          <LandingView
            onGetStarted={() => navigateTo('student-home')}
            onLogin={() => navigateTo('login')}
          />
        )}

        {currentScreen === 'login' && (
          <LoginView
            onLogin={(_, role) => {
              setUserRole(role);
              navigateTo(role === 'student' ? 'student-home' : 'owner-home');
            }}
            onNavigateToRegister={() => navigateTo('register')}
            onContinueAsGuest={() => navigateTo('student-home')}
          />
        )}

        {currentScreen === 'register' && (
          <RegisterView
            onRegister={(name, email, role) => {
              setUserRole(role);
              if (role === 'student') {
                setStudentProfile((p) => ({ ...p, name, email }));
                navigateTo('student-home');
              } else {
                navigateTo('owner-home');
              }
            }}
            onNavigateToLogin={() => navigateTo('login')}
          />
        )}

        {currentScreen === 'chat' && (
          <ChatView
            hostel={chatHostel}
            recipientName={chatRecipientName}
            recipientRole={chatRecipientRole}
            onBack={handleBack}
          />
        )}

        {currentScreen === 'about' && <AboutView onBack={handleBack} />}

        {currentScreen === 'help' && <HelpSupportView onBack={handleBack} />}

        {currentScreen === 'map' && (
          <InteractiveMapView
            hostels={hostels}
            initialArea={activeMapArea}
            onSelectHostel={(h) => setSelectedHostel(h)}
            onBack={handleBack}
          />
        )}
      </main>

      {/* Floating Bottom Navigation Bar */}
      {!hideBottomNav && (
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={navigateTo}
          userRole={userRole}
          savedCount={savedHostelIds.size}
          unreadInquiriesCount={3}
          isEmbedded={isMobileFrameActive}
        />
      )}

      {/* Side Navigation Drawer (Screen 10) */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeScreen={currentScreen}
        onNavigate={navigateTo}
        userRole={userRole}
        onToggleRole={handleToggleRole}
        onOpenAppModal={() => setIsMobileAppModalOpen(true)}
      />

      {/* Hostel Details View Modal (Screen 8) */}
      {selectedHostel && (
        <HostelDetailsModal
          hostel={selectedHostel}
          onClose={() => setSelectedHostel(null)}
          isSaved={savedHostelIds.has(selectedHostel.id)}
          onToggleSave={handleToggleSave}
          onOpenDirectChat={(h) => {
            setSelectedHostel(null);
            handleOpenDirectChat(h);
          }}
          onOpenMap={(area) => {
            setSelectedHostel(null);
            handleOpenMap(area);
          }}
        />
      )}

      {/* Quick Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(filters) => {
          console.log('Filters applied:', filters);
          navigateTo('search');
        }}
      />

      {/* Notifications Drawer/Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Swiggy Footer */}
      {!isFullScreenView && (
        <Footer
          onNavigate={navigateTo}
          onSelectArea={(area) => {
            setSelectedLocation(area);
            handleNavigateToSearch(area);
          }}
        />
      )}

      {/* Swiggy Location Drawer */}
      <LocationDrawer
        isOpen={isLocationDrawerOpen}
        onClose={() => setIsLocationDrawerOpen(false)}
        selectedLocation={selectedLocation}
        onSelectLocation={(loc) => {
          setSelectedLocation(loc);
        }}
      />

      {/* PWA Floating Install & Offline Alert Bar */}
      <PWAInstallBar onOpenAppModal={() => setIsMobileAppModalOpen(true)} />

      {/* Mobile App Install & Native APK Modal */}
      <MobileAppModal
        isOpen={isMobileAppModalOpen}
        onClose={() => setIsMobileAppModalOpen(false)}
        isMobileFrameActive={isMobileFrameActive}
        onToggleMobileFrame={() => setIsMobileFrameActive((prev) => !prev)}
      />
    </div>
  );

  if (isMobileFrameActive) {
    return (
      <MobileDeviceSimulator
        userRole={userRole}
        onToggleRole={handleToggleRole}
        currentScreen={currentScreen}
        onNavigate={navigateTo}
        onCloseSimulator={() => setIsMobileFrameActive(false)}
        onOpenAppModal={() => setIsMobileAppModalOpen(true)}
      >
        {appLayout}
      </MobileDeviceSimulator>
    );
  }

  return appLayout;
}
