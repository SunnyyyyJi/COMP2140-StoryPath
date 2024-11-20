// components/BottomNavigation.jsx

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/**
 * BottomNavigation Component
 *
 * Renders a bottom navigation bar with three buttons: Project Home, Map View, and QR Code.
 * Each button navigates to its respective screen, highlighting the active screen.
 *
 * @param {Object} props - Component properties.
 * @param {string} props.projectId - The ID of the current project, used as a query parameter in navigation.
 * @param {string} props.activeScreen - The name of the currently active screen to apply active styling.
 * @returns {JSX.Element} The rendered BottomNavigation component.
 */
export default function BottomNavigation({ projectId, activeScreen }) {
  const router = useRouter();

  /**
   * Navigates to a specified screen with the given projectId as a query parameter.
   *
   * @param {string} screen - The target screen to navigate to.
   */
  const navigateTo = (screen) => {
    // Construct the navigation path using template literals
    router.push(`/${screen}?projectId=${projectId}`);
  };

  return (
    <View style={styles.buttonContainer}>
      {/* Project Home Button */}
      <TouchableOpacity
        style={[
          styles.button,
          activeScreen === 'projectHomeScreen' && styles.activeButton,
        ]}
        onPress={() => navigateTo('projectHomeScreen')}
      >
        <Ionicons name="home" size={28} color="white" />
        <Text style={styles.buttonText}>Project Home</Text>
      </TouchableOpacity>

      {/* Map View Button */}
      <TouchableOpacity
        style={[
          styles.button,
          activeScreen === 'mapView' && styles.activeButton,
        ]}
        onPress={() => navigateTo('mapView')}
      >
        <Ionicons name="map" size={28} color="white" />
        <Text style={styles.buttonText}>Map View</Text>
      </TouchableOpacity>
      
      {/* QR Code Button */}
      <TouchableOpacity
        style={[
          styles.button,
          activeScreen === 'qrScanner' && styles.activeButton,
        ]}
        onPress={() => navigateTo('qrScanner')}
      >
        <Ionicons name="qr-code" size={28} color="white" />
        <Text style={styles.buttonText}>QR Code</Text>
      </TouchableOpacity>
    </View>
  );
}

// Stylesheet for the BottomNavigation component
const styles = StyleSheet.create({
  /**
   * Container for all navigation buttons.
   * Arranges buttons horizontally and styles the navigation bar.
   */
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: '5%',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    height: 80,
  },

  /**
   * Style for individual navigation buttons.
   * Applies default styling and layout for each button.
   */
  button: {
    flexGrow: 1,
    flexBasis: 0,
    alignItems: 'center',
    backgroundColor: '#ff6f61',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
    justifyContent: 'center',
    height: 60,
  },

  /**
   * Active state styling for navigation buttons.
   * Changes background color to indicate the active screen.
   */
  activeButton: {
    backgroundColor: '#e55a4e',
  },

  /**
   * Style for the button label text.
   * Positions and styles the text below the icon.
   */
  buttonText: {
    marginTop: 3,
    fontSize: 10,
    color: 'white',
    textAlign: 'center',
  },
});
