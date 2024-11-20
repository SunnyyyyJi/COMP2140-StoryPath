// components/About.jsx

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

/**
 * About Component
 *
 * Displays information about the StoryPath application.
 * Provides users with an overview of what StoryPath offers,
 * including its features and use cases.
 *
 * @returns {JSX.Element} The rendered About component.
 */
export default function About() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Title of the About section */}
      <Text style={styles.title}>About StoryPath</Text>
      {/* Content describing the StoryPath platform */}
      <Text style={styles.content}>
      StoryPath is an innovative platform that allows users to create and explore location-based experiences. From city tours to scavenger hunts, the possibilities are endless! Whether you want to discover new places or create unique adventures for others, StoryPath has you covered.
      </Text>
    </ScrollView>
  );
}

// Styles for the About component
const styles = StyleSheet.create({
  /**
   * Container style for the ScrollView.
   * Ensures content is properly padded and centered.
   */
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },

  /**
   * Style for the title text.
   * Enhances the prominence and readability of the title.
   */
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff6f61",
    marginBottom: 10,
    textAlign: "center",
  },

  /**
   * Style for the content text.
   * Formats the descriptive text for better readability.
   */
  content: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
});
