module.exports = {
  apps: [
    {
      name: "vite-app",
      script: "serve",
      args: "-s dist -l 3204",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
