import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import AuthScreen from "./src/screens/AuthScreen";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { BathroomProvider } from "./src/context/BathroomContext";
import { SafeAreaView } from "react-native-safe-area-context";

function RootContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#EEF6FA" }}>
        <ActivityIndicator size="large" color="#0D6A94" />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1 }}>
        <AppNavigator />
      </SafeAreaView>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BathroomProvider>
        <RootContent />
      </BathroomProvider>
    </AuthProvider>
  );
}