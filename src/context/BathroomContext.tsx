import React, { createContext, useEffect, useState, ReactNode } from "react";
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  GeoPoint,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import {
  Bathroom,
  BathroomReview,
  NewBathroomInput,
  NewBathroomReviewInput,
} from "../types/Bathroom";
import { db } from "../lib/firebase";
import { auth } from "../lib/firebase";

interface BathroomContextType {
  bathrooms: Bathroom[];
  loading: boolean;
  addBathroom: (bathroom: NewBathroomInput) => Promise<void>;
  addReview: (bathroomId: string, review: NewBathroomReviewInput) => Promise<void>;
}

export const BathroomContext = createContext<BathroomContextType>(
  {} as BathroomContextType
);

export const BathroomProvider = ({ children }: { children: ReactNode }) => {
  const [bathrooms, setBathrooms] = useState<Bathroom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bathroomsRef = collection(db, "bathrooms");

    const unsubscribe = onSnapshot(
      bathroomsRef,
      (snapshot) => {
        void (async () => {
          const nextBathrooms = await Promise.all(
            snapshot.docs.map(async (bathroomDoc: QueryDocumentSnapshot<DocumentData>) => {
              const data = bathroomDoc.data();
              const location = data.location as GeoPoint | undefined;
              const createdAt = data.createdAt as Timestamp | undefined;

              const reviewsSnapshot = await getDocs(
                collection(db, "bathrooms", bathroomDoc.id, "reviews")
              );

              const reviews = reviewsSnapshot.docs
                .map((reviewDoc: QueryDocumentSnapshot<DocumentData>) => {
                  const reviewData = reviewDoc.data();
                  const reviewCreatedAt = reviewData.createdAt as Timestamp | undefined;

                  return {
                    id: reviewDoc.id,
                    rating: Number(reviewData.rating) || 0,
                    comment: String(reviewData.comment ?? ""),
                    authorUid: String(reviewData.authorUid ?? ""),
                    authorEmail: String(reviewData.authorEmail ?? ""),
                    authorName: String(reviewData.authorName ?? ""),
                    createdAt: reviewCreatedAt?.toDate(),
                  } as BathroomReview;
                })
                .sort((left, right) => {
                  const leftTime = left.createdAt?.getTime() ?? 0;
                  const rightTime = right.createdAt?.getTime() ?? 0;
                  return rightTime - leftTime;
                });

              return {
                id: bathroomDoc.id,
                name: data.name,
                location: {
                  latitude: location?.latitude ?? 0,
                  longitude: location?.longitude ?? 0,
                },
                cleanliness: data.cleanliness ?? 3,
                accessStatus: data.accessStatus ?? "public",
                restroomCount: Number(data.restroomCount) || 1,
                directions: String(data.directions ?? ""),
                amenities: Array.isArray(data.amenities) ? data.amenities : [],
                reviews,
                createdAt: createdAt?.toDate(),
              } as Bathroom;
            })
          );

          nextBathrooms.sort((left, right) => {
            const leftTime = left.createdAt?.getTime() ?? 0;
            const rightTime = right.createdAt?.getTime() ?? 0;
            return rightTime - leftTime;
          });

          setBathrooms(nextBathrooms);
          setLoading(false);
        })();
      },
      (error) => {
        console.error("Firestore bathrooms listener error:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const addBathroom = async (bathroom: NewBathroomInput) => {
    const {
      name,
      coords,
      cleanliness,
      accessStatus,
      restroomCount,
      directions,
      amenities,
      firstReviewComment,
      firstReviewRating,
    } = bathroom;

    const bathroomRef = await addDoc(collection(db, "bathrooms"), {
      name,
      location: new GeoPoint(coords.lat, coords.lng),
      cleanliness,
      accessStatus,
      restroomCount,
      directions: directions.trim(),
      amenities,
      createdAt: serverTimestamp(),
    });

    if (firstReviewComment?.trim()) {
      const initialRating = Number.isFinite(firstReviewRating)
        ? Number((firstReviewRating as number).toFixed(2))
        : Number(cleanliness.toFixed(2));

      await addDoc(collection(db, "bathrooms", bathroomRef.id, "reviews"), {
        rating: initialRating,
        comment: firstReviewComment.trim(),
        authorUid: auth.currentUser?.uid ?? "",
        authorEmail: auth.currentUser?.email ?? "",
        authorName: auth.currentUser?.displayName ?? "",
        createdAt: serverTimestamp(),
      });
    }
  };

  const addReview = async (bathroomId: string, review: NewBathroomReviewInput) => {
    const normalizedRating = Number(review.rating.toFixed(2));

    await addDoc(collection(db, "bathrooms", bathroomId, "reviews"), {
      rating: normalizedRating,
      comment: review.comment.trim(),
      authorUid: auth.currentUser?.uid ?? "",
      authorEmail: auth.currentUser?.email ?? "",
      authorName: auth.currentUser?.displayName ?? "",
      createdAt: serverTimestamp(),
    });
  };

  return (
    <BathroomContext.Provider value={{ bathrooms, loading, addBathroom, addReview }}>
      {children}
    </BathroomContext.Provider>
  );
};