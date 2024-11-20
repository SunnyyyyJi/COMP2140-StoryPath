# StoryPath: Explore Location-Based Adventures

Welcome to **StoryPath**, an innovative mobile app built with [Expo](https://expo.dev) that offers an interactive platform for exploring location-based experiences. This project is designed to help users discover and create location-based adventures, such as city tours, treasure hunts, and more.

## Getting Started

Follow these steps to set up and run the project.

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll open the app in a

- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Project Structure

- app/: Contains the core screens and components of the app.
- components/: Reusable components across different screens, such as navigation and UI elements.
- api/: Contains files that handle API requests to fetch project and location data.
- _layout.jsx: Main layout file that includes the drawer navigator and user profile context.

## Key Features

- Profile Creation: Users can create a profile with a unique username and avatar.
- Project Exploration: Explore various location-based projects with interactive elements.
- Project Home Screen: We use location change to test the score function.
- Location Visits: Track and visit locations on a map, unlocking content and earning points.
- QR Code Scanning: Users can scan QR codes to access specific locations or experiences.

## Test scoring functionality

We use location changes to test the scoring functionality. 

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
