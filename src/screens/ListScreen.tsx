import React, { useContext } from "react";
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from "react-native";
import { BathroomContext } from "../context/BathroomContext";
import BathroomCard from "../components/BathroomCard";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = {
  navigation: StackNavigationProp<RootStackParamList>;
};

export default function ListScreen({ navigation }: Props) {
  const { bathrooms, loading } = useContext(BathroomContext);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0D6A94" />
        <Text style={styles.loadingText}>Loading bathrooms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Bathrooms</Text>
      <Text style={styles.subtitle}>{bathrooms.length} locations available</Text>
      <FlatList
        data={bathrooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No bathrooms yet</Text>
            <Text style={styles.emptyText}>
              Add your first location from the map screen.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <BathroomCard
            bathroom={item}
            onPress={() =>
              navigation.navigate("Detail", { bathroom: item })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF6FA",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#14374B",
  },
  subtitle: {
    color: "#4E697C",
    marginTop: 4,
    marginBottom: 14,
  },
  listContent: {
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF6FA",
  },
  loadingText: {
    marginTop: 10,
    color: "#4E697C",
  },
  emptyBox: {
    marginTop: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D7E4ED",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#14374B",
  },
  emptyText: {
    marginTop: 6,
    color: "#567486",
    lineHeight: 20,
  },
});