import React, { useContext, useMemo, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	Pressable,
	Alert,
	ScrollView,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { BathroomContext } from "../context/BathroomContext";

type Props = {
	route: RouteProp<RootStackParamList, "Detail">;
};

export default function DetailScreen({ route }: Props) {
  const { bathroom } = route.params;
  const { bathrooms, addReview } = useContext(BathroomContext);
  const [reviewText, setReviewText] = useState("");
	const [ratingInput, setRatingInput] = useState("5.00");

  const currentBathroom = useMemo(() => {
    return bathrooms.find((item) => item.id === bathroom.id) ?? bathroom;
  }, [bathroom, bathrooms]);

  const handleAddReview = async () => {
    if (!reviewText.trim()) {
      Alert.alert("Missing review", "Please write a short review before submitting.");
      return;
    }

		const trimmedRating = ratingInput.trim();
		const decimalPattern = /^\d+(\.\d{1,2})?$/;

		if (!decimalPattern.test(trimmedRating)) {
			Alert.alert("Invalid rating", "Use a number with up to 2 decimals (e.g. 4.25).");
			return;
		}

		const rating = Number(trimmedRating);
		if (Number.isNaN(rating) || rating < 0 || rating > 5) {
			Alert.alert("Invalid rating", "Rating must be between 0 and 5.");
			return;
		}

    await addReview(currentBathroom.id, {
			rating: Number(rating.toFixed(2)),
			comment: reviewText,
    });

    setReviewText("");
		setRatingInput("5.00");
  };

  const reviewCount = currentBathroom.reviews?.length ?? 0;
  const averageRating =
    reviewCount > 0
      ? (
          currentBathroom.reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviewCount
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
		<ScrollView style={styles.container} contentContainerStyle={styles.content}>
			<View style={styles.card}>
				<Text style={styles.title}>{currentBathroom.name}</Text>
				<Text style={styles.sectionLabel}>Cleanliness</Text>
				<Text style={styles.value}>{currentBathroom.cleanliness}/5</Text>

				<Text style={styles.sectionLabel}>Amenities</Text>
				<Text style={styles.value}>
					{currentBathroom.amenities.length > 0
						? currentBathroom.amenities.join(", ")
						: "No amenities listed"}
				</Text>

				<Text style={styles.sectionLabel}>Access status</Text>
				<View
					style={[
						styles.accessBadge,
						{ backgroundColor: accessColorMap[currentBathroom.accessStatus] },
					]}
				>
					<Text style={styles.accessBadgeText}>{accessLabelMap[currentBathroom.accessStatus]}</Text>
				</View>

				<Text style={styles.sectionLabel}>Restrooms in establishment</Text>
				<Text style={styles.value}>{currentBathroom.restroomCount}</Text>

				<Text style={styles.sectionLabel}>How to find it</Text>
				<Text style={styles.value}>
					{currentBathroom.directions?.trim()
						? currentBathroom.directions
						: "No directions provided yet."}
				</Text>

				<Text style={styles.sectionLabel}>Reviews</Text>
				<Text style={styles.value}>Count: {reviewCount} • Average: {averageRating}</Text>

				<Text style={styles.sectionLabel}>Coordinates</Text>
				<Text style={styles.value}>
					{currentBathroom.location.latitude.toFixed(5)}, {currentBathroom.location.longitude.toFixed(5)}
				</Text>

				<Text style={styles.sectionLabel}>Add a review</Text>
				<TextInput
					placeholder="4.25"
					placeholderTextColor="#8198A8"
					value={ratingInput}
					onChangeText={setRatingInput}
					style={styles.ratingInput}
					keyboardType="decimal-pad"
				/>

				<TextInput
					placeholder="Share your experience..."
					placeholderTextColor="#8198A8"
					value={reviewText}
					onChangeText={setReviewText}
					style={styles.input}
					multiline
				/>
				<Pressable style={styles.addReviewButton} onPress={handleAddReview}>
					<Text style={styles.addReviewButtonText}>Submit Review</Text>
				</Pressable>

				<Text style={styles.sectionLabel}>Recent reviews</Text>
				{reviewCount === 0 ? (
					<Text style={styles.value}>No reviews yet.</Text>
				) : (
					currentBathroom.reviews.map((review) => (
						<View key={review.id} style={styles.reviewCard}>
							<Text style={styles.reviewMeta}>Rating: {review.rating.toFixed(2)}/5</Text>
							<Text style={styles.reviewText}>{review.comment}</Text>
						</View>
					))
				)}
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#EEF6FA",
	},
	content: {
		padding: 16,
	},
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 18,
		borderWidth: 1,
		borderColor: "#D9E6EE",
	},
	title: {
		fontSize: 24,
		fontWeight: "800",
		color: "#12374C",
		marginBottom: 14,
	},
	sectionLabel: {
		fontSize: 12,
		fontWeight: "700",
		color: "#5B7688",
		marginTop: 10,
		textTransform: "uppercase",
	},
	value: {
		marginTop: 4,
		color: "#23475D",
		fontSize: 15,
		lineHeight: 22,
	},
	accessBadge: {
		marginTop: 8,
		alignSelf: "flex-start",
		borderRadius: 999,
		paddingHorizontal: 12,
		paddingVertical: 6,
	},
	accessBadgeText: {
		color: "#FFFFFF",
		fontWeight: "800",
		fontSize: 12,
	},
	ratingInput: {
		marginTop: 10,
		borderWidth: 1,
		borderColor: "#C7D9E4",
		backgroundColor: "#F8FCFF",
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		color: "#23475D",
	},
	input: {
		marginTop: 10,
		borderWidth: 1,
		borderColor: "#C7D9E4",
		backgroundColor: "#F8FCFF",
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		minHeight: 80,
		textAlignVertical: "top",
		color: "#23475D",
	},
	addReviewButton: {
		marginTop: 10,
		backgroundColor: "#0D6A94",
		borderRadius: 10,
		alignItems: "center",
		paddingVertical: 12,
	},
	addReviewButtonText: {
		color: "#FFFFFF",
		fontWeight: "800",
	},
	reviewCard: {
		marginTop: 10,
		borderWidth: 1,
		borderColor: "#D6E4EC",
		borderRadius: 10,
		padding: 10,
		backgroundColor: "#F9FCFF",
	},
	reviewMeta: {
		fontWeight: "700",
		color: "#2A4C62",
		marginBottom: 4,
	},
	reviewText: {
		color: "#3A5B6F",
		lineHeight: 20,
	},
});
