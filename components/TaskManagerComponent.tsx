import React, { useEffect } from "react";
import { LocationObject } from "expo-location";
import * as TaskManager from "expo-task-manager";
import { useGlobal } from "../context/GlobalContext";

const LOCATION_TRACKING = "location-tracking";
const DISCORD_USER_ID = process.env.EXPO_PUBLIC_DISCORD_USER_ID!;
const LANYARD_API_KEY = process.env.EXPO_PUBLIC_LANYARD_API_KEY!;

const update = async (lat: number, lon: number) => {
  const reverse =
    `https://api.bigdatacloud.net/data/reverse-geocode-client` +
    `?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
  const lanyard = `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}/kv/location`;

  const json = await fetch(reverse).then((res) => res.json());
  const location = [json.city, json.countryCode].join(", ");

  await fetch(lanyard, {
    method: "PUT",
    body: location,
    headers: { Authorization: LANYARD_API_KEY },
  });

  return json;
};

export const TaskManagerComponent: React.FC = () => {
  const { setGlobalValue } = useGlobal();

  useEffect(() => {
    TaskManager.defineTask<{ locations: LocationObject[] }>(
      LOCATION_TRACKING,
      async ({ data, error }) => {
        if (error) {
          return;
        }

        if (data) {
          const [current] = data.locations;
          const lat = current.coords.latitude;
          const lon = current.coords.longitude;

          const geocode = await update(lat, lon);

          setGlobalValue({
            latitude: lat,
            longitude: lon,
            city: geocode.city,
            country: geocode.countryName,
          });
        }
      },
    );
  }, [setGlobalValue]);

  return null;
};
