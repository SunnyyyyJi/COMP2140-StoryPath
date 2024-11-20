// components/Project.jsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { getProjects, getProjectParticipantCount } from "../api/api.js";

/**
 * Project Component
 *
 * Renders a list of projects, each displaying its image, title, description, and participant count.
 * Users can navigate to each project's detail page by tapping on a project item.
 *
 * @returns {JSX.Element} The rendered Project component.
 */
export default function Project() {
  // State to hold the list of projects
  const [projects, setProjects] = useState([]);
  // State to manage loading status during data fetching
  const [loading, setLoading] = useState(true);
  // Router hook to manage screen navigation
  const router = useRouter();

  /**
   * useEffect Hook
   *
   * Executes fetchProjects function on component mount to fetch all projects and their participant counts.
   */
  useEffect(() => {
    /**
     * Fetches project data from the API, retrieves participant counts for each project,
     * and updates the state with the fetched data. If an error occurs, an alert is displayed.
     */
    const fetchProjects = async () => {
      try {
        // Fetch project list from API
        const data = await getProjects();
        if (data.length === 0) {
          Alert.alert("No Projects", "There are no projects available.");
          return;
        }

        // Fetch participant count for each project
        const projectsWithParticipants = await Promise.all(
          data.map(async (project) => {
            try {
              // Retrieve participant count for the current project
              const participantCount = await getProjectParticipantCount(
                project.id
              );
              return { ...project, participantCount: participantCount || 0 };
            } catch (trackingError) {
              console.error(
                `Error fetching participant data for project ${project.id}:`,
                trackingError
              );
              return { ...project, participantCount: 0 };
            }
          })
        );

        // Set projects with participant counts in state
        setProjects(projectsWithParticipants);
      } catch (error) {
        console.error("Error fetching projects:", error);
        Alert.alert(
          "Error",
          "Unable to load project data. Please try again later."
        );
      } finally {
        // Set loading state to false after data fetching is complete
        setLoading(false);
      }
    };

    // Fetch projects on component mount
    fetchProjects();
  }, []);

  /**
   * Renders each project item within the FlatList.
   *
   * @param {Object} param0 - Contains data of the individual project item.
   * @param {string} param0.item.imageUri - URI of the project's image.
   * @param {string} param0.item.title - Title of the project.
   * @param {string} param0.item.description - Short description of the project.
   * @param {number} param0.item.participantCount - Number of participants in the project.
   * @returns {JSX.Element} The rendered project card with title, description, and participant count.
   */
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => router.push(`/projectHomeScreen?projectId=${item.id}`)}
    >
      <Image source={{ uri: item.imageUri }} style={styles.projectImage} />
      <View style={styles.projectInfo}>
        <Text style={styles.projectTitle}>{item.title}</Text>
        <Text style={styles.projectDescription}>{item.description}</Text>
        <Text style={styles.participantCount}>
          Number of participants: {item.participantCount}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#555" />
    </TouchableOpacity>
  );

  // Display loading indicator while projects are being fetched
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6f61" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Projects</Text>
      {projects.length > 0 ? (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.noProjectsText}>No items found.</Text>
      )}
    </View>
  );
}

// stylesheet for the Project component
const styles = StyleSheet.create({
  /**
   * Main container style for the Project component.
   * Sets padding and background color to align with app theme.
   */
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },

  /**
   * Header text style.
   * Configures font size, weight, color, margin, and alignment.
   */
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff6f61",
    marginBottom: 16,
    textAlign: "center",
  },

  /**
   * List container style for FlatList.
   * Adds padding to the bottom to prevent content cutoff.
   */
  listContainer: {
    paddingBottom: 16,
  },

  /**
   * Style for each project card in the list.
   * Configures layout, background, padding, border radius, margin, and shadow for elevation.
   */
  projectCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  /**
   * Style for the project image.
   * Defines dimensions, border radius, and right margin for spacing.
   */
  projectImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },

  /**
   * Container for project information (title, description, participant count).
   * Flex setting enables it to occupy remaining space.
   */
  projectInfo: {
    flex: 1,
  },

  /**
   * Style for the project title text.
   * Sets font size, weight, and color to differentiate title from description.
   */
  projectTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  /**
   * Style for the project description text.
   * Configures font size, color, and margin for better readability.
   */
  projectDescription: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },

  /**
   * Style for the participant count text.
   * Smaller font size with muted color to indicate less emphasis.
   */
  participantCount: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },

  /**
   * Style for text displayed when no projects are found.
   * Centers the text with defined font size and color.
   */
  noProjectsText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },

  /**
   * Container style for loading indicator.
   * Centers content vertically and horizontally on the screen.
   */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },

  /**
   * Style for the loading text displayed below the ActivityIndicator.
   * Configures top margin, font size, and color for better readability.
   */
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
});
