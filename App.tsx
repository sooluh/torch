import "react-native-url-polyfill/auto";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import * as TaskManager from "expo-task-manager";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

const LOCATION_TRACKING = "location-tracking";
const DISCORD_USER_ID = process.env.EXPO_PUBLIC_DISCORD_USER_ID!;
const LANYARD_API_KEY = process.env.EXPO_PUBLIC_LANYARD_API_KEY!;

console.log(DISCORD_USER_ID, LANYARD_API_KEY);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#151717",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
});

const update = async (lat: number, lon: number) => {
  const reverse = `https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`;
  const lanyard = `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}/kv/location`;

  const json = await fetch(reverse).then((res) => res.json());
  const location = [
    json.address.town || json.address.county || json.address.village || 'Mars',
    json.address.country_code.toUpperCase(),
  ].join(", ");

  const response = await fetch(lanyard, {
    method: "PUT",
    body: location,
    headers: { Authorization: LANYARD_API_KEY },
  });

  console.log(response);
};

export default function App() {
  const [status, setStatus] = useState<string>("Isn't it cool first?");

  const initialize = async () => {
    const foreground = await Location.requestForegroundPermissionsAsync();
    const background = await Location.requestBackgroundPermissionsAsync();

    if (foreground.status !== "granted" || background.status !== "granted") {
      setStatus("What's wrong with you?!");
      return;
    }

    await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
      accuracy: Location.Accuracy.Highest,
      // 1 minute
      timeInterval: 60000,
      distanceInterval: 0,
    });

    const started = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TRACKING,
    );

    setStatus(
      started ? "Is monitoring your moves!" : "Oops! Unable to monitor :(",
    );
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <>
      <StatusBar style="auto" />

      <SafeAreaProvider>
        <View style={styles.container}>
          <Text style={{ fontSize: 20, color: "#ecedee" }}>{status}</Text>
          <Text style={{ color: "#ecedee", marginTop: 10 }}>
            Follow @suluh_s
          </Text>
        </View>
      </SafeAreaProvider>
    </>
  );
}

TaskManager.defineTask<{ locations: Location.LocationObject[] }>(
  LOCATION_TRACKING,
  async ({ data, error }) => {
    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      const [current] = data.locations;
      const lat = current.coords.latitude;
      const lon = current.coords.longitude;

      await update(lat, lon);
      console.log(`${new Date(Date.now()).toLocaleString()}: ${lat},${lon}`);
    }
  },
);
