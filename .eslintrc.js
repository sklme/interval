module.exports = {
  extends: ['plugin:@iskl/ts-typecheck'],
  overrides: [
    {
      files: ['./scripts/*.ts'],
      env: {
        node: true,
      },
      parserOptions: {
        project: null,
      },
    },
  ],
};
