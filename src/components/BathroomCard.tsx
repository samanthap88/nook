import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { Bathroom } from "../types/Bathroom";

type Props = {
  bathroom: Bathroom;
  onPress: () => void;
};

export default function BathroomCard({ bathroom, onPress }: Props) {
  const cleanlinessLabel = `${bathroom.cleanliness}/5`;
  const reviewCount = bathroom.reviews?.length ?? 0;
  const averageRating =
    reviewCount > 0
      ? (
          bathroom.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
        ).toFixed(2)
      : "N/A";

  const accessLabelMap = {
    public: "Public",
    customers_only: "Customers Only",
    key_required: "Key Required",
    staff_only: "Staff Only",
  } as const;

  const accessColorMap = {
    public: "#1A9D53",
    customers_only: "#E3972E",
    key_required: "#CC3D3D",
    staff_only: "#8A4FFF",
  } as const;

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{bathroom.name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{cleanlinessLabel}</Text>
        </View>
      </View>

      <Text style={styles.meta}>
        {bathroom.amenities.length > 0
          ? bathroom.amenities.join(" • ")
          : "No amenities listed"}
      </Text>

      <Text style={styles.meta}>Reviews: {reviewCount} • Avg: {averageRating}</Text>

      <View style={styles.infoRow}>
        <View
          style={[
            styles.accessBadge,
            { backgroundColor: accessColorMap[bathroom.accessStatus] },
          ]}
        >
          <Text style={styles.accessBadgeText}>{accessLabelMap[bathroom.accessStatus]}</Text>
        </View>
        <Text style={styles.meta}>Restrooms: {bathroom.restroomCount}</Text>
      </View>

      <Text style={styles.coords}>
        {bathroom.location.latitude.toFixed(4)}, {bathroom.location.longitude.toFixed(4)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D7E4ED",
    padding: 14,
    marginBottom: 10,
    shadowColor: "#233744",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  name: {
    fontWeight: "800",
    fontSize: 16,
    color: "#14374B",
    flex: 1,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#E4F4FB",
    borderWidth: 1,
    borderColor: "#B8D9EA",
  },
  badgeText: {
    color: "#0C638D",
    fontWeight: "800",
    fontSize: 12,
  },
  meta: {
    marginTop: 8,
    color: "#537084",
    fontSize: 13,
  },
  infoRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  accessBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  accessBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  coords: {
    marginTop: 7,
    color: "#6D8798",
    fontSize: 12,
  },
});