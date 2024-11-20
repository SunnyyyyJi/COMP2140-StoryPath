// app/index.jsx

import React, { useContext } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { UserProfileContext } from "./_layout";

/**
 * Index Component
 *
 * Displays the main welcome screen, offering navigation to the Profile creation
 * and Project exploration screens. It also dynamically displays the user's
 * profile image and name if available.
 *
 * @returns {JSX.Element} The rendered Index component.
 */
export default function Index() {
  // Accessing user profile information from context
  const { username, avatarUri } = useContext(UserProfileContext);

  return (
    <View style={styles.container}>
      {/* Conditional User Info Display */}
      {username && avatarUri ? (
        <View style={styles.userInfo}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <Text style={styles.username}>Welcome, {username}!</Text>
        </View>
      ) : (
        <View style={styles.userInfo}>
          <Ionicons name="person-circle-outline" size={80} color="#555" />
          <Text style={styles.username}>Welcome to StoryPath!</Text>
        </View>
      )}

      {/* Main navigation icon */}
      <Ionicons
        name="navigate"
        size={48}
        color="#ff6f61"
        style={styles.icon}
      />

      {/* Welcome Title */}
      <Text style={styles.title}>Discover New Adventures</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Explore Unlimited Location-based Experiences
      </Text>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          With StoryPath, you can discover and create amazing location-based
          adventures. From city tours to treasure hunts, the possibilities are
          endless!
        </Text>
      </View>

      {/* Create Profile Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          router.push("/profile");
        }}
      >
        <Text style={styles.buttonText}>CREATE PROFILE</Text>
      </TouchableOpacity>

      {/* Explore Projects Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          router.push("/project");
        }}
      >
        <Text style={styles.buttonText}>EXPLORE PROJECTS</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles for the Index component
const styles = StyleSheet.create({
  /**
   * Main container style.
   * Centers content both vertically and horizontally with padding and a light background.
   */
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 16,
  },

  /**
   * User information container style.
   * Aligns items to the center with bottom margin for spacing.
   */
  userInfo: {
    alignItems: "center",
    marginBottom: 20,
  },

  /**
   * Style for the user's avatar image.
   * Sets dimensions and makes the image circular.
   */
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  /**
   * Style for the username text.
   * Sets font size, weight, color, and top margin.
   */
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },

  /**
   * Style for the main navigation icon.
   * Sets size, color, and bottom margin.
   */
  icon: {
    fontSize: 48,
    color: "#ff6f61",
    marginBottom: 20,
  },

  /**
   * Style for the welcome title text.
   * Defines font size, weight, color, bottom margin, and centers the text.
   */
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff6f61",
    marginBottom: 8,
    textAlign: "center",
  },

  /**
   * Style for the subtitle text.
   * Sets font size, color, bottom margin, and centers the text.
   */
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 16,
    textAlign: "center",
  },

  /**
   * Container for the description text.
   * Adds background color, border radius, padding, margin, width, centering, and shadow for elevation.
   */
  descriptionContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    width: "80%",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  /**
   * Style for the description text.
   * Sets font size, color, and centers the text.
   */
  description: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },

  /**
   * Style for the buttons.
   * Sets background color, vertical and horizontal padding, border radius, bottom margin, width, and centers the content.
   */
  button: {
    backgroundColor: "#ff6f61",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 12,
    width: "80%",
    alignItems: "center",
  },

  /**
   * Style for the button text.
   * Sets text color, font size, and weight.
   */
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
