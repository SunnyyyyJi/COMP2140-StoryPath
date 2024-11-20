// api/api.js

// Base URL for the Storypath RESTful API
const API_BASE_URL = "https://0b5ff8b0.uqcloud.net/api";

// JWT token for authorization
const JWT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4MjY3MDgifQ.bHHgjSf5lBe7y8OlTIPZg0LZ8iJ4OSNcqeNjLlviWjU";

// Username for the current user
const USERNAME = "s4826708";

/**
 * Helper function to handle various types of API requests.
 * Sets Authorization headers, handles body inclusion for POST, PATCH, PUT requests,
 * and logs request details for debugging.
 *
 * @param {string} endpoint - The endpoint for the API call.
 * @param {string} [method='GET'] - HTTP method (e.g., 'GET', 'POST').
 * @param {object|null} [body=null] - Optional body data, required for POST or PATCH requests.
 * @returns {Promise<object>} - JSON response data from the API.
 * @throws Will log and throw errors if the HTTP response status is not OK.
 *
 */
async function apiRequest(endpoint, method = "GET", body = null) {
  console.log(`Sending ${method} request to: ${API_BASE_URL}${endpoint}`);

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JWT_TOKEN}`,
    },
  };

  if (["POST", "PATCH", "PUT"].includes(method)) {
    options.headers["Prefer"] = "return=representation";
  }

  if (body) {
    if (method === "POST" && !endpoint.startsWith("/tracking")) {
      options.body = JSON.stringify({ ...body, username: USERNAME });
    } else {
      options.body = JSON.stringify(body);
    }
    console.log("Request body:", options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Error response body:", errorBody); 
      throw new Error(
        `Request error! Status: ${response.status}, Body: ${errorBody}`
      );
    }

    // Handle empty responses (e.g., DELETE requests)
    if (response.status === 204) {
      return {};
    }

    const res = await response.json();
    console.log("API Response data:", res);
    return res;
  } catch (error) {
    console.error(`Error in request to ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Helper function to handle DELETE requests.
 * It sets the Authorization token.
 *
 * @param {string} endpoint - The API endpoint to call.
 * @returns {Promise<void>} - Resolves when the request is successful.
 * @throws Will throw an error if the HTTP response is not OK.
 */
export async function deleteRequest(endpoint) {
  const options = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JWT_TOKEN}`,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Delete Request error! status: ${response.status}, Body: ${errorBody}`
      );
    }
  } catch (error) {
    console.error("Error in deleteRequest:", error);
    throw error;
  }
}

/**
 * Function to insert a new project into the database.
 *
 * @param {object} project - The project data to insert.
 * @returns {Promise<object>} - The created project object returned by the API.
 */
export async function createProject(project) {
  return apiRequest("/project", "POST", project);
}

/**
 * Function to list all published projects.
 *
 * @returns {Promise<Array>} - An array of published project objects.
 */
export async function getProjects() {
  const endpoint = "/project?is_published=eq.true";
  const projects = await apiRequest(endpoint);
  return projects;
}

/**
 * Function to get a single project by its ID.
 *
 * @param {string} id - The ID of the project to retrieve.
 * @returns {Promise<object>} - The project object matching the ID.
 */
export async function getProject(id) {
  // Fetch project details
  const project = await apiRequest(`/project?id=eq.${id}`);
  return project;
}

/**
 * Function to update an existing project by ID.
 *
 * @param {string} id - The ID of the project to update.
 * @param {object} project - The updated project object.
 * @returns {Promise<object>} - The updated project object.
 */
export async function updateProject(id, project) {
  return apiRequest(`/project?id=eq.${id}`, "PATCH", project);
}

/**
 * Function to delete a project by its ID.
 *
 * @param {string} id - The ID of the project to delete.
 * @returns {Promise<void>} - A promise that resolves when the project is deleted.
 */
export async function deleteProject(id) {
  return deleteRequest(`/project?id=eq.${id}`);
}

/**
 * Function to insert a new location into the database.
 *
 * @param {object} location - The location data to insert.
 * @returns {Promise<object>} - The created location object returned by the API.
 */
export async function createLocation(location) {
  return apiRequest("/location", "POST", location);
}

/**
 * Function to list all locations associated with a specific project.
 *
 * @param {string} projectId - The ID of the project to fetch locations for.
 * @returns {Promise<Array>} - An array of location objects related to the project.
 */
export async function getLocations(projectId) {
  const endpoint = `/location?project_id=eq.${projectId}`;
  return apiRequest(endpoint);
}

/**
 * Function to get a single location by its ID.
 *
 * @param {string} id - The ID of the location to retrieve.
 * @returns {Promise<object>} - The location object matching the ID.
 */
export async function getLocation(id) {
  return apiRequest(`/location?id=eq.${id}`);
}

/**
 * Function to update an existing location by ID.
 *
 * @param {string} id - The ID of the location to update.
 * @param {object} location - The updated location object.
 * @returns {Promise<object>} - The updated location object.
 */
