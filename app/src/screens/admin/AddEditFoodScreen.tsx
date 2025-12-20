import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { useAppDispatch } from '../../redux/hooks';
import { addFoodItem as reduxAddFoodItem, updateFoodItem as reduxUpdateFoodItem } from '../../redux/slices/foodSlice';
import {
    addFoodItem as serviceAddFoodItem,
    updateFoodItem as serviceUpdateFoodItem,
} from '../../services/firebase/foodService';
import localStorageService from '../../services/localStorageService';
import { colors, spacing, typography } from '../../theme';
import { FoodCategory, FoodItem } from '../../types/food.types';
import { FOOD_CATEGORIES } from '../../utils/constants';

type Props = NativeStackScreenProps<any, 'AddEditFood'>;

export const AddEditFoodScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const editItem = route.params?.foodItem;
  const isEditMode = !!editItem;

  const [formData, setFormData] = useState({
    name: editItem?.name || '',
    description: editItem?.description || '',
    price: editItem?.price?.toString() || '',
    category: editItem?.category || 'Burgers',
    image: editItem?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
    rating: editItem?.rating?.toString() || '4.5',
    isAvailable: editItem?.isAvailable ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    const foodItem: FoodItem = {
      id: isEditMode ? editItem.id : `food_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image: formData.image,
      category: formData.category as FoodCategory,
      rating: parseFloat(formData.rating),
      isAvailable: formData.isAvailable,
      sideOptions: editItem?.sideOptions || [],
      drinkOptions: editItem?.drinkOptions || [],
      extras: editItem?.extras || [],
      removableIngredients: editItem?.removableIngredients || [],
    };

    try {
      if (isEditMode) {
        // Edit flow: convert image to data URL and store in Firestore so all clients can access it.
        if (foodItem.image) {
          try {
            const dataUrl = await uriToDataUrl(foodItem.image);
            // If conversion succeeded and size is acceptable, use dataUrl; otherwise fall back to local save
            if (dataUrl) {
              foodItem.image = dataUrl;
            } else {
              const savedUri = await localStorageService.saveImage(foodItem.image, foodItem.id);
              foodItem.image = savedUri;
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('[AddEditFood] image handling failed', e);
            try {
              const savedUri = await localStorageService.saveImage(foodItem.image, foodItem.id);
              foodItem.image = savedUri;
            } catch (e2) {
              // ignore
            }
          }
        }

        await serviceUpdateFoodItem(foodItem.id, { ...foodItem, price: Number(foodItem.price) });
        dispatch(reduxUpdateFoodItem(foodItem));
      } else {
        // Create flow: prefer converting/compressing the image BEFORE creating the doc
        const payload = { ...foodItem } as Omit<FoodItem, 'id'>;
        // price should be a number
        payload.price = Number(payload.price);

        // Attempt to convert/compress to a stable data URL first so the initial Firestore
        // document contains a portable image (avoids ephemeral blob:file URIs in Firestore).
        if (payload.image) {
          try {
            const dataUrl = await uriToDataUrl(payload.image);
            if (dataUrl) {
              payload.image = dataUrl;
            }
          } catch (e) {
            // log and continue; we'll fallback after creating the doc
            // eslint-disable-next-line no-console
            console.warn('[AddEditFood] pre-conversion failed for new item, will fallback after create', e);
          }
        }

        const newId = await serviceAddFoodItem(payload);

        let finalImage = payload.image;
        // If we didn't manage to convert before create, try now and fallback to local save
        if (payload.image && !payload.image.startsWith('data:') && !/^https?:\/\//i.test(payload.image)) {
          try {
            const dataUrl = await uriToDataUrl(payload.image);
            if (dataUrl) {
              finalImage = dataUrl;
              await serviceUpdateFoodItem(newId, { image: dataUrl });
            } else {
              const savedUri = await localStorageService.saveImage(payload.image, newId);
              finalImage = savedUri;
              await serviceUpdateFoodItem(newId, { image: savedUri });
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('[AddEditFood] image handling failed for new item', e);
            try {
              const savedUri = await localStorageService.saveImage(payload.image, newId);
              finalImage = savedUri;
              await serviceUpdateFoodItem(newId, { image: savedUri });
            } catch (e2) {
              // ignore
            }
          }
        }

        const createdItem: FoodItem = { ...(payload as FoodItem), id: newId, image: finalImage };
        dispatch(reduxAddFoodItem(createdItem));
      }

      Alert.alert('Success', `Food item ${isEditMode ? 'updated' : 'added'} successfully`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.warn('[AddEditFood] save failed', err);
      Alert.alert('Error', err?.message || 'Failed to save food item');
    } finally {
      setLoading(false);
    }
  };

  // Helper: convert a remote/file/object URL to a data URL (base64). Returns null when
  // the image is too large or conversion fails. Caller can fallback to local save.
  const MAX_BYTES = 600 * 1024; // 600 KB

  async function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return (globalThis as any).btoa(binary);
  }

  function extFromUri(uri: string) {
    const m = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    return m ? m[1] : 'jpg';
  }

  // Try resizing/compressing via ImageManipulator across several sizes/qualities
  async function tryResizeAndConvert(uri: string): Promise<string | null> {
    // Dynamically import expo-image-manipulator to avoid compile-time errors if it's not installed
    let ImageManipulator: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      ImageManipulator = require('expo-image-manipulator');
    } catch (e) {
      ImageManipulator = null;
    }
    if (!ImageManipulator) return null;
    const widths = [1024, 800, 600, 400, 300];
    const qualities = [0.8, 0.7, 0.6, 0.5];

    for (const w of widths) {
      for (const q of qualities) {
        try {
          const result = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: w } }],
            { compress: q, format: ImageManipulator.SaveFormat.JPEG, base64: true }
          );
          if (result && result.base64) {
            const base64 = result.base64;
            if ((base64.length / 1.37) <= MAX_BYTES) {
              const mime = 'image/jpeg';
              return `data:${mime};base64,${base64}`;
            }
          }
        } catch (e) {
          // ignore and continue trying other sizes/qualities
        }
      }
    }
    return null;
  }

  async function uriToDataUrl(uri: string): Promise<string | null> {
    try {
      // If already a data URL, return as-is
      if (typeof uri === 'string' && uri.startsWith('data:')) return uri;
      // Native file URIs: use FileSystem to read base64 directly
      if (Platform.OS !== 'web' && uri.startsWith('file://')) {
        try {
          // Try resize & convert first (better for large images)
          const resized = await tryResizeAndConvert(uri);
          if (resized) return resized;

          const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' as any });
          const mime = `image/${extFromUri(uri)}`;
          // approximate size check
          if (base64.length / 1.37 > MAX_BYTES) return null;
          return `data:${mime};base64,${base64}`;
        } catch (e) {
          return null;
        }
      }

      // Web or remote/object URLs: try ImageManipulator resize on web/remote URIs first
      const resizedRemote = await tryResizeAndConvert(uri);
      if (resizedRemote) return resizedRemote;

      const resp = await fetch(uri);
      if (!resp.ok) return null;
      const contentLength = resp.headers.get('content-length');
      if (contentLength && Number(contentLength) > MAX_BYTES) return null;
      const buffer = await resp.arrayBuffer();
      if (buffer.byteLength > MAX_BYTES) return null;
      const base64 = await arrayBufferToBase64(buffer);
      const mime = resp.headers.get('content-type') || `image/${extFromUri(uri)}`;
      return `data:${mime};base64,${base64}`;
    } catch (e) {
      // conversion failed
      return null;
    }
  }

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={isEditMode ? 'Edit Food Item' : 'Add Food Item'}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Preview */}
        <View style={styles.imageSection}>
          <Image source={{ uri: formData.image }} style={styles.image} />
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={async () => {
              try {
                // ask for permissions and launch image picker
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert('Permission required', 'Permission to access media library is required to select images.');
                  return;
                }

                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 0.8,
                });

                if (!result.canceled) {
                  // expo-image-picker v14+ returns assets array
                  // fallback to result.uri for older versions
                  const uri = (result.assets && result.assets[0]?.uri) || (result as any).uri;
                  if (uri) {
                    updateField('image', uri);
                    return;
                  }
                }

                // Fallback for web or unexpected results: use a native file input
                if (typeof document !== 'undefined') {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*,video/*';
                  input.onchange = () => {
                    const file = input.files && input.files[0];
                    if (!file) return;
                    // create an object URL to preview and upload later
                    const objectUrl = URL.createObjectURL(file);
                    updateField('image', objectUrl);
                  };
                  input.click();
                }
              } catch (err: any) {
                // Provide a helpful error message rather than letting the app crash
                // eslint-disable-next-line no-console
                console.warn('[AddEditFood] image picker failed', err);
                Alert.alert('Image picker error', err?.message || String(err));
              }
            }}
          >
            <Ionicons name="camera-outline" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Basic Information */}
        <Input
          label="FOOD NAME"
          placeholder="e.g., Beef Burger"
          value={formData.name}
          onChangeText={(value) => updateField('name', value)}
          icon="fast-food-outline"
        />

        <View style={styles.textAreaContainer}>
          <Text style={styles.label}>DESCRIPTION</Text>
          <Input
            placeholder="Enter food description"
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            style={styles.textArea}
            multiline
            numberOfLines={4}
          />
        </View>

        <Input
          label="PRICE (R)"
          placeholder="0.00"
          value={formData.price}
          onChangeText={(value) => updateField('price', value)}
          keyboardType="decimal-pad"
          icon="cash-outline"
        />

        {/* Category Selection */}
        <Text style={styles.label}>CATEGORY</Text>
        <View style={styles.categoryGrid}>
          {FOOD_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                formData.category === category && styles.categoryButtonSelected,
              ]}
              onPress={() => updateField('category', category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  formData.category === category && styles.categoryTextSelected,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="RATING"
          placeholder="4.5"
          value={formData.rating}
          onChangeText={(value) => updateField('rating', value)}
          keyboardType="decimal-pad"
          icon="star-outline"
        />

        {/* Availability Toggle */}
        <TouchableOpacity
          style={styles.availabilityToggle}
          onPress={() => updateField('isAvailable', !formData.isAvailable)}
        >
          <Text style={styles.availabilityLabel}>Available</Text>
          <View
            style={[
              styles.toggle,
              formData.isAvailable && styles.toggleActive,
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                formData.isAvailable && styles.toggleThumbActive,
              ]}
            />
          </View>
        </TouchableOpacity>

        {/* Save Button */}
        <Button
          title={isEditMode ? 'Update Food Item' : 'Add Food Item'}
          onPress={handleSave}
          loading={loading}
          fullWidth
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    flexGrow: 1,
    paddingBottom: 140,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: spacing.sm,
    right: '30%',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  textAreaContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  categoryButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  categoryTextSelected: {
    color: colors.white,
  },
  availabilityToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  availabilityLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray,
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.accent,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  saveButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});