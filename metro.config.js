const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add support for woff2 files
config.resolver.assetExts.push("woff2");

module.exports = withNativeWind(config, { input: "./global.css" });
