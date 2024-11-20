// components/Profile.jsx

import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { UserProfileContext } from "../app/_layout";

/**
 * Profile Component
 *
 * Allows users to create and manage their personal profiles by setting a username and selecting an avatar.
 * Provides options to save, reset profile information, and navigate back to the welcome page.
 * Manages state using context and enables image selection from the device's gallery.
 *
 * @returns {JSX.Element} The rendered Profile component.
 */
export default function Profile() {
  // Context to set global user profile data (username, avatar)
  const { setUsername, setAvatarUri } = useContext(UserProfileContext);
  // Local state to store user-entered username and selected avatar URI
  const [localUsername, setLocalUsername] = useState("");
  const [localAvatarUri, setLocalAvatarUri] = useState("");
  // Track whether the profile has been created
  const [isProfileCreated, setIsProfileCreated] = useState(false);

  /**
   * Saves the user's profile information to the global context.
   * Ensures that both username and avatar URI are provided before saving.
   * Updates the global context and navigates to the welcome page.
   */
  const saveProfile = () => {
    if (!localUsername || !localAvatarUri) {
      Alert.alert("Please fill in your username and select an avatar.");
      return;
    }
    setUsername(localUsername);
    setAvatarUri(localAvatarUri);
    setIsProfileCreated(true);

    Alert.alert("Profile saved!", "", [
      {
        text: "Confirm",
        onPress: () => {
          router.push("/");
        },
      },
    ]);
  };

  /**
   * Opens the device's image library for selecting an avatar.
   * Requests necessary permissions; updates local avatar URI on successful selection.
   */
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission is required to access the album!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets.length > 0) {
      setLocalAvatarUri(pickerResult.assets[0].uri || "");
    }
  };

  /**
   * Resets the profile information.
   * Clears local profile data but keeps the selected avatar URI.
   */
  const resetProfile = () => {
    setIsProfileCreated(false);
    setAvatarUri(localAvatarUri);
    Alert.alert("Profile reset.");
  };

  /**
   * Navigates the user back to the welcome page.
   */
  const goToWelcomePage = () => {
    router.push("/");
  };

  if (!isProfileCreated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Create your profile</Text>

        <TouchableOpacity style={styles.avatarPlaceholder} onPress={pickImage}>
          {localAvatarUri ? (
            <Image source={{ uri: localAvatarUri }} style={styles.avatar} />
          ) : (
            <Text style={styles.avatarPlaceholderText}>Click to select an avatar</Text>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          value={localUsername}
          onChangeText={setLocalUsername}
        />

        <TouchableOpacity style={styles.button} onPress={saveProfile}>
          <Text style={styles.buttonText}>Save Personal Profile</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Your Personal Profile</Text>
        <Image source={{ uri: localAvatarUri }} style={styles.avatarLarge} />
        <Text style={styles.username}>{localUsername}</Text>

        <TouchableOpacity style={styles.button} onPress={resetProfile}>
          <Text style={styles.buttonText}>Reset Personal Profiles</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={goToWelcomePage}>
          <Text style={styles.buttonText}>Back to Welcome Page</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

// Styles for the Profile component
const styles = StyleSheet.create({
  /**
   * Main container for the profile screen.
   * Centers all content with background color and padding.
   */
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: 16,
  },

  /**
   * Title text style.
   * Highlights title with a larger font size and bold weight.
   */
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff6f61",
    marginBottom: 20,
    textAlign: "center",
  },

  /**
   * Placeholder style for avatar selection.
   * Provides circular shape and background color for the avatar area.
   */
  avatarPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: "#e1e2e6",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  /**
   * Text style within the avatar placeholder.
   * Guides user to select an avatar image.
   */
  avatarPlaceholderText: {
    color: "#555",
    fontSize: 16,
    textAlign: "center",
  },

  /**
   * Avatar image style for the selected avatar.
   * Ensures avatar is circular and properly sized.
   */
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  /**
   * Enlarged avatar image style for profile display.
   * Increases avatar size for display purposes.
   */
  avatarLarge: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },

  /**
   * Username text style for display after profile creation.
   * Centers the text with increased font size.
   */
  username: {
    fontSize: 22,
    color: "#333",
    marginBottom: 40,
    textAlign: "center",
  },

  /**
   * Input field style for username entry.
   * Adds padding, border, and background color for user interaction.
   */
  input: {
    width: "80%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
  },

  /**
   * Button style for actions such as saving and resetting profile.
   * Sets background color, padding, and alignment.
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
   * Text style for button labels.
   * Applies bold weight and white color for contrast on buttons.
   */
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  /**
   * Modal overlay style (future implementation).
   * Adds semi-transparent background for modal pop-ups.
   */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  /**
   * Modal container style (future implementation).
   * Defines size, padding, and elevation for modals.
   */
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },

  /**
   * Modal title text style (future implementation).
   * Emphasizes modal title with bold weight and centered alignment.
   */
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff6f61",
    marginBottom: 20,
    textAlign: "center",
  },

  /**
   * Button group style within the modal (future implementation).
   * Arranges buttons horizontally with spacing.
   */
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  /**
   * Style for buttons within modal (future implementation).
   * Sets padding, border radius, and horizontal margin.
   */
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },

  /**
   * Style for the save button in modal (future implementation).
   * Sets background color to green for positive action.
   */
  saveButton: {
    backgroundColor: "#28a745",
  },

  /**
   * Style for cancel button in modal (future implementation).
   * Sets background color to red for negative action.
   */
  cancelButton: {
    backgroundColor: "#dc3545",
  },
});
