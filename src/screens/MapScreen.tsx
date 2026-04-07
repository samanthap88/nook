import React, { useContext, useMemo } from "react";
import { View, StyleSheet, Text, Pressable, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { BathroomContext } from "../context/BathroomContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = {
  navigation: StackNavigationProp<RootStackParamList>;
};

export default function MapScreen({ navigation }: Props) {
  const { bathrooms, loading } = useContext(BathroomContext);

  const bathroomsWithLocation = useMemo(
    () =>
      bathrooms.filter(
        (bathroom) =>
          Number.isFinite(bathroom.location?.latitude) &&
          Number.isFinite(bathroom.location?.longitude)
      ),
    [bathrooms]
  );

  const defaultRegion = {
    latitude: bathroomsWithLocation[0]?.location.latitude ?? 42.3601,
    longitude: bathroomsWithLocation[0]?.location.longitude ?? -71.0589,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  const getMarkerColor = (averageRating: number | null) => {
    if (averageRating === null) return "#E3972E";
    if (averageRating >= 4) return "#1A9D53";
    if (averageRating >= 3) return "#E3972E";
    return "#CC3D3D";
  };

  const getAverageRating = (bathroom: (typeof bathroomsWithLocation)[number]) => {
    if (!bathroom.reviews?.length) return 0;
    return bathroom.reviews.reduce((sum, review) => sum + review.rating, 0) / bathroom.reviews.length;
  };

  const getDistanceKm = (
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number
  ) => {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRadians(toLat - fromLat);
    const dLng = toRadians(toLng - fromLng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(fromLat)) *
        Math.cos(toRadians(toLat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  };

  const highestRated = useMemo(
    () =>
      [...bathroomsWithLocation]
        .sort((left, right) => getAverageRating(right) - getAverageRating(left))
        .slice(0, 3),
    [bathroomsWithLocation]
  );

  const nearestBathrooms = useMemo(() => {
    const centerLat = defaultRegion.latitude;
    const centerLng = defaultRegion.longitude;

    return [...bathroomsWithLocation]
      .sort((left, right) => {
        const leftDistance = getDistanceKm(
          centerLat,
          centerLng,
          left.location.latitude,
          left.location.longitude
        );
        const rightDistance = getDistanceKm(
          centerLat,
          centerLng,
          right.location.latitude,
          right.location.longitude
        );
        return leftDistance - rightDistance;
      })
      .slice(0, 3);
  }, [bathroomsWithLocation, defaultRegion.latitude, defaultRegion.longitude]);

  const myRatingsRank = useMemo(
    () =>
      [...bathroomsWithLocation]
        .filter((bathroom) => bathroom.reviews.length > 0)
        .sort((left, right) => {
          const leftLatest = left.reviews[0]?.rating ?? 0;
          const rightLatest = right.reviews[0]?.rating ?? 0;
          return rightLatest - leftLatest;
        })
        .slice(0, 3),
    [bathroomsWithLocation]
  );

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={defaultRegion}>
        {bathroomsWithLocation.map((bathroom) => {
          const reviewCount = bathroom.reviews?.length ?? 0;
          const averageRatingValue =
            reviewCount > 0
              ? bathroom.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
              : null;
          const averageRating =
            reviewCount > 0
              ? (
                  averageRatingValue ?? 0
                ).toFixed(2)
              : "N/A";

          return (
            <Marker
              key={bathroom.id}
              coordinate={bathroom.location}
              title={bathroom.name}
              description={`Avg Rating: ${averageRating} • Reviews: ${reviewCount}`}
              onPress={() =>
                navigation.navigate("Detail", { bathroom })
              }
            >
              <View
                style={[
                  styles.ratingMarker,
                  { backgroundColor: getMarkerColor(averageRatingValue) },
                ]}
              >
                <Text style={styles.ratingMarkerText}>{averageRating === "N/A" ? "-" : averageRating}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0D6A94" />
        </View>
      ) : null}

      <View style={styles.summaryPanel}>
        <View style={styles.summaryColumn}>
          <Text style={styles.summaryTitle}>Top Rated</Text>
          {highestRated.length === 0 ? (
            <Text style={styles.summaryEmpty}>No data</Text>
          ) : (
            highestRated.map((bathroom, index) => (
              <Text key={bathroom.id} style={styles.summaryItem} numberOfLines={1}>
                {index + 1}. {getAverageRating(bathroom).toFixed(2)} {bathroom.name}
              </Text>
            ))
          )}
        </View>

        <View style={styles.summaryColumn}>
          <Text style={styles.summaryTitle}>Nearest</Text>
          {nearestBathrooms.length === 0 ? (
            <Text style={styles.summaryEmpty}>No data</Text>
          ) : (
            nearestBathrooms.map((bathroom, index) => {
              const distance = getDistanceKm(
                defaultRegion.latitude,
                defaultRegion.longitude,
                bathroom.location.latitude,
                bathroom.location.longitude
              );
              return (
                <Text key={bathroom.id} style={styles.summaryItem} numberOfLines={1}>
                  {index + 1}. {distance.toFixed(1)}km {bathroom.name}
                </Text>
              );
            })
          )}
        </View>

        <View style={styles.summaryColumn}>
          <Text style={styles.summaryTitle}>My Ratings</Text>
          {myRatingsRank.length === 0 ? (
            <Text style={styles.summaryEmpty}>No ratings yet</Text>
          ) : (
            myRatingsRank.map((bathroom, index) => (
              <Text key={bathroom.id} style={styles.summaryItem} numberOfLines={1}>
                {index + 1}. {(bathroom.reviews[0]?.rating ?? 0).toFixed(2)} {bathroom.name}
              </Text>
            ))
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("HomeTabs")}
        >
          <Text style={styles.secondaryButtonText}>Open Nearby</Text>
        </Pressable>
        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate("AddBathroom")}
        >
          <Text style={styles.primaryButtonText}>Add Bathroom</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F1F6",
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -20,
  },
  ratingMarker: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#0D6A94",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#15384C",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  ratingMarkerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  summaryPanel: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 78,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "#D2E2EC",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    gap: 8,
  },
  summaryColumn: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E435A",
    marginBottom: 6,
  },
  summaryItem: {
    fontSize: 11,
    color: "#355A70",
    marginBottom: 2,
  },
  summaryEmpty: {
    fontSize: 11,
    color: "#6B8495",
  },
  actions: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#0D6A94",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BDD0DC",
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#255068",
    fontWeight: "700",
    fontSize: 14,
  },
});