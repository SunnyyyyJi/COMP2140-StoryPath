// app/_layout.jsx

import React, { createContext, useState } from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";

export const UserProfileContext = createContext();

/**
 * Layout Component
 *
 * This component serves as the main layout for the application, wrapping all screens with a
 * Drawer navigator. It also provides a shared context for user profile information, including
 * the username and avatar URI, allowing child components to access and update these values.
 *
 * @returns {JSX.Element} The rendered Layout component with Drawer navigation and UserProfileContext.
 */
export default function Layout() {
  // State to store username and avatar URI
  const [username, setUsername] = useState("");
  const [avatarUri, setAvatarUri] = useState(null);

  return (
    <UserProfileContext.Provider
      value={{ username, setUsername, avatarUri, setAvatarUri }}
    >
      <Drawer
        screenOptions={{ headerShown: false }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen
          name="index"
          options={{ headerShown: true, headerTitle: "Welcome" }}
        />
        <Drawer.Screen
          name="about"
          options={{ headerShown: true, headerTitle: "About" }}
        />
        <Drawer.Screen
          name="profile"
          options={{ headerShown: true, headerTitle: "Profile" }}
        />
        <Drawer.Screen
          name="project"
          options={{ headerShown: true, headerTitle: "Projects" }}
        />
        <Drawer.Screen
          name="projectHomeScreen"
          options={{ headerShown: true, headerTitle: "Project Preview" }}
        />
        <Drawer.Screen
        name="mapView"
        options={{ headerShown: true, headerTitle: "Map View" }}
      />
      <Drawer.Screen
        name="qrScanner"
        options={{ headerShown: true, headerTitle: "QR Code Scanner" }}
      />
      </Drawer>
    </UserProfileContext.Provider>
  );
}

/**
 * CustomDrawerContent Component
 *
 * This component defines the custom content for the Drawer navigator. It displays user
 * information such as the avatar and username, and provides navigation items to different
 * screens within the application. The active route is highlighted for better user experience.
 *
 * @param {object} props - Props passed down from the Drawer navigator.
 * @returns {JSX.Element} The rendered custom drawer content.
 */
function CustomDrawerContent(props) {
  // Get the current pathname using the usePathname hook
  const pathname = usePathname();
  // Get the user profile information from the context
  const { username, avatarUri } = React.useContext(UserProfileContext);

  return (
    <DrawerContentScrollView {...props}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name="navigate"
          size={28}
          color="#ff6f61"
          style={styles.logoIcon}
        />
        <Text style={styles.appTitle}>StoryPath</Text>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.drawerAvatar} />
        ) : (
          <Ionicons name="person-circle-outline" size={40} color="#555" />
        )}
        <Text style={styles.userText}>
          {username ? username : "No User"}
        </Text>
      </View>

      {/* Navigation Items */}
      {/* Home page */}
      <DrawerItem
        icon={({ color, size }) => (
          <Ionicons
            name="home-outline"
            size={size}
            color={pathname === "/" ? "#fff" : "#ff6f61"}
          />
        )}
        label={"Welcome"}
        labelStyle={[
          styles.navItemLabel,
          { color: pathname === "/" ? "#fff" : "#ff6f61" },
        ]}
        style={{
          backgroundColor: pathname === "/" ? "#ff6f61" : "#fff",
        }}
        onPress={() => {
          router.push("/");
        }}
      />

      {/* Profile page */}
      <DrawerItem
        icon={({ color, size }) => (
          <Ionicons
            name="person-outline"
            size={size}
            color={pathname === "/profile" ? "#fff" : "#ff6f61"}
          />
        )}
        label={"Profile"}
        labelStyle={[
          styles.navItemLabel,
          { color: pathname === "/profile" ? "#fff" : "#ff6f61" },
        ]}
        style={{
          backgroundColor: pathname === "/profile" ? "#ff6f61" : "#fff",
        }}
        onPress={() => {
          router.push("/profile");
        }}
      />

      {/* Projects page */}
      <DrawerItem
        icon={({ color, size }) => (
          <Ionicons
            name="folder-outline"
            size={size}
            color={pathname === "/project" ? "#fff" : "#ff6f61"}
          />
        )}
        label={"Projects"}
        labelStyle={[
          styles.navItemLabel,
          { color: pathname === "/project" ? "#fff" : "#ff6f61" },
        ]}
        style={{
          backgroundColor: pathname === "/project" ? "#ff6f61" : "#fff",
        }}
        onPress={() => {
          router.push("/project");
        }}
      />

      {/* About page */}
      <DrawerItem
        icon={({ color, size }) => (
          <Ionicons
            name="information-circle-outline"
            size={size}
            color={pathname === "/about" ? "#fff" : "#ff6f61"}
          />
        )}
        label={"About"}
        labelStyle={[
          styles.navItemLabel,
          { color: pathname === "/about" ? "#fff" : "#ff6f61" },
        ]}
        style={{
          backgroundColor: pathname === "/about" ? "#ff6f61" : "#fff",
        }}
        onPress={() => {
          router.push("/about");
        }}
      />
    </DrawerContentScrollView>
  );
}

// Style definitions for the Drawer component
const styles = StyleSheet.create({
  /**
   * Header container style.
   * Aligns items horizontally with padding and a bottom border.
   */
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ff6f61",
  },

  /**
   * Style for the logo icon in the header.
   * Adds right margin for spacing.
   */
  logoIcon: {
    marginRight: 10,
  },

  /**
   * App title text style.
   * Sets font size, weight, and color.
   */
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff6f61",
  },

  /**
   * User information container style.
   * Arranges items horizontally with padding, background color, and a bottom border.
   */
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderBottomColor: "#ff6f61",
    borderBottomWidth: 1,
  },

  /**
   * Style for the user's name text.
   * Sets font size, weight, color, and left margin.
   */
  userText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    marginLeft: 10,
  },

  /**
   * Style for the user's avatar image.
   * Sets dimensions and makes the image circular.
   */
  drawerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  /**
   * Style for navigation item labels.
   * Adjusts left margin and sets font size.
   */
  navItemLabel: {
    marginLeft: -20,
    fontSize: 18,
  },
});
