import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { EmptyState } from "../../components/common/EmptyState";
import { Header } from "../../components/common/Header";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
    deleteFoodItem as reduxDeleteFoodItem,
    setFoodItems,
} from "../../redux/slices/foodSlice";
import { auth } from "../../services/firebase/config";
import {
    deleteFoodItem as serviceDeleteFoodItem,
    fetchFoodItems as serviceFetchFoodItems,
    updateFoodItem as serviceUpdateFoodItem,
    subscribeToFoodItems,
} from "../../services/firebase/foodService";
import localStorageService from "../../services/localStorageService";
import { colors, spacing, typography } from "../../theme";
import { FoodItem } from "../../types/food.types";
import { CURRENCY_SYMBOL } from "../../utils/constants";

type Props = NativeStackScreenProps<any, "ManageFood">;

export const ManageFoodScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.food);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const handleDeleteItem = (item: FoodItem) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete ${item.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // Log auth state for debugging web vs native

            console.debug("[ManageFood] attempting delete", {
              uid: auth?.currentUser?.uid ?? null,
              email: auth?.currentUser?.email ?? null,
            });
            setLoading(true);
            try {
              // Ensure deletion happens in Firestore first so it's authoritative.
              await serviceDeleteFoodItem(item.id);
              // Remove any local cached image (best-effort)
              try {
                await localStorageService.deleteImage(item.id);
              } catch (e) {
                // ignore
              }
              // Update local redux state after persistent delete for instant optimistic UI
              dispatch(reduxDeleteFoodItem(item.id));
              Alert.alert("Deleted", `${item.name} has been deleted.`);
              // The subscribeToFoodItems listener will automatically update the
              // Redux store once Firestore confirms the deletion — no manual re-fetch needed.
            } catch (err: any) {
              console.warn("[ManageFood] delete failed", err);
              Alert.alert("Error", err?.message || "Failed to delete item");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      let list = await serviceFetchFoodItems();
      // On web, Firestore may contain ephemeral blob/object URLs from earlier previews.
      // Try to resolve a stable local URI stored by localStorageService for each item.
      if (Platform.OS === "web") {
        const patched = await Promise.all(
          list.map(async (it) => {
            try {
              const local = await localStorageService.getImageUri(it.id);
              if (local) return { ...it, image: local };
            } catch (e) {
              // ignore
            }
            return it;
          }),
        );
        list = patched;
      }
      dispatch(setFoodItems(list));
    } catch (err: any) {
      console.warn("[ManageFood] refresh failed", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Migrate ephemeral blob/object URLs or local-file URIs to stable data URLs stored in Firestore.
  // This helps web clients load images that were previously saved as blob: URLs.
  const migrateImages = async () => {
    setLoading(true);
    let success = 0;
    let skipped = 0;
    let failed = 0;
    try {
      const list = await serviceFetchFoodItems();
      for (const it of list) {
        const img = it.image;
        if (!img) {
          skipped++;
          continue;
        }
        // Already stable (http(s) or data URL) skip
        if (/^data:|^https?:\/\//i.test(img)) {
          skipped++;
          continue;
        }

        try {
          // First try to see if we already saved a stable local copy via localStorageService
          const local = await localStorageService.getImageUri(it.id);
          if (local && /^data:/i.test(local)) {
            await serviceUpdateFoodItem(it.id, { image: local });
            success++;
            continue;
          }

          // If on native and local is a file path, read as base64 and convert to data URL
          if (
            local &&
            typeof local === "string" &&
            !/^data:/i.test(local) &&
            local.length > 0
          ) {
            try {
              // Attempt to read file as base64

              const FileSystem = require("expo-file-system");
              const base64 = await FileSystem.readAsStringAsync(local, {
                encoding: "base64" as any,
              });
              const ext = local.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
              const mime = `image/${(ext && ext[1]) || "jpg"}`;
              const dataUrl = `data:${mime};base64,${base64}`;
              await serviceUpdateFoodItem(it.id, { image: dataUrl });
              success++;
              continue;
            } catch (e) {
              // fall through to try fetching original uri
            }
          }

          // Last resort: try to fetch the original URI and convert to data URL via localStorageService.saveImage
          try {
            const saved = await localStorageService.saveImage(img, it.id);
            if (saved) {
              await serviceUpdateFoodItem(it.id, { image: saved });
              success++;
              continue;
            }
          } catch (e) {
            // ignore and count as failure below
          }

          failed++;
        } catch (e) {
          console.warn("[ManageFood] migrateImages item failed", it.id, e);
          failed++;
        }
      }
    } catch (e) {
      console.warn("[ManageFood] migrateImages failed", e);
      Alert.alert("Migration failed", String(e));
    } finally {
      setLoading(false);
      Alert.alert(
        "Migration complete",
        `success: ${success}, skipped: ${skipped}, failed: ${failed}`,
      );
      // refresh list
      onRefresh();
    }
  };

  React.useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToFoodItems(
      async (list) => {
        if (Platform.OS === "web") {
          const patched = await Promise.all(
            list.map(async (it) => {
              try {
                const local = await localStorageService.getImageUri(it.id);
                if (local) return { ...it, image: local };
              } catch (e) {
                // ignore
              }
              return it;
            }),
          );
          dispatch(setFoodItems(patched));
        } else {
          dispatch(setFoodItems(list));
        }
        setLoading(false);
      },
      (err) => {
        console.warn("[ManageFood] subscription error", err);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [dispatch]);

  const handleEditItem = (item: FoodItem) => {
    navigation.navigate("AddEditFood", { foodItem: item });
  };

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <View style={styles.foodCard}>
      {/* Tappable area — only the image + info navigate to edit */}
      <TouchableOpacity
        style={styles.foodCardInner}
        onPress={() => handleEditItem(item)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.image }} style={styles.foodImage} />

        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodCategory}>{item.category}</Text>
          <View style={styles.foodFooter}>
            <Text style={styles.foodPrice}>
              {CURRENCY_SYMBOL} {item.price.toFixed(2)}
            </Text>
            <View style={styles.foodRating}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Action buttons are outside the tappable card to prevent event bubbling */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditItem(item)}
        >
          <Ionicons name="pencil-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteItem(item)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      {!item.isAvailable && (
        <View style={styles.unavailableBadge}>
          <Text style={styles.unavailableText}>Unavailable</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Manage Food Items"
        onBackPress={() => navigation.goBack()}
        rightIcon="add-outline"
        onRightPress={() => navigation.navigate("AddEditFood")}
      />

      {/* Admin helper: migrate blob/file image URIs to stable data URLs in Firestore */}
      <View
        style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.primary,
            padding: spacing.sm,
            borderRadius: 8,
            alignItems: "center",
          }}
          onPress={() => {
            Alert.alert(
              "Migrate images",
              "This will attempt to migrate blob/file images to data URLs. Continue?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "OK", onPress: migrateImages },
              ],
            );
          }}
        >
          <Text style={{ color: colors.primary }}>
            Migrate images (blob/file to data URLs)
          </Text>
        </TouchableOpacity>
      </View>

      {loading && <LoadingSpinner />}

      {items.length === 0 ? (
        <EmptyState
          icon="fast-food-outline"
          title="No Food Items"
          message="Start adding food items to your menu"
        />
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderFoodItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
  },
  foodCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  foodCardInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  foodInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: "space-between",
  },
  foodName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  foodCategory: {
    fontSize: typography.sizes.sm,
    color: colors.darkGray,
  },
  foodFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  foodPrice: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  foodRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  actions: {
    justifyContent: "center",
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  unavailableBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unavailableText: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },
});
