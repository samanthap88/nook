import React, { useContext, useMemo } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { BathroomContext } from "../context/BathroomContext";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/AppNavigator";

export function FeedScreen() {
  const { bathrooms, loading } = useContext(BathroomContext);
  const { profile } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const feedItems = useMemo(() => {
    const friendEmails = new Set((profile?.friends ?? []).map((friend) => friend.toLowerCase()));

    return bathrooms
      .flatMap((bathroom) =>
        bathroom.reviews
          .filter((review) => review.authorEmail && friendEmails.has(review.authorEmail.toLowerCase()))
          .map((review) => ({ bathroom, review }))
      )
      .sort((left, right) => {
        const leftTime = left.review.createdAt?.getTime() ?? 0;
        const rightTime = right.review.createdAt?.getTime() ?? 0;
        return rightTime - leftTime;
      });
  }, [bathrooms, profile?.friends]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Feed</Text>
      <Text style={styles.subtitle}>Reviews from your friends</Text>

      <FlatList
        data={feedItems}
        keyExtractor={(item) => `${item.bathroom.id}-${item.review.id}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No friend reviews yet</Text>
            <Text style={styles.emptyText}>
              Add friends in your profile to see their reviews here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate("Detail", { bathroom: item.bathroom })}>
            <Text style={styles.bathroomName}>{item.bathroom.name}</Text>
            <Text style={styles.meta}>
              {item.review.authorName || item.review.authorEmail || "Friend"} • {item.review.rating.toFixed(2)}/5
            </Text>
            <Text style={styles.comment}>{item.review.comment}</Text>
          </Pressable>
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
    fontSize: 24,
    fontWeight: "800",
    color: "#14374B",
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 10,
    color: "#4E697C",
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D7E4ED",
    padding: 14,
    marginBottom: 10,
  },
  bathroomName: {
    fontWeight: "800",
    color: "#14374B",
    fontSize: 16,
  },
  meta: {
    marginTop: 4,
    color: "#5A7587",
  },
  comment: {
    marginTop: 8,
    color: "#23475D",
    lineHeight: 20,
  },
  emptyBox: {
    marginTop: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D7E4ED",
    padding: 16,
  },
  emptyTitle: {
    fontWeight: "800",
    color: "#14374B",
  },
  emptyText: {
    marginTop: 4,
    color: "#5D798B",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF6FA",
  },
  loadingText: {
    color: "#4E697C",
  },
});
