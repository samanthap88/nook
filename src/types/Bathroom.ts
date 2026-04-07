export interface BathroomReview {
  id: string;
  rating: number;
  comment: string;
  authorUid?: string;
  authorEmail?: string;
  authorName?: string;
  createdAt?: Date;
}

export type AccessStatus =
  | "public"
  | "customers_only"
  | "key_required"
  | "staff_only";

export interface Bathroom {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  cleanliness: number;
  accessStatus: AccessStatus;
  restroomCount: number;
  directions: string;
  amenities: string[];
  reviews: BathroomReview[];
  createdAt?: Date;
}

export interface NewBathroomInput {
  name: string;
  coords: {
    lat: number;
    lng: number;
  };
  cleanliness: number;
  accessStatus: AccessStatus;
  restroomCount: number;
  directions: string;
  amenities: string[];
  firstReviewComment?: string;
  firstReviewRating?: number;
}

export interface NewBathroomReviewInput {
  rating: number;
  comment: string;
}