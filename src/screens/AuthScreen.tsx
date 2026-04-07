import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Enter your email and password.");
      return;
    }

    if (isSignUp && !displayName.trim()) {
      Alert.alert("Missing name", "Enter a display name.");
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        await signUp(displayName, email, password);
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      const message = String(error?.message ?? "Please try again.");

      if (message.includes("auth/configuration-not-found")) {
        Alert.alert(
          "Firebase Auth not enabled",
          "Turn on Authentication in the Firebase Console for this project, then enable the Email/Password provider under Sign-in method. If you already did that, make sure this app is using the same Firebase project values from your .env file."
        );
        return;
      }

      Alert.alert("Authentication failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Nook</Text>
        <Text style={styles.subtitle}>Find bathrooms, rate them, and see what your friends think.</Text>

        {isSignUp ? (
          <>
            <TextInput
              placeholder="Display name"
              placeholderTextColor="#8A9AA8"
              value={displayName}
              onChangeText={setDisplayName}
              style={styles.input}
            />
            <View style={styles.spacer} />
          </>
        ) : null}

        <TextInput
          placeholder="Email"
          placeholderTextColor="#8A9AA8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <View style={styles.spacer} />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#8A9AA8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitButtonText}>{loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}</Text>
        </Pressable>

        <Pressable onPress={() => setIsSignUp((prev) => !prev)} style={styles.switchButton}>
          <Text style={styles.switchText}>
            {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EAF3F8",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#D6E4EC",
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#103047",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 18,
    color: "#4D6A7C",
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#BFD3DE",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#F9FCFF",
    color: "#14374B",
  },
  spacer: {
    height: 10,
  },
  submitButton: {
    marginTop: 14,
    backgroundColor: "#0D6A94",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  switchButton: {
    marginTop: 14,
    alignItems: "center",
  },
  switchText: {
    color: "#0D6A94",
    fontWeight: "700",
  },
});
