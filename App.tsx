import "react-native-url-polyfill/auto";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GlobalProvider } from "./context/GlobalContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ListDetailComponent } from "./components/ListDetailComponent";
import { TaskManagerComponent } from "./components/TaskManagerComponent";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#151717",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    paddingTop: 80,
    paddingBottom: 80,
    gap: 10,
  },
});

export default function App() {
  const LOCATION_TRACKING = "location-tracking";
  const [status, setStatus] = useState<string>("Isn't it cool first?");

  const initialize = async () => {
    const foreground = await Location.requestForegroundPermissionsAsync();
    const background = await Location.requestBackgroundPermissionsAsync();

    if (foreground.status !== "granted" || background.status !== "granted") {
      setStatus("What's wrong\nwith you?!");
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
      started ? "Is monitoring\nyour moves!" : "Oops! Unable\nto monitor :(",
    );
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <GlobalProvider>
      <SafeAreaProvider>
        <StatusBar style="auto" />

        <View style={styles.container}>
          <Text
            style={{
              fontSize: 25,
              color: "#ecedee",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            {status.toUpperCase()}
          </Text>

          <ListDetailComponent />
          <TaskManagerComponent />

          <Text style={{ color: "#ecedee", marginTop: 20 }}>
            Follow @suluh_s
          </Text>
        </View>
      </SafeAreaProvider>
    </GlobalProvider>
  );
}
