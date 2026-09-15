import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Hostel, Room, HostelImage, Inquiry } from '../types/database.types';

export type ListingTab = 'all' | 'active' | 'draft' | 'pending' | 'rejected';

export function useOwnerListings(statusFilter: ListingTab = 'all') {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetch Owner's Hostels
  const hostelsQuery = useQuery({
    queryKey: ['owner-hostels-detailed', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('hostels')
        .select(`
          *,
          images:hostel_images(*),
          rooms:rooms(*),
          amenities:hostel_amenities(amenity:amenities(name))
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching owner hostels:', error.message);
        return [];
      }
      return (data || []) as Hostel[];
    },
  });

  // 2. Fetch Owner's Inquiries for pending inquiry counts
  const inquiriesQuery = useQuery({
    queryKey: ['owner-inquiries-detailed', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('inquiries')
        .select('*, student:profiles(*), hostel:hostels(name)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching inquiries:', error.message);
        return [];
      }
      return (data || []) as Inquiry[];
    },
  });

  const allHostels = hostelsQuery.data || [];
  const allInquiries = inquiriesQuery.data || [];

  // Filter hostels based on active tab
  const filteredHostels = allHostels.filter((hostel) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') {
      return hostel.is_published === true && hostel.verification_status === 'verified';
    }
    if (statusFilter === 'draft') {
      return hostel.is_published === false && hostel.verification_status === 'pending';
    }
    if (statusFilter === 'pending') {
      return hostel.verification_status === 'pending';
    }
    if (statusFilter === 'rejected') {
      return hostel.verification_status === 'rejected';
    }
    return true;
  });

  // Aggregate Metrics for Owner
  const totalListings = allHostels.length;
  const activeListings = allHostels.filter(
    (h) => h.is_published === true && h.verification_status === 'verified'
  ).length;

  const totalBeds = allHostels.reduce((acc, h) => {
    if (h.rooms && h.rooms.length > 0) {
      return acc + h.rooms.reduce((rAcc, r) => rAcc + (r.total_beds || r.total_capacity || 0), 0);
    }
    return acc + (h.total_beds || 0);
  }, 0);

  const availableBeds = allHostels.reduce((acc, h) => {
    if (h.rooms && h.rooms.length > 0) {
      return acc + h.rooms.reduce((rAcc, r) => rAcc + (r.available_beds || r.vacant_beds || 0), 0);
    }
    return acc + (h.available_beds || 0);
  }, 0);

  const pendingInquiriesCount = allInquiries.filter(
    (inq) => inq.status === 'new' || inq.status === 'scheduled_visit'
  ).length;

  // Mutation: Update Rent & Security Deposit
  const updateRentMutation = useMutation({
    mutationFn: async ({
      hostelId,
      monthlyRent,
      securityDeposit,
    }: {
      hostelId: string;
      monthlyRent: number;
      securityDeposit?: number;
    }) => {
      const { data, error } = await supabase
        .from('hostels')
        .update({
          monthly_rent: monthlyRent,
          ...(securityDeposit !== undefined && { security_deposit: securityDeposit }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', hostelId)
        .eq('owner_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-hostels-detailed'] });
      queryClient.invalidateQueries({ queryKey: ['owner-hostels'] });
    },
  });

  // Mutation: Update Room Available Beds
  const updateRoomAvailabilityMutation = useMutation({
    mutationFn: async ({
      roomId,
      availableBeds,
      totalBeds,
    }: {
      roomId: string;
      availableBeds: number;
      totalBeds?: number;
    }) => {
      const { data, error } = await supabase
        .from('rooms')
        .update({
          available_beds: availableBeds,
          ...(totalBeds !== undefined && { total_beds: totalBeds }),
        })
        .eq('id', roomId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-hostels-detailed'] });
    },
  });

  // Mutation: Toggle Publish / Unpublish
  const togglePublishMutation = useMutation({
    mutationFn: async ({
      hostelId,
      publish,
    }: {
      hostelId: string;
      publish: boolean;
    }) => {
      // If publishing, ensure required fields are present
      if (publish) {
        const targetHostel = allHostels.find((h) => h.id === hostelId);
        if (!targetHostel) throw new Error('Hostel not found');
        if (!targetHostel.name || !targetHostel.address || !targetHostel.monthly_rent) {
          throw new Error('Hostel requires name, address, and rent before publishing.');
        }
      }

      const { data, error } = await supabase
        .from('hostels')
        .update({
          is_published: publish,
          updated_at: new Date().toISOString(),
        })
        .eq('id', hostelId)
        .eq('owner_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-hostels-detailed'] });
      queryClient.invalidateQueries({ queryKey: ['owner-hostels'] });
    },
  });

  // Mutation: Delete Draft or Rejected Hostel
  const deleteHostelMutation = useMutation({
    mutationFn: async (hostelId: string) => {
      const targetHostel = allHostels.find((h) => h.id === hostelId);
      if (targetHostel && targetHostel.is_published && targetHostel.verification_status === 'verified') {
        throw new Error('Please unpublish active listings before deleting.');
      }

      const { error } = await supabase
        .from('hostels')
        .delete()
        .eq('id', hostelId)
        .eq('owner_id', user?.id);

      if (error) throw error;
      return hostelId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-hostels-detailed'] });
      queryClient.invalidateQueries({ queryKey: ['owner-hostels'] });
    },
  });

  // Mutation: Update Inquiry Status
  const updateInquiryStatusMutation = useMutation({
    mutationFn: async ({
      inquiryId,
      status,
    }: {
      inquiryId: string;
      status: 'new' | 'contacted' | 'scheduled_visit' | 'closed';
    }) => {
      const { data, error } = await supabase
        .from('inquiries')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', inquiryId)
        .eq('owner_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-inquiries-detailed'] });
      queryClient.invalidateQueries({ queryKey: ['owner-inquiries'] });
    },
  });

  return {
    hostels: filteredHostels,
    allHostels,
    inquiries: allInquiries,
    isLoading: hostelsQuery.isLoading || inquiriesQuery.isLoading,
    isRefetching: hostelsQuery.isRefetching,
    refetch: () => {
      hostelsQuery.refetch();
      inquiriesQuery.refetch();
    },
    // Metrics
    totalListings,
    activeListings,
    totalBeds,
    availableBeds,
    pendingInquiriesCount,
    // Actions
    updateRent: updateRentMutation.mutateAsync,
    isUpdatingRent: updateRentMutation.isPending,
    updateRoomAvailability: updateRoomAvailabilityMutation.mutateAsync,
    isUpdatingRoomAvailability: updateRoomAvailabilityMutation.isPending,
    togglePublish: togglePublishMutation.mutateAsync,
    isTogglingPublish: togglePublishMutation.isPending,
    deleteHostel: deleteHostelMutation.mutateAsync,
    isDeleting: deleteHostelMutation.isPending,
    updateInquiryStatus: updateInquiryStatusMutation.mutateAsync,
  };
}
