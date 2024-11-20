// ProjectHomeScreen.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  Button,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  getProject,
  getLocations,
  updateLocationVisit,
  createTracking,
} from "../api/api.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { getDistance } from "geolib";
import BottomNavigation from "../components/BottomNavigation";

/**
 * ProjectHomeScreen Component
 *
 * This component displays the home screen for a specific project. It fetches project details,
 * locations associated with the project, and manages user interactions such as visiting locations.
 * It also handles location tracking to automatically detect when a user is near a location.
 *
 * @returns {JSX.Element} The rendered ProjectHomeScreen component.
 */
export default function ProjectHomeScreen() {
  // State variables to manage project data, locations, user interactions, and loading state
  const [project, setProject] = useState(null);
  const [locations, setLocations] = useState([]);
  const [points, setPoints] = useState(0);
  const [pointsPossible, setPointsPossible] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentLocationContent, setCurrentLocationContent] = useState(null);

  const { projectId } = useLocalSearchParams();
  const router = useRouter();

  const [visitedLocations, setVisitedLocations] = useState(new Set());
  const visitedLocationsRef = useRef(new Set());
  const processingRef = useRef(false);

  // keep a reference to visitedLocations for use in useEffect
  useEffect(() => {
    visitedLocationsRef.current = visitedLocations;
  }, [visitedLocations]);

  /**
 * Parses a position string into an object containing latitude and longitude as numbers.
 *
 * @function parsePositionString
 * @param {string} positionString - A position string in the format "(latitude, longitude)".
 * @returns {{latitude: number | null, longitude: number | null}} An object with latitude and longitude.
 * Returns null values if the input string is invalid or empty.
 *
 */
  const parsePositionString = (positionString) => {
    if (!positionString) return { latitude: null, longitude: null };
    const coords = positionString.replace(/[()]/g, "").split(",").map(Number);
    return { latitude: coords[0], longitude: coords[1] };
  };

  /**
 * Fetches project and location data from the backend, and updates the state accordingly.
 * Retrieves project details, associated locations, and any previously visited locations.
 * Also calculates the total possible points for all locations in the project.
 *
 * @async
 * @function fetchData
 * @returns {Promise<void>} No return value, updates component state directly.
 * @throws Will alert and log errors if data retrieval fails.
 *
 */
  const fetchData = useCallback(async () => {
    try {
      // get project data
      const projectData = await getProject(projectId);
      if (!projectData || projectData.length === 0) {
        Alert.alert("Error", "Project not found.");
        setProject(null);
        return;
      }
      setProject(projectData[0]);

      // Get location data and parse coordinates
      const allLocations = await getLocations(projectId);
      console.log("Fetched locations:", allLocations);

      // Parse and set location coordinates
      const locationsWithCoords = allLocations.map((loc) => ({
        ...loc,
        ...parsePositionString(loc.location_position),
      }));
      setLocations(locationsWithCoords);

      // Get visited locations from AsyncStorage
      const visitedLocationsData = await AsyncStorage.getItem(
        `visitedLocations_${projectId}`
      );
      const visitedArray = visitedLocationsData
        ? JSON.parse(visitedLocationsData)
        : [];
      const visitedSet = new Set(visitedArray);
      setVisitedLocations(visitedSet);

      // Calculate total possible points
      const totalPossiblePoints = allLocations.reduce(
        (sum, loc) => sum + (Number(loc.score_points) || 0),
        0
      );
      setPointsPossible(totalPossiblePoints);
    } catch (error) {
      console.error("Fetch Data Error:", error);
      Alert.alert("Error", "Unable to load project or location data.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
 * Calculates and updates the user's total points based on visited locations.
 * Loops through each location, checking if it's in the visitedLocations set. 
 * Accumulates score points from all visited locations and sets the points state.
 *
 * @function calculatePoints
 * @returns {void} No return value, directly updates the points state.
 *
 */
  useEffect(() => {
    const calculatePoints = () => {
      const total = locations.reduce((sum, loc) => {
        if (visitedLocations.has(loc.id)) {
          return sum + (Number(loc.score_points) || 0);
        }
        return sum;
      }, 0);
      setPoints(total);
    };
    calculatePoints();
  }, [visitedLocations, locations]);

  /**
 * Requests foreground location permissions and, if granted, starts tracking the user's location.
 * Monitors location changes to check proximity to predefined locations.
 *
 * @async
 * @function startLocationTracking
 * @returns {Promise<void>} No return value, directly initializes location tracking if permission is granted.
 * @throws Will alert and log errors if permissions are denied or tracking fails.
 *
 */
  useEffect(() => {
    let subscription;

    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied", "Location tracking is disabled.");
          return;
        }

        // start listening location updates
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Highest, distanceInterval: 50 },
          (location) => handleLocationUpdate(location)
        );
      } catch (error) {
        console.error("Location Tracking Error:", error);
        Alert.alert("Error", "Unable to start location tracking.");
      }
    };

    startLocationTracking();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [locations]);

  /**
 * Checks the user's current location against all project locations to detect proximity.
 * For each location that hasn't been visited, calculates the distance to the current location.
 * If the user is within the specified proximity radius, triggers a location visit event.
 *
 * @async
 * @function handleLocationUpdate
 * @param {Object} location - The current location object provided by the Location API.
 * @param {Object} location.coords - The coordinates of the current location.
 * @param {number} location.coords.latitude - The latitude of the user's current location.
 * @param {number} location.coords.longitude - The longitude of the user's current location.
 * @returns {Promise<void>} No return value, calls handleLocationVisit if proximity criteria are met.
 * @throws Will log errors if location processing is already in progress.
 * // Checks proximity of this location to predefined project locations.
 */
  const handleLocationUpdate = async (location) => {
    if (processingRef.current) return;
    const { latitude, longitude } = location.coords;

    for (const loc of locations) {
      if (
        visitedLocationsRef.current.has(loc.id) ||
        loc.latitude == null ||
        loc.longitude == null
      )
        continue;

      const distance = getDistance(
        { latitude, longitude },
        { latitude: loc.latitude, longitude: loc.longitude }
      );
      const PROXIMITY_RADIUS = 50;

      console.log(
        `Checking distance to ${loc.location_name}: ${distance} meters`
      );

      if (distance <= PROXIMITY_RADIUS) {
        processingRef.current = true;
        await handleLocationVisit(loc);
        processingRef.current = false;
        break;
      }
    }
  };

  /**
 * Marks a location as visited, updating the state, AsyncStorage, and backend.
 * Checks if the location has already been visited to prevent duplicate entries.
 * Updates visited locations, notifies the backend, and stores the visit in AsyncStorage.
 *
 * @async
 * @function handleLocationVisit
 * @param {Object} location - The location object being visited.
 * @param {number} location.id - The unique ID of the location.
 * @param {string} location.location_name - The name of the location.
 * @param {string} [location.location_content] - Optional content associated with the location.
 * @returns {Promise<void>} No return value, directly updates state and backend.
 * @throws Will alert and log errors if backend update or storage fails.
 *
 * // Marks "Golden Gate Park" as visited and updates backend and storage.
 */
  const handleLocationVisit = async (location) => {
    console.log("Handling location visit:", location);
    try {
      if (visitedLocationsRef.current.has(location.id)) {
        console.log(
          `Location ${location.location_name} has already been visited. Skipping.`
        );
        return;
      }

      // Update visited locations
      const updatedVisitedSet = new Set(visitedLocationsRef.current);
      updatedVisitedSet.add(location.id);
      setVisitedLocations(updatedVisitedSet);
      visitedLocationsRef.current = updatedVisitedSet;

      // update AsyncStorage with visited locations
      const updatedVisitedArray = Array.from(updatedVisitedSet);
      await AsyncStorage.setItem(
        `visitedLocations_${projectId}`,
        JSON.stringify(updatedVisitedArray)
      );
      console.log("AsyncStorage updated with visited locations.");

      // update location visit on backend
      await updateLocationVisit(location.id);
      console.log(
        `Location ${location.location_name} marked as visited on backend.`
      );

      // create tracking record
      await createTracking(location.id);
      console.log(`Tracking created for location ${location.location_name}.`);

      setCurrentLocationContent(location.location_content);

      Alert.alert(
        "Location Unlock",
        `You have unlocked ${location.location_name}!`
      );
    } catch (error) {
      console.error("Handle Location Visit Error:", error);
      // if request error, show alert
      if (error.response && error.response.status === 400) {
        Alert.alert("Error", "Request Error: Unable to unlock the place.");
      } else {
        Alert.alert(
          "Error",
          "Unable to process location access. Please try again later."
        );
      }
    }
  };

  /**
 * Resets the user's visited locations history by clearing AsyncStorage and updating state.
 * Clears the local visitedLocations set, updates AsyncStorage, and refetches data.
 *
 * @async
 * @function resetVisitedLocations
 * @returns {Promise<void>} No return value, directly updates state and clears AsyncStorage.
 * @throws Will alert and log errors if storage clearing or data fetching fails.
 *
 */
  const resetVisitedLocations = async () => {
    try {
      await AsyncStorage.removeItem(`visitedLocations_${projectId}`);
      setVisitedLocations(new Set());
      visitedLocationsRef.current = new Set();
      Alert.alert(
        "Reset Successfully",
        "Your access history has been cleared, you can start over!"
      );
      fetchData();
    } catch (error) {
      console.error("Reset Visited Locations Error:", error);
      Alert.alert("Error", "Unable to reset access history.");
    }
  };

  /**
   * Render each place item
   * @param {Object} param0 - Object containing the place data
   * @returns {JSX.Element} rendered place card
   */
  const renderLocationItem = ({ item }) => {
    const isVisited = visitedLocations.has(item.id);
    return (
      <View
        style={[styles.locationCard, isVisited && styles.visitedLocationCard]}
      >
        <View style={styles.locationHeader}>
          <Text style={styles.locationName}>{item.location_name}</Text>
          {isVisited && <Text style={styles.checkmark}>Visited</Text>}
        </View>
        {item.clue && (
          <View style={styles.clueContainer}>
            {/* Clue */}
            <Text style={styles.boldText}>Clue: </Text>
            <Text style={styles.clueText}>{item.clue}</Text>
          </View>
        )}
        <View style={styles.locationStats}>
          {/* Score */}
          <Text style={styles.boldText}>Score: </Text>
          <Text>{item.score_points || 0}</Text>
        </View>
      </View>
    );
  };

  // if loading, show loading indicator
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6f61" />
        <Text style={styles.loadingText}>Loading Project...</Text>
      </View>
    );
  }

  // if project not found, show error message
  if (!project) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Project not found.</Text>
      </View>
    );
  }

  const activeScreen = "projectHomeScreen";

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            {/* Project title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{project.title}</Text>
            </View>
            {/* Project information card */}
            <View style={styles.card}>
              <View style={styles.cardContent}>
                {/* Instructions */}
                <Text style={styles.sectionTitle}>Instructions</Text>
                <Text>{project.instructions}</Text>
                {/* Display initial clues or all locations depending on configuration */}
                {project.homescreen_display === "Display initial clue" &&
                  project.initial_clue && (
                    <View style={styles.formGroup}>
                      <Text>Initial clue</Text>
                      <Text>{project.initial_clue}</Text>
                    </View>
                  )}
                {project.homescreen_display === "Display all locations" && (
                  <View style={styles.formGroup}>
                    {/* All locations */}
                    <Text style={styles.sectionTitle}>All locations</Text>
                    {locations.map((location) => (
                      <Text key={location.id}>{location.location_name}</Text>
                    ))}
                  </View>
                )}
              </View>

              {/* Points and visited places statistics */}
              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <Text style={styles.statTitle}>Points</Text>
                  <Text style={styles.statValue}>
                    {points} / {pointsPossible}
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statTitle}>Location visited</Text>
                  <Text style={styles.statValue}>
                    {visitedLocations.size} / {locations.length}
                  </Text>
                </View>
              </View>
              {/* Reset access history button */}
              <Button
                title="Reset access history"
                color="#ff6f61"
                onPress={resetVisitedLocations}
              />
            </View>
            {/* Location List Title */}
            <Text style={styles.locationListTitle}>Location list</Text>
          </>
        }
        data={locations}
        renderItem={renderLocationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.locationsList}
      />
      {/* Bottom Navigation */}
      <BottomNavigation projectId={projectId} activeScreen={activeScreen} />
    </View>
  );
}

