import 'react-native-url-polyfill/auto'
import * as Location from 'expo-location'
import { StatusBar } from 'expo-status-bar'
import * as SecureStore from 'expo-secure-store'
import * as TaskManager from 'expo-task-manager'
import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

const LOCATION_TRACKING = 'location-tracking'
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
const SUPABASE_ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value)
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key)
  },
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  }
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
})

export default function App() {
  const [status, setStatus] = useState(null)

  const initialize = async () => {
    const foreground = await Location.requestForegroundPermissionsAsync()
    const background = await Location.requestBackgroundPermissionsAsync()

    if (foreground.status !== 'granted' || background.status !== 'granted') {
      setStatus('Permission to access location was denied.')
      return
    }

    await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
      accuracy: Location.Accuracy.Highest,
      timeInterval: 5000,
      distanceInterval: 0,
    })

    const started = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TRACKING
    )

    setStatus(started ? 'Tracking started.' : 'Tracking not started.')
  }

  useEffect(() => {
    initialize()
  }, [])

  return (
    <>
      <StatusBar style="auto" />

      <SafeAreaProvider>
        <View style={styles.container}>
          <Text style={{ fontSize: 20 }}>{status}</Text>
        </View>
      </SafeAreaProvider>
    </>
  )
}

TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
  if (error) {
    console.error(error)
    return
  }

  if (data) {
    const [current] = data.locations
    const lat = current.coords.latitude
    const lng = current.coords.longitude

    await supabase
      .from('settings')
      .update({ value: lat })
      .eq('key', 'latitude')

    await supabase
      .from('settings')
      .update({ value: lng })
      .eq('key', 'longitude')

    console.log(`${new Date(Date.now()).toLocaleString()}: ${lat},${lng}`)
  }
})
