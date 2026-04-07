import React, { useContext, useMemo } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import MapView, { Marker } from "react-native-maps";
import BathroomCard from "../components/BathroomCard";
import { BathroomContext } from "../context/BathroomContext";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Bathroom } from "../types/Bathroom";

type RankingMode = "topRated" | "nearest" | "myRatings";

function RankedBathroomsView({
  mode,
  title,
  subtitle,
}: {
  mode: RankingMode;
  title: string;
  subtitle: string;
}) {
  const { bathrooms, loading } = useContext(BathroomContext);
  const { user } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

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

  const sortedBathrooms = useMemo(() => {
    if (mode === "topRated") {
      return [...bathroomsWithLocation].sort((left, right) => {
        const leftAvg =
          left.reviews.length > 0
            ? left.reviews.reduce((sum, review) => sum + review.rating, 0) / left.reviews.length
            : 0;
        const rightAvg =
          right.reviews.length > 0
            ? right.reviews.reduce((sum, review) => sum + review.rating, 0) / right.reviews.length
            : 0;
        return rightAvg - leftAvg;
      });
    }

    if (mode === "nearest") {
      const center = bathroomsWithLocation[0]?.location;
      if (!center) return bathroomsWithLocation;

      const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
      const distanceKm = (bathroom: Bathroom) => {
        const earthRadiusKm = 6371;
        const dLat = toRadians(bathroom.location.latitude - center.latitude);
        const dLng = toRadians(bathroom.location.longitude - center.longitude);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRadians(center.latitude)) *
            Math.cos(toRadians(bathroom.location.latitude)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusKm * c;
      };

      return [...bathroomsWithLocation].sort((left, right) => distanceKm(left) - distanceKm(right));
    }

    if (!user) return [];

    return [...bathroomsWithLocation]
      .filter((bathroom) => bathroom.reviews.some((review) => review.authorUid === user.uid))
      .sort((left, right) => {
        const leftLatest = left.reviews.filter((review) => review.authorUid === user.uid)[0]?.rating ?? 0;
        const rightLatest = right.reviews.filter((review) => review.authorUid === user.uid)[0]?.rating ?? 0;
        return rightLatest - leftLatest;
      });
  }, [bathroomsWithLocation, mode, user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0D6A94" />
        <Text style={styles.loadingText}>Loading bathrooms...</Text>
      </View>
    );
  }

  if (mode === "nearest") {
    return (
      <View style={styles.splitContainer}>
        <View style={styles.mapHalf}>
          <MapView style={styles.map} initialRegion={defaultRegion}>
            {bathroomsWithLocation.map((bathroom) => (
              <Marker
                key={bathroom.id}
                coordinate={bathroom.location}
                title={bathroom.name}
                onPress={() => navigation.navigate("Detail", { bathroom })}
              />
            ))}
          </MapView>
        </View>

        <View style={styles.listHalf}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <FlatList
            data={sortedBathrooms}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>No bathrooms to show yet.</Text>}
            renderItem={({ item, index }) => (
              <View>
                <Text style={styles.rank}>#{index + 1}</Text>
                <BathroomCard
                  bathroom={item}
                  onPress={() => navigation.navigate("Detail", { bathroom: item })}
                />
              </View>
            )}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <FlatList
        data={sortedBathrooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No bathrooms to show yet.</Text>}
        renderItem={({ item, index }) => (
          <View>
            <Text style={styles.rank}>#{index + 1}</Text>
            <BathroomCard
              bathroom={item}
              onPress={() => navigation.navigate("Detail", { bathroom: item })}
            />
          </View>
        )}
      />
    </View>
  );
}

export function TopRatedScreen() {
  return (
    <RankedBathroomsView
      mode="topRated"
      title="Highest Rated"
      subtitle="Best overall bathrooms in the city"
    />
  );
}

export function NearestScreen() {
  return (
    <RankedBathroomsView
      mode="nearest"
      title="Nearest"
      subtitle="Closest bathrooms around your map area"
    />
  );
}

export function MyRatingsScreen() {
  return (
    <RankedBathroomsView
      mode="myRatings"
      title="My Ranking"
      subtitle="Bathrooms ranked by your own reviews"
    />
  );
}

const styles = StyleSheet.create({
  splitContainer: {
    flex: 1,
    backgroundColor: "#EEF6FA",
  },
  mapHalf: {
    height: "50%",
    borderBottomWidth: 1,
    borderBottomColor: "#D3E2EB",
  },
  map: {
    flex: 1,
  },
  listHalf: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  container: {
    flex: 1,
    backgroundColor: "#EEF6FA",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#14374B",
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 10,
    color: "#4E697C",
  },
  rank: {
    color: "#2A4E64",
    fontWeight: "800",
    marginBottom: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    marginTop: 20,
    color: "#5D798B",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF6FA",
  },
  loadingText: {
    marginTop: 8,
    color: "#4E697C",
  },
});