// style sheet for ProjectHomeScreen component
const styles = StyleSheet.create({
  /**
   * WebView Container
   * Styles the overlay for displaying WebView content, centered with padding.
   */
  webViewContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    padding: 20,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  /**
   * Location Content Title
   * Styles the title text for location content displayed in the overlay.
   */
  locationContentTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },

  /**
   * WebView Component
   * Defines the dimensions for the WebView component.
   */
  webView: {
    flex: 1,
    height: 300,
  },

  /**
   * Visited Count Text (Unused)
   * Text styling for displaying the number of unlocked locations.
   */
  visitedCountText: {
    fontSize: 14,
    marginTop: 10,
  },

  /**
   * Main Container
   * The primary container for the screen, with background color and padding.
   */
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    paddingVertical: 10,
  },

  /**
   * Title Container
   * Container for the project title, with background color and centered alignment.
   */
  titleContainer: {
    width: "100%",
    backgroundColor: "#ff6f61",
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 10,
  },

  /**
   * Title Text
   * Styles the project title text, with font size and color.
   */
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },

  /**
   * Project Card
   * Card styling for displaying project information, with shadows and rounded corners.
   */
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    width: "90%",
    minHeight: 200,
    alignSelf: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },

  /**
   * Card Content
   * Container for content inside the project card, with spacing at the bottom.
   */
  cardContent: {
    marginBottom: 20,
  },

  /**
   * Section Title
   * Styling for section headers, such as Instructions or All Locations.
   */
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },

  /**
   * Section Text (Unused)
   * Text styling for section descriptions within the card.
   */
  sectionText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },

  /**
   * Stats Container
   * Layout for displaying the points and visited locations statistics.
   */
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },

  /**
   * Stat Box
   * Box style for individual stats, with background color and centered text.
   */
  statBox: {
    backgroundColor: "#ff6f61",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    width: "45%",
    height: 80,
    justifyContent: "center",
  },

  /**
   * Stat Title
   * Styles the title of each stat, like Points or Locations Visited.
   */
  statTitle: {
    color: "white",
    fontSize: 12,
    marginBottom: 5,
  },

  /**
   * Stat Value
   * Styling for the numeric value of each stat, bold and white.
   */
  statValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  /**
   * Loading Container
   * Centered layout for loading indicator display.
   */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /**
   * Loading Text
   * Text style for the loading indicator label.
   */
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },

  /**
   * Error Text
   * Styling for error messages displayed on the screen.
   */
  errorText: {
    fontSize: 16,
    color: "#ff6f61",
    textAlign: "center",
    marginTop: 20,
  },

  /**
   * Locations List Container
   * Padding for the list of locations displayed in the FlatList.
   */
  locationsList: {
    paddingBottom: 20,
  },

  /**
   * Location Card
   * Styles for each individual location card, including shadow and margin.
   */
  locationCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "90%",
    alignSelf: "center",
  },

  /**
   * Location Name
   * Text styling for the name of each location, with bold color emphasis.
   */
  locationName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff6f61",
    marginBottom: 5,
  },

  /**
   * Location Description (Unused)
   * Text styling for the description of each location.
   */
  locationDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },

  /**
   * Location Stats
   * Layout for location statistics, aligning items within each location card.
   */
  locationStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  /**
   * Location List Title
   * Title styling for the location list section.
   */
  locationListTitle: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
    marginVertical: 15,
    color: "#333",
  },

  /**
   * Checkmark
   * Styles the visited label in the location card.
   */
  checkmark: {
    fontSize: 18,
    color: "#28a745",
    fontWeight: "bold",
  },

  /**
   * Visited Location Card
   * Background color style for visited locations.
   */
  visitedLocationCard: {
    backgroundColor: "#e6ffe6",
  },

  /**
   * Location Header
   * Layout for the header of each location card, including name and status.
   */
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  /**
   * Close Content Button
   * Styling for the close button text in the location content overlay.
   */
  closeContent: {
    color: "#ff6f61",
    marginTop: 10,
    textAlign: "right",
    fontWeight: "bold",
  },

  /**
   * Clue Container
   * Layout for the clue text in each location card, wrapping text when needed.
   */
  clueContainer: {
    flexDirection: "row",
    marginTop: 10,
    flexWrap: "wrap",
  },

  /**
   * Bold Text
   * Styling for bold labels, such as Clue and Score tags.
   */
  boldText: {
    fontWeight: "bold",
    color: "#333",
  },

  /**
   * Clue Text
   * Styling for the text that follows the Clue label.
   */
  clueText: {
    color: "#555",
  },

  /**
   * Form Group
   * Layout for form group elements, such as Initial Clue or All Locations.
   */
  formGroup: {
    marginTop: 10,
  },
});