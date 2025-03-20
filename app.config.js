export default {
    expo: {
      name: "KindNest",
      slug: "KindNest",
      version: "1.0.0",
      extra: {
        mapsApiKey: process.env.EXPO_GOOGLE_MAPS_API_KEY || "DEFAULT_API_KEY",
      },
    },
  };
  