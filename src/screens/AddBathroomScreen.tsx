import React, { useEffect, useState, useContext } from "react";
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  Text,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { BathroomContext } from "../context/BathroomContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { AccessStatus } from "../types/Bathroom";

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "AddBathroom">;
};

export default function AddBathroomScreen({ navigation }: Props) {
  const { addBathroom } = useContext(BathroomContext);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ place_id: string; description: string }>
  >([]);
  const [searching, setSearching] = useState(false);
  const [cleanliness, setCleanliness] = useState(3);
  const [accessStatus, setAccessStatus] = useState<AccessStatus>("public");
  const [restroomCount, setRestroomCount] = useState("1");
  const [directions, setDirections] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [firstReviewComment, setFirstReviewComment] = useState("");
  const [firstReviewRating, setFirstReviewRating] = useState("3.00");
  const mapsApiKey =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  const AMENITY_OPTIONS = [
    "Wheelchair Access",
    "Baby Changing",
    "Soap",
    "Paper Towels",
    "Hand Dryer",
    "Gender Neutral",
  ];

  const ACCESS_STATUS_OPTIONS: Array<{ value: AccessStatus; label: string }> = [
    { value: "public", label: "Public" },
    { value: "customers_only", label: "Customers Only" },
    { value: "key_required", label: "Key Required" },
    { value: "staff_only", label: "Staff Only" },
  ];

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) => {
      if (prev.includes(amenity)) {
        return prev.filter((item) => item !== amenity);
      }

      return [...prev, amenity];
    });
  };

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2 || !mapsApiKey) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setSearching(true);
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            trimmedQuery
          )}&types=establishment|geocode&key=${mapsApiKey}`
        );
        const data = await response.json();

        setSearchResults(Array.isArray(data.predictions) ? data.predictions : []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query, mapsApiKey]);

  const selectPlace = async (placeId: string, description: string) => {
    try {
      setSearching(true);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,name,formatted_address&key=${mapsApiKey}`
      );
      const data = await response.json();
      const location = data?.result?.geometry?.location;

      if (location?.lat && location?.lng) {
        setAddress(description);
        setCoords({ lat: location.lat, lng: location.lng });
        setQuery(description);
        setSearchResults([]);

        if (!name.trim()) {
          setName(data?.result?.name ?? description);
        }
      } else {
        Alert.alert("Address unavailable", "Could not load coordinates for that place.");
      }
    } catch {
      Alert.alert("Search failed", "Unable to fetch place details right now.");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Missing name", "Please enter a bathroom name.");
      return;
    }

    if (!coords) {
      Alert.alert(
        "Missing address",
        "Please search and select an address from the suggestions."
      );
      return;
    }

    const parsedRestroomCount = Number(restroomCount);
    if (!Number.isInteger(parsedRestroomCount) || parsedRestroomCount < 1) {
      Alert.alert("Invalid restroom count", "Enter a whole number of restrooms (1 or more).");
      return;
    }

    let parsedFirstReviewRating: number | undefined;

    if (firstReviewComment.trim()) {
      const trimmedRating = firstReviewRating.trim();
      const decimalPattern = /^\d+(\.\d{1,2})?$/;

      if (!decimalPattern.test(trimmedRating)) {
        Alert.alert("Invalid rating", "Use a number with up to 2 decimals (e.g. 4.25).");
        return;
      }

      const numericRating = Number(trimmedRating);
      if (Number.isNaN(numericRating) || numericRating < 0 || numericRating > 5) {
        Alert.alert("Invalid rating", "Rating must be between 0 and 5.");
        return;
      }

      parsedFirstReviewRating = Number(numericRating.toFixed(2));
    }

    await addBathroom({
      name: name.trim(),
      coords,
      cleanliness,
      accessStatus,
      restroomCount: parsedRestroomCount,
      directions,
      amenities,
      firstReviewComment,
      firstReviewRating: parsedFirstReviewRating,
    });

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <FlatList
        data={[{ id: "add-bathroom-form" }]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        renderItem={() => (
          <View style={styles.card}>
          <Text style={styles.title}>Add Bathroom</Text>
          <Text style={styles.subtitle}>
            Save a location with quality details for the map and list.
          </Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            placeholder="Downtown Station Restroom"
            placeholderTextColor="#8A9AA8"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <Text style={styles.label}>Address</Text>
          {mapsApiKey ? (
            <View style={styles.autocompleteWrapper}>
              <TextInput
                placeholder="Search place (e.g. Public Library, cafe)"
                placeholderTextColor="#8A9AA8"
                value={query}
                onChangeText={setQuery}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {searching ? (
                <View style={styles.searchingRow}>
                  <ActivityIndicator size="small" color="#0D6A94" />
                  <Text style={styles.searchingText}>Searching places...</Text>
                </View>
              ) : null}

              {searchResults.length > 0 ? (
                <View style={styles.resultsBox}>
                  {searchResults.map((item) => (
                    <Pressable
                      key={item.place_id}
                      style={styles.resultRow}
                      onPress={() => selectPlace(item.place_id, item.description)}
                    >
                      <Text style={styles.resultText}>{item.description}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          ) : (
            <Text style={styles.warningText}>
              Google Places API key not found. Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to .env.
            </Text>
          )}

          {address ? (
            <View style={styles.selectedAddressBox}>
              <Text style={styles.selectedAddressLabel}>Selected</Text>
              <Text style={styles.selectedAddressText}>{address}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Cleanliness</Text>
          <View style={styles.rowWrap}>
            {[1, 2, 3, 4, 5].map((value) => {
              const selected = cleanliness === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => setCleanliness(value)}
                  style={[styles.scoreChip, selected && styles.scoreChipSelected]}
                >
                  <Text
                    style={[
                      styles.scoreChipText,
                      selected && styles.scoreChipTextSelected,
                    ]}
                  >
                    {value}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Access status</Text>
          <View style={styles.rowWrap}>
            {ACCESS_STATUS_OPTIONS.map((option) => {
              const selected = accessStatus === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setAccessStatus(option.value)}
                  style={[styles.amenityChip, selected && styles.amenityChipSelected]}
                >
                  <Text
                    style={[
                      styles.amenityChipText,
                      selected && styles.amenityChipTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Number of restrooms</Text>
          <TextInput
            placeholder="1"
            placeholderTextColor="#8A9AA8"
            value={restroomCount}
            onChangeText={setRestroomCount}
            style={styles.input}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>How to find it</Text>
          <TextInput
            placeholder="Inside the building, second floor near the elevators."
            placeholderTextColor="#8A9AA8"
            value={directions}
            onChangeText={setDirections}
            style={styles.input}
            multiline
          />

          <Text style={styles.label}>Amenities</Text>
          <View style={styles.rowWrap}>
            {AMENITY_OPTIONS.map((amenity) => {
              const selected = amenities.includes(amenity);
              return (
                <Pressable
                  key={amenity}
                  onPress={() => toggleAmenity(amenity)}
                  style={[
                    styles.amenityChip,
                    selected && styles.amenityChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.amenityChipText,
                      selected && styles.amenityChipTextSelected,
                    ]}
                  >
                    {amenity}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>First review comment (optional)</Text>
          <TextInput
            placeholder="Clean restroom, easy to find, had soap and paper towels."
            placeholderTextColor="#8A9AA8"
            value={firstReviewComment}
            onChangeText={setFirstReviewComment}
            style={styles.input}
            multiline
          />

          <Text style={styles.label}>First review rating (0-5, up to 2 decimals)</Text>
          <TextInput
            placeholder="4.25"
            placeholderTextColor="#8A9AA8"
            value={firstReviewRating}
            onChangeText={setFirstReviewRating}
            style={styles.input}
            keyboardType="decimal-pad"
          />

          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Save to Firestore</Text>
          </Pressable>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EEF6FA",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D9E6EE",
    shadowColor: "#2A3D4D",
    shadowOpacity: 0.09,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#103047",
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    color: "#4A6678",
    fontSize: 14,
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#173B52",
  },
  input: {
    borderWidth: 1,
    borderColor: "#BFD3DE",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: "#173B52",
    backgroundColor: "#F9FCFF",
  },
  autocompleteWrapper: {
    zIndex: 20,
    position: "relative",
  },
  resultsBox: {
    borderWidth: 1,
    borderColor: "#D2E2EC",
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  resultRow: {
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E7EFF4",
  },
  resultText: {
    color: "#1B4159",
  },
  searchingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  searchingText: {
    color: "#4A6678",
    fontSize: 12,
  },
  selectedAddressBox: {
    marginTop: 10,
    backgroundColor: "#EDF7FD",
    borderWidth: 1,
    borderColor: "#C8DFED",
    borderRadius: 10,
    padding: 10,
  },
  selectedAddressLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#5A7A8F",
    textTransform: "uppercase",
  },
  selectedAddressText: {
    marginTop: 4,
    color: "#1C4159",
    fontWeight: "600",
  },
  warningText: {
    fontSize: 12,
    color: "#B54708",
    backgroundColor: "#FFF3E8",
    borderWidth: 1,
    borderColor: "#F8D9B8",
    borderRadius: 10,
    padding: 10,
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  scoreChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BFD3DE",
    backgroundColor: "#F4FAFF",
  },
  scoreChipSelected: {
    borderColor: "#0F6B96",
    backgroundColor: "#0F6B96",
  },
  scoreChipText: {
    fontWeight: "700",
    color: "#1F4A63",
  },
  scoreChipTextSelected: {
    color: "#FFFFFF",
  },
  amenityChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#BCD1DD",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F7FCFF",
  },
  amenityChipSelected: {
    borderColor: "#0F6B96",
    backgroundColor: "#D8EEF8",
  },
  amenityChipText: {
    color: "#2A4E64",
    fontWeight: "600",
    fontSize: 12,
  },
  amenityChipTextSelected: {
    color: "#0E5B80",
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#0D6A94",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});