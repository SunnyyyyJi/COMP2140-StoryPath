// pages/locationDetail.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getLocation } from '../api/api';
import { useLocalSearchParams } from 'expo-router';

export default function LocationDetail() {
  const [location, setLocation] = useState(null);
  const { projectId, locationId } = useLocalSearchParams();

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const locationData = await getLocation(locationId);
        if (!locationData || locationData.length === 0) {
          Alert.alert("Error", "Location not found.");
          return;
        }
        setLocation(locationData[0]);
      } catch (error) {
        console.error("Error fetching location:", error);
        Alert.alert("Error", "Unable to load location data.");
      }
    };

    fetchLocation();
  }, [locationId]);

  if (!location) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ff6f61" />
        <Text>Loading location data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Location Details */}
      <Text style={styles.title}>{location.name}</Text>
      <Text style={styles.description}>{location.description}</Text>
      <Text style={styles.info}>Project ID: {projectId}</Text>
      <Text style={styles.info}>Location ID: {locationId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: "#333",
  },
});
