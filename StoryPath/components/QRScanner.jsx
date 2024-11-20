// components/QRScanner.jsx

import React, { useState } from "react";
import { StyleSheet, Text, View, Button, Alert, Linking } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter, useLocalSearchParams } from "expo-router";
import BottomNavigation from "../components/BottomNavigation";

/**
 * QRScanner Component
 *
 * Renders a QR code scanner interface, handling camera permissions and scanning events.
 * After a QR code is scanned, navigates to the project home screen with the scanned data.
 *
 * @returns {JSX.Element} The rendered QRScanner component.
 */
export default function QRScanner() {
  // State to track if a QR code has been scanned
  const [scanned, setScanned] = useState(false);
  // State to store the data from the scanned QR code
  const [scannedData, setScannedData] = useState("");

  // Custom hook to request and track camera permissions
  const [permission, requestPermission] = useCameraPermissions();

  // Router instance for navigating to other screens
  const router = useRouter();

  // Extract projectId from URL parameters using a custom hook
  const { projectId } = useLocalSearchParams();

  // Display a message requesting camera permissions if permissions are not handled yet
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  // If camera permissions are denied, show a message with options to request permissions or open settings
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Need permission to access the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
        <Button
          title="Open Settings"
          onPress={() => Linking.openSettings()}
          color="#ff6f61"
        />
      </View>
    );
  }

  /**
   * Event handler triggered when a QR code is successfully scanned.
   * Sets the scanned data, displays an alert, and navigates based on the QR content.
   *
   * @param {Object} param0 - Object containing details of the scanned barcode.
   * @param {string} param0.type - The type of the scanned barcode, e.g., QR code.
   * @param {string} param0.data - The data contained in the scanned barcode.
   */
  const handleBarCodeScanned = ({ type, data }) => {
    // Mark the scan as complete
    setScanned(true);
    // Store the scanned data in state
    setScannedData(data);

    // Display an alert with options to navigate or rescan
    Alert.alert("QR Code Scanned", `Data: ${data}`, [
      {
        text: "OK",
        onPress: () => {
          // Navigate to project home screen with scanned data as a query parameter
          router.push(
            `/projectHomeScreen?projectId=${projectId}&scannedData=${data}`
          );
        },
      },
    ]);
  };

  // Define the active screen name for bottom navigation
  const activeScreen = "qrScanner";

  return (
    <View style={styles.container}>
      {/* Camera component with QR code scanning enabled */}
      <CameraView
        style={styles.camera}
        type="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Display scan results and rescan option if a QR code was scanned */}
      {scanned && (
        <View style={styles.scanResultContainer}>
          <Text style={styles.scanResultText}>Scan Results: {scannedData}</Text>
          <Button title="Scan again" onPress={() => setScanned(false)} />
        </View>
      )}

      {/* Bottom navigation component */}
      <BottomNavigation projectId={projectId} activeScreen={activeScreen} />
    </View>
  );
}

// style sheet for QRScanner component
const styles = StyleSheet.create({
  /**
   * Main Container
   * Sets up the main container with flex layout.
   * Background color and other styling is inherited from parent container.
   */
  container: {
    flex: 1,
  },

  /**
   * Camera View Style
   * Configures the camera view to occupy the full container.
   * Ensures camera content aligns to occupy available space.
   */
  camera: {
    flex: 1,
  },

  /**
   * Message Text Style
   * Styles the text displayed when requesting camera permissions.
   * Uses a dark color for readability and centered alignment for user guidance.
   */
  message: {
    textAlign: "center",
    paddingBottom: 10,
    fontSize: 16,
    color: "#333",
  },

  /**
   * Scan Result Container Style
   * Styles the container displaying scan results with a background overlay.
   * Positioned at the bottom with padding and rounded corners for visibility.
   */
  scanResultContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 15,
    alignItems: "center",
    marginHorizontal: 20,
    borderRadius: 10,
  },

  /**
   * Scan Result Text Style
   * Styles the text showing the scanned QR code data.
   * Uses a larger font size to ensure scan data is clearly visible to users.
   */
  scanResultText: {
    fontSize: 18,
    marginBottom: 10,
  },
});
