module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        "modules": false,
        "targets": {
          "chrome": "58",
          "ie": "11"
        }
      }
    ],
  ],
  plugins: [
    "@babel/plugin-proposal-optional-chaining",
    [
      "@babel/plugin-proposal-decorators",
      {
        legacy: true
      }
    ],
    "@babel/plugin-proposal-function-sent",
    "@babel/plugin-proposal-export-namespace-from",
    "@babel/plugin-proposal-numeric-separator",
    "@babel/plugin-proposal-throw-expressions",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-syntax-import-meta",
    [
      "@babel/plugin-proposal-class-properties",
      {
        loose: false
      }
    ],
    "@babel/plugin-proposal-json-strings",
  ]
};
