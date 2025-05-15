module.exports = {
  root: true,
  extends: ["@repo/eslint-config/server"],
  parserOptions: {
    project: "./tsconfig.json",
  },
};