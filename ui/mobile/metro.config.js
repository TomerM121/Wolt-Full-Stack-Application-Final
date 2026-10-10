const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Gives access to share folder
config.watchFolders = [
  path.resolve(__dirname, '../shared')
];

module.exports = config;