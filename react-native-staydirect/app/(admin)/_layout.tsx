import React from 'react';
import { Stack } from 'expo-router';
import { THEME } from '../../src/constants/theme';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0F172A',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Admin Control Panel',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="verifications"
        options={{
          title: 'Owner Verifications',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="listings"
        options={{
          title: 'Listing Moderation',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="users"
        options={{
          title: 'User Management',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="reports"
        options={{
          title: 'Reports & Flags',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
