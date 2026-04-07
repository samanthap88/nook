import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const { user, profile, signOutUser, addFriendByEmail, removeFriend } = useAuth();
  const [friendEmail, setFriendEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const friends = useMemo(() => profile?.friends ?? [], [profile]);

  const handleAddFriend = async () => {
    try {
      setSaving(true);
      await addFriendByEmail(friendEmail);
      setFriendEmail("");
    } catch (error: any) {
      Alert.alert("Could not add friend", error?.message ?? "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{profile?.displayName || user?.displayName || "My Profile"}</Text>
        <Text style={styles.subtitle}>{profile?.email || user?.email || ""}</Text>

        <Text style={styles.sectionLabel}>Add friend by email</Text>
        <TextInput
          placeholder="friend@example.com"
          placeholderTextColor="#8A9AA8"
          value={friendEmail}
          onChangeText={setFriendEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <Pressable style={styles.button} onPress={handleAddFriend} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? "Saving..." : "Add Friend"}</Text>
        </Pressable>

        <Text style={styles.sectionLabel}>My friends</Text>
        {friends.length === 0 ? (
          <Text style={styles.emptyText}>No friends yet.</Text>
        ) : (
          friends.map((email) => (
            <View key={email} style={styles.friendRow}>
              <Text style={styles.friendText}>{email}</Text>
              <Pressable onPress={() => removeFriend(email)}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          ))
        )}

        <Pressable style={styles.signOutButton} onPress={signOutUser}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF6FA",
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9E6EE",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#12374C",
  },
  subtitle: {
    marginTop: 4,
    color: "#4E697C",
    marginBottom: 14,
  },
  sectionLabel: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "800",
    color: "#5B7688",
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderColor: "#C7D9E4",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: "#F8FCFF",
    color: "#23475D",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#0D6A94",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  emptyText: {
    color: "#5D798B",
  },
  friendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5EEF3",
  },
  friendText: {
    color: "#24485D",
  },
  removeText: {
    color: "#CC3D3D",
    fontWeight: "700",
  },
  signOutButton: {
    marginTop: 18,
    borderRadius: 12,
    backgroundColor: "#FFF4F4",
    borderWidth: 1,
    borderColor: "#F1C8C8",
    paddingVertical: 12,
    alignItems: "center",
  },
  signOutText: {
    color: "#A43A3A",
    fontWeight: "800",
  },
});
