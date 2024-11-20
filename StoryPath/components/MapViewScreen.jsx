// components/MapViewScreen.jsx

import React, { useState, useCallback } from "react";
import { StyleSheet, View, Text, ActivityIndicator, Alert } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { getDistance } from "geolib";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import BottomNavigation from "../components/BottomNavigation";
import { getLocations } from "../api/api.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * MapViewScreen Component
 *
 * Displays a map with markers representing various locations associated with a project.
 * Users can see their current location, view unlocked locations, and interact with different map markers.
 * The component handles location permissions, data fetching, and error management to provide a seamless user experience.
 *
 * @returns {JSX.Element} The rendered MapViewScreen component.
 */
export default function MapViewScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [unlockedLocations, setUnlockedLocations] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  // Retrieve projectId from local search parameters
  const { projectId } = useLocalSearchParams();

  // Define the proximity radius in meters for unlocking locations
  const PROXIMITY_RADIUS = 100;

  /**
   * Parses a position string in the format "(latitude, longitude)" and returns an object with numeric latitude and longitude.
   *
   * @param {string} positionString - The position string to parse.
   * @returns {{ latitude: number | null, longitude: number | null }} An object containing latitude and longitude.
   */
  const parsePositionString = (positionString) => {
    if (!positionString) return { latitude: null, longitude: null };
    const coords = positionString.replace(/[()]/g, "").split(",").map(Number);
    return { latitude: coords[0], longitude: coords[1] };
  };

  /**
   * useFocusEffect hook to fetch data when the screen comes into focus.
   * Ensures data is up-to-date whenever the user navigates to this screen.
   */
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      /**
       * Fetches user location and project-related locations from the API.
       * Handles permissions, data parsing, and state updates.
       * Implements error handling to manage potential issues during data fetching.
       */
      const fetchData = async () => {
        try {
          setLoading(true);

          // Request foreground location permissions from the user
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            setErrorMsg(
              "Location permission is required to use this function."
            );
            setLoading(false);
            return;
          }

          // Get the current user location
          let loc = await Location.getCurrentPositionAsync({});
          if (isActive) {
            setLocation(loc.coords);
          }

          // Fetch all locations related to the project from the API
          const fetchedLocations = await getLocations(projectId);

          // Parse and structure fetched locations with latitude and longitude
          const locationsWithCoords = fetchedLocations.map((loc) => {
            const { latitude, longitude } = parsePositionString(
              loc.location_position
            );
            return { ...loc, latitude, longitude };
          });

          if (isActive) {
            setAllLocations(locationsWithCoords);
          }

          // Retrieve visited (unlocked) locations from AsyncStorage
          const visitedLocationsJSON = await AsyncStorage.getItem(
            `visitedLocations_${projectId}`
          );
          const visitedLocations = visitedLocationsJSON
            ? JSON.parse(visitedLocationsJSON)
            : [];

          // Filter locations that have been unlocked by the user
          const unlocked = locationsWithCoords.filter((loc) =>
            visitedLocations.includes(loc.id)
          );
          if (isActive) {
            setUnlockedLocations(unlocked);
          }
        } catch (error) {
          console.error("Error fetching locations:", error);
          Alert.alert(
            "Error",
            "Cannot fetch locations. Please try again later."
          );
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      fetchData();

      return () => {
        isActive = false;
      };
    }, [projectId])
  );

  /**
   * Renders map markers for all locations.
   * Differentiates markers based on whether they are unlocked or within the proximity radius.
   *
   * @returns {JSX.Element[] | null} An array of Marker and Circle components or null if location is unavailable.
   */
  const renderMarkers = () => {
    if (!location) return null;

    return allLocations.map((loc) => {
      if (!loc.latitude || !loc.longitude) {
        console.warn("Location missing latitude or longitude:", loc);
        return null;
      }

      // Calculate distance between user location and the location marker
      const distance = getDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: loc.latitude, longitude: loc.longitude }
      );

      const isWithinRadius = distance <= PROXIMITY_RADIUS;
      const isUnlocked = unlockedLocations.some(
        (unlockedLoc) => unlockedLoc.id === loc.id
      );

      return (
        <View key={loc.id}>
          <Marker
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.location_name}
            description={loc.description}
            pinColor={isUnlocked ? "green" : isWithinRadius ? "blue" : "red"}
          />
          <Circle
            center={{ latitude: loc.latitude, longitude: loc.longitude }}
            radius={PROXIMITY_RADIUS}
            strokeColor={
              isWithinRadius ? "rgba(0,0,255,0.5)" : "rgba(255,0,0,0.5)"
            }
            fillColor={
              isWithinRadius ? "rgba(0,0,255,0.2)" : "rgba(255,0,0,0.2)"
            }
          />
        </View>
      );
    });
  };

  // Display a loading indicator while data is being fetched
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6f61" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Display an error message if there was an issue fetching data
  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  const activeScreen = "mapView";

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation={true}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {renderMarkers()}
      </MapView>
      {/* Bottom Navigation Component */}
      <BottomNavigation projectId={projectId} activeScreen={activeScreen} />
    </View>
  );
}

// stylesheet for the MapViewScreen component
const styles = StyleSheet.create({
  /**
   * Container for the entire screen.
   * Ensures the map takes up the full available space.
   */
  container: {
    flex: 1,
  },

  /**
   * Style for the MapView component.
   * Ensures the map covers the entire container.
   */
  map: {
    flex: 1,
  },

  /**
   * Container displayed while data is loading.
   * Centers the loading indicator and message.
   */
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  /**
   * Text style for the loading message.
   */
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },

  /**
   * Container displayed when an error occurs.
   * Centers the error message.
   */
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  /**
   * Text style for the error message.
   */
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
});
