import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import AddBathroomScreen from "../screens/AddBathroomScreen";
import DetailScreen from "../screens/DetailScreen";
import { TopRatedScreen, NearestScreen, MyRatingsScreen } from "../screens/RankedBathroomsScreen";
import { FeedScreen } from "../screens/FeedScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { Bathroom } from "../types/Bathroom";

export type RootStackParamList = {
  HomeTabs: undefined;
  AddBathroom: undefined;
  Detail: { bathroom: Bathroom };
};

type HomeTabsParamList = {
  MyFeed: undefined;
  TopRated: undefined;
  Nearest: undefined;
  MyRanking: undefined;
  MyProfile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<HomeTabsParamList>();

function HomeTabsNavigator() {
  return (
    <Tabs.Navigator
      initialRouteName="Nearest"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#0D6A94",
        tabBarInactiveTintColor: "#6A8598",
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === "MyFeed"
              ? "chatbubbles"
              : route.name === "TopRated"
                ? "star"
                : route.name === "Nearest"
                  ? "navigate"
                  : route.name === "MyRanking"
                    ? "trophy"
                    : "person-circle";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          height: 74,
          paddingBottom: 16,
          paddingTop: 8,
          borderTopColor: "#D1E0E9",
          borderTopWidth: 1,
          backgroundColor: "#FFFFFF",
        },
      })}
    >
      <Tabs.Screen name="MyFeed" component={FeedScreen} options={{ title: "My Feed" }} />
      <Tabs.Screen name="TopRated" component={TopRatedScreen} options={{ title: "Top Rated" }} />
      <Tabs.Screen name="Nearest" component={NearestScreen} options={{ title: "Nearest" }} />
      <Tabs.Screen name="MyRanking" component={MyRatingsScreen} options={{ title: "My Ranking" }} />
      <Tabs.Screen name="MyProfile" component={ProfileScreen} options={{ title: "My Profile" }} />
    </Tabs.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="HomeTabs"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0D6A94",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "800",
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="HomeTabs"
        component={HomeTabsNavigator}
        options={({ navigation }) => ({
          title: "Nook",
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable style={styles.headerButtonPrimary} onPress={() => navigation.navigate("AddBathroom") }>
                <Text style={styles.headerButtonPrimaryText}>Add</Text>
              </Pressable>
            </View>
          ),
        })}
      />
      <Stack.Screen name="AddBathroom" component={AddBathroomScreen} options={{ title: "Add Bathroom" }} />
      <Stack.Screen name="Detail" component={DetailScreen} options={{ title: "Details" }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 10,
  },
  headerButtonPrimary: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headerButtonPrimaryText: {
    color: "#0D6A94",
    fontWeight: "800",
    fontSize: 12,
  },
});
