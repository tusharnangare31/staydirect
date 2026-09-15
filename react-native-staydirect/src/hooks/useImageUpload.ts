import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { decode } from 'base64-arraybuffer';

export interface UploadProgressInfo {
  fileName: string;
  progress: number;
}

export function useImageUpload() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Pick single or multiple images using Expo Image Picker
   */
  const pickImages = async (allowsMultiple = true): Promise<ImagePicker.ImagePickerAsset[]> => {
    try {
      setError(null);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Camera roll permissions are required to upload hostel photos.');
        return [];
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: allowsMultiple,
        selectionLimit: 8,
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return [];
      }

      // Validate file types and sizes (max 5MB = 5 * 1024 * 1024 bytes)
      const validAssets = result.assets.filter((asset) => {
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          setError('Some images exceeded 5MB limit and were skipped.');
          return false;
        }
        return true;
      });

      return validAssets;
    } catch (e: any) {
      console.error('Failed to pick images:', e);
      setError(e.message || 'Error selecting photos');
      return [];
    }
  };

  /**
   * Upload image to Supabase Storage: hostels/{owner_id}/{hostel_id}/{filename}
   */
  const uploadImage = async (
    hostelId: string,
    asset: ImagePicker.ImagePickerAsset
  ): Promise<{ publicUrl: string; storagePath: string } | null> => {
    try {
      if (!user?.id) throw new Error('Owner must be authenticated to upload photos.');

      setIsUploading(true);
      setUploadProgress(20);

      // Determine extension
      let extension = 'jpg';
      if (asset.mimeType) {
        if (asset.mimeType.includes('png')) extension = 'png';
        else if (asset.mimeType.includes('webp')) extension = 'webp';
      } else if (asset.uri) {
        const uriParts = asset.uri.split('.');
        const lastPart = uriParts[uriParts.length - 1].toLowerCase();
        if (['jpg', 'jpeg', 'png', 'webp'].includes(lastPart)) {
          extension = lastPart;
        }
      }

      // Unique filename
      const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;
      // Path: hostels/{owner_id}/{hostel_id}/{filename}
      const storagePath = `hostels/${user.id}/${hostelId}/${uniqueName}`;

      setUploadProgress(50);

      let fileData: ArrayBuffer | Blob;

      if (asset.base64) {
        fileData = decode(asset.base64);
      } else {
        const response = await fetch(asset.uri);
        fileData = await response.blob();
      }

      setUploadProgress(70);

      // Upload to 'hostel-images' bucket
      const { data, error: uploadError } = await supabase.storage
        .from('hostel-images')
        .upload(storagePath, fileData, {
          contentType: asset.mimeType || `image/${extension}`,
          upsert: true,
        });

      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError);
        throw uploadError;
      }

      setUploadProgress(90);

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('hostel-images').getPublicUrl(storagePath);

      setUploadProgress(100);

      return {
        publicUrl,
        storagePath,
      };
    } catch (e: any) {
      console.error('Upload failed:', e);
      setError(e.message || 'Failed to upload photo');
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 600);
    }
  };

  /**
   * Delete image from Supabase Storage
   */
  const deleteImage = async (storagePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('hostel-images')
        .remove([storagePath]);

      if (error) {
        console.warn('Supabase storage delete warning:', error.message);
        return false;
      }
      return true;
    } catch (e: any) {
      console.error('Failed to delete image from storage:', e);
      return false;
    }
  };

  return {
    pickImages,
    uploadImage,
    deleteImage,
    isUploading,
    uploadProgress,
    error,
  };
}