export async function updateLocation(id, location) {
  return apiRequest(`/location?id=eq.${id}`, "PATCH", location);
}

/**
 * Function to delete a location by its ID.
 *
 * @param {string} id - The ID of the location to delete.
 * @returns {Promise<void>} - A promise that resolves when the location is deleted.
 */
export async function deleteLocation(id) {
  return deleteRequest(`/location?id=eq.${id}`);
}

/**
 * Records a tracking entry for a location visit.
 * Intended to track participants' presence at a location with an optional score.
 *
 * @param {object} trackingData - Object containing the tracking information.
 * @param {string} trackingData.participant_username - Username of the participant.
 * @param {number} trackingData.location_id - ID of the location being tracked.
 * @param {number} [trackingData.score=0] - Optional score for the location visit.
 * @returns {Promise<object>} - JSON object with the created tracking data from the API.
 * @throws Will throw an error if the request fails or response is not OK.
 *
 * // Records a visit with 10 points at location with ID 1 for user123.
 */
export async function createTracking(trackingData) {
  return apiRequest("/tracking", "POST", trackingData);
}

/**
 * Function to get the number of unique participants for a specific project.
 *
 * @param {string} projectId - The ID of the project to query.
 * @returns {Promise<number>} - The number of unique participants.
 */
export async function getProjectParticipantCount(projectId) {
  const endpoint = `/project_participant_counts?project_id=eq.${projectId}`;
  const response = await apiRequest(endpoint);
  if (Array.isArray(response) && response.length > 0) {
    return response[0].participant_count;
  }
  return 0; // Default to 0 if no data is returned
}

/**
 * Function to get the number of unique participants for a specific location.
 *
 * @param {string} locationId - The ID of the location to query.
 * @returns {Promise<number>} - The number of unique participants.
 */
export async function getLocationParticipantCount(locationId) {
  const endpoint = `/location_participant_counts?location_id=eq.${locationId}`;
  console.log(
    `Fetching participant count for location ID: ${locationId} with endpoint: ${endpoint}`
  );
  const response = await apiRequest(endpoint);
  console.log(
    `Participant count response for location ID ${locationId}:`,
    response
  );
  if (Array.isArray(response) && response.length > 0) {
    return response[0].participant_count;
  }
  return 0;
}

/**
 * Function to update the visit count for a location.
 * Removes dependency on visited_count field, as it does not exist in the schema.
 *
 * @param {string} locationId - The ID of the location to update.
 * @returns {Promise<object>} - The updated location object.
 */
export async function updateLocationVisit(locationId) {
  try {
    // Fetch location data, without trying to increment visited_count
    const locationData = await getLocation(locationId);
    if (!locationData || locationData.length === 0) {
      throw new Error(`Location with ID ${locationId} not found.`);
    }

    // Since we can't update visited_count, we simply return the current location data
    return locationData[0];
  } catch (error) {
    console.error("Error in updateLocationVisit:", error);
    throw error;
  }
}

/**
 * Function to get total points earned by a participant in a project.
 *
 * @param {string} projectId - The ID of the project.
 * @param {Array} visitedArray - Array of visited location IDs.
 * @returns {Promise<number>} - The total points earned.
 */
export async function getTotalPoints(projectId, visitedArray) {
  // Fetch participant_scoring type
  const project = await getProject(projectId);
  if (!project || project.length === 0) {
    throw new Error(`Project with ID ${projectId} not found.`);
  }

  const scoringType = project[0].participant_scoring.toLowerCase();
  if (
    scoringType === "sequence" ||
    scoringType === "number of locations entered"
  ) {
    return visitedArray.length;
  } else if (scoringType === "points") {
    // Sum score_points of visited locations
    const locations = await getLocations(projectId);
    const visitedLocations = locations.filter((loc) =>
      visitedArray.includes(loc.id)
    );
    const totalPoints = visitedLocations.reduce(
      (acc, loc) => acc + (loc.score_points || 0),
      0
    );
    return totalPoints;
  } else {
    console.warn(
      "Unknown participant_scoring type:",
      project[0].participant_scoring
    );
    return 0;
  }
}

/**
 * Function to get total possible points in a project.
 *
 * @param {string} projectId - The ID of the project.
 * @returns {Promise<number>} - The total possible points.
 */
export async function getTotalPossiblePoints(projectId) {
  const project = await getProject(projectId);
  if (!project || project.length === 0) {
    throw new Error(`Project with ID ${projectId} not found.`);
  }

  const scoringType = project[0].participant_scoring.toLowerCase();
  if (
    scoringType === "sequence" ||
    scoringType === "number of locations entered"
  ) {
    const locations = await getLocations(projectId);
    return locations.length;
  } else if (scoringType === "points") {
    const locations = await getLocations(projectId);
    const totalPossible = locations.reduce(
      (acc, loc) => acc + (loc.score_points || 0),
      0
    );
    return totalPossible;
  } else {
    console.warn(
      "Unknown participant_scoring type:",
      project[0].participant_scoring
    );
    return 0;
  }
}
