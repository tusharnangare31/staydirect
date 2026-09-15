import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/constants/theme';
import { useImageUpload } from '../../src/hooks/useImageUpload';

export interface ImageUploaderProps {
  images: string[];
  onChange: (newImages: string[]) => void;
  hostelId?: string;
  minImages?: number;
  maxImages?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  hostelId = 'temp-draft',
  minImages = 1,
  maxImages = 8,
}) => {
  const { pickImages, uploadImage, isUploading, uploadProgress, error: uploadError } = useImageUpload();
  const [localUploading, setLocalUploading] = useState(false);

  const handlePickAndAdd = async () => {
    if (images.length >= maxImages) {
      Alert.alert('Limit Reached', `You can upload up to ${maxImages} photos.`);
      return;
    }

    const pickedAssets = await pickImages(true);
    if (!pickedAssets || pickedAssets.length === 0) return;

    setLocalUploading(true);
    const newUrls: string[] = [];

    for (const asset of pickedAssets) {
      const result = await uploadImage(hostelId, asset);
      if (result?.publicUrl) {
        newUrls.push(result.publicUrl);
      } else if (asset.uri) {
        // Fallback for local preview if offline/testing
        newUrls.push(asset.uri);
      }
    }

    setLocalUploading(false);
    if (newUrls.length > 0) {
      onChange([...images, ...newUrls]);
    }
  };

  const handleRemove = (index: number) => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const updated = [...images];
          updated.splice(index, 1);
          onChange(updated);
        },
      },
    ]);
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);
    onChange(updated);
  };

  const isUploadingState = isUploading || localUploading;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>
          Hostel Photos <Text style={styles.requiredStar}>*</Text>
        </Text>
        <Text style={styles.counterText}>
          {images.length}/{maxImages} (Min {minImages} required)
        </Text>
      </View>

      <Text style={styles.helperText}>
        Upload high-quality images of rooms, washrooms, and common areas. The first image will be used as the cover photo.
      </Text>

      {/* Progress Bar when uploading */}
      {isUploadingState && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>Uploading photo to Supabase storage...</Text>
            <Text style={styles.progressPercent}>{uploadProgress}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${uploadProgress || 45}%` }]} />
          </View>
        </View>
      )}

      {uploadError && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={14} color={THEME.colors.error} />
          <Text style={styles.errorBannerText}>{uploadError}</Text>
        </View>
      )}

      {/* Photos Grid */}
      <View style={styles.grid}>
        {images.map((uri, index) => {
          const isCover = index === 0;
          return (
            <View key={`${uri}-${index}`} style={styles.thumbWrapper}>
              <Image source={{ uri }} style={styles.thumbnail} resizeMode="cover" />

              {/* Cover Badge */}
              {isCover && (
                <View style={styles.coverBadge}>
                  <Text style={styles.coverBadgeText}>COVER</Text>
                </View>
              )}

              {/* Reorder Buttons (Move left / right) */}
              <View style={styles.reorderControls}>
                {index > 0 && (
                  <TouchableOpacity
                    style={styles.reorderBtn}
                    onPress={() => handleMove(index, index - 1)}
                  >
                    <Ionicons name="chevron-back" size={12} color={THEME.colors.white} />
                  </TouchableOpacity>
                )}
                {index < images.length - 1 && (
                  <TouchableOpacity
                    style={styles.reorderBtn}
                    onPress={() => handleMove(index, index + 1)}
                  >
                    <Ionicons name="chevron-forward" size={12} color={THEME.colors.white} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Remove Button */}
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemove(index)}
              >
                <Ionicons name="close" size={14} color={THEME.colors.white} />
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Add Photo Button Tile */}
        {images.length < maxImages && (
          <TouchableOpacity
            style={styles.addTile}
            onPress={handlePickAndAdd}
            disabled={isUploadingState}
          >
            {isUploadingState ? (
              <ActivityIndicator size="small" color={THEME.colors.primary} />
            ) : (
              <>
                <View style={styles.addIconCircle}>
                  <Ionicons name="camera" size={20} color={THEME.colors.primary} />
                </View>
                <Text style={styles.addTileText}>Add Photo</Text>
                <Text style={styles.addTileSub}>PNG, JPG &lt; 5MB</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {images.length < minImages && (
        <Text style={styles.minWarningText}>
          ⚠️ Please upload at least {minImages} photo of your property to submit.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  requiredStar: {
    color: THEME.colors.error,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  helperText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  progressContainer: {
    backgroundColor: '#F0F7F3',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBE5D6',
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#D1E7DD',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: THEME.colors.primary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF1F2',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  errorBannerText: {
    fontSize: 11,
    color: THEME.colors.error,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  thumbWrapper: {
    width: '48%',
    aspectRatio: 1.35,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  coverBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coverBadgeText: {
    color: THEME.colors.white,
    fontSize: 8,
    fontWeight: '900',
  },
  reorderControls: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    gap: 4,
  },
  reorderBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(185, 28, 28, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTile: {
    width: '48%',
    aspectRatio: 1.35,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: THEME.colors.secondaryDark,
    backgroundColor: '#FAFDF9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  addIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  addTileText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  addTileSub: {
    fontSize: 9,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  minWarningText: {
    fontSize: 11,
    color: '#D97706',
    marginTop: 8,
    fontWeight: '600',
  },
});
