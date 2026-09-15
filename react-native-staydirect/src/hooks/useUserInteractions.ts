import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Booking, Favorite, Inquiry } from '../types/database.types';

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ['favorites', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select('*, hostel:hostels(*, images:hostel_images(*))')
        .eq('student_id', user.id);

      if (error) return [];
      return (data || []) as Favorite[];
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ hostelId, isFavorited }: { hostelId: string; isFavorited: boolean }) => {
      if (!user?.id) throw new Error('Please login to save favorites');

      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('student_id', user.id)
          .eq('hostel_id', hostelId);
      } else {
        await supabase
          .from('favorites')
          .insert({ student_id: user.id, hostel_id: hostelId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  return {
    ...favoritesQuery,
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
  };
}

export function useStudentBookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ['student-bookings', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select('*, hostel:hostels(*, images:hostel_images(*)), room:rooms(*)')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) return [];
      return (data || []) as Booking[];
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: {
      hostel_id: string;
      owner_id: string;
      room_id?: string;
      move_in_date: string;
      duration_months: number;
      sharing_type: string;
      monthly_rent: number;
      security_deposit: number;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('Must be logged in to book a room');

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...bookingData,
          student_id: user.id,
          brokerage_fee: 0, // Always ZERO brokerage
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-bookings'] });
    },
  });

  return {
    ...bookingsQuery,
    createBooking: createBookingMutation.mutateAsync,
  };
}

export function useStudentInquiries() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const inquiriesQuery = useQuery({
    queryKey: ['student-inquiries', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('inquiries')
        .select('*, hostel:hostels(*, images:hostel_images(*)), owner:profiles(*)')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) return [];
      return (data || []) as Inquiry[];
    },
  });

  const createInquiryMutation = useMutation({
    mutationFn: async (inquiryData: {
      hostel_id: string;
      owner_id: string;
      preferred_sharing?: string;
      visit_date?: string;
      visit_time?: string;
      message?: string;
    }) => {
      if (!user?.id) throw new Error('Must be logged in to schedule a visit');

      const { data, error } = await supabase
        .from('inquiries')
        .insert({
          ...inquiryData,
          student_id: user.id,
          status: 'new',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-inquiries'] });
    },
  });

  return {
    ...inquiriesQuery,
    createInquiry: createInquiryMutation.mutateAsync,
  };
}

// OWNER SPECIFIC HOOKS
export function useOwnerData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const ownerHostelsQuery = useQuery({
    queryKey: ['owner-hostels', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('hostels')
        .select('*, images:hostel_images(*), rooms:rooms(*)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) return [];
      return data;
    },
  });

  const ownerBookingsQuery = useQuery({
    queryKey: ['owner-bookings', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select('*, student:profiles(*), hostel:hostels(*)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) return [];
      return data;
    },
  });

  const ownerInquiriesQuery = useQuery({
    queryKey: ['owner-inquiries', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('inquiries')
        .select('*, student:profiles(*), hostel:hostels(*)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) return [];
      return data;
    },
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
    },
  });

  const toggleAvailability = useMutation({
    mutationFn: async ({ hostelId, isAvailable }: { hostelId: string; isAvailable: boolean }) => {
      const { error } = await supabase
        .from('hostels')
        .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
        .eq('id', hostelId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-hostels'] });
    },
  });

  return {
    hostels: ownerHostelsQuery.data || [],
    bookings: ownerBookingsQuery.data || [],
    inquiries: ownerInquiriesQuery.data || [],
    isLoading: ownerHostelsQuery.isLoading,
    updateBookingStatus: updateBookingStatus.mutateAsync,
    toggleAvailability: toggleAvailability.mutateAsync,
  };
}
