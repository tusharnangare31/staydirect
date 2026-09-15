import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { decode } from 'base64-arraybuffer';

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickAndUploadImage = async (hostelId: string): Promise<string | null> => {
    try {
      setError(null);
      // 1. Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Camera roll permissions are required to upload hostel photos.');
        return null;
      }

      // 2. Launch picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets[0].base64) {
        return null;
      }

      setIsUploading(true);
      const asset = result.assets[0];
      const fileName = `${hostelId}/${Date.now()}.jpg`;

      // 3. Upload to Supabase Storage bucket 'hostel-images'
      const { data, error: uploadError } = await supabase.storage
        .from('hostel-images')
        .upload(fileName, decode(asset.base64), {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // 4. Retrieve public URL
      const { data: { publicUrl } } = supabase.storage
        .from('hostel-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (e: any) {
      console.error('Image upload failed:', e);
      setError(e.message || 'Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    pickAndUploadImage,
    isUploading,
    error,
  };
}
