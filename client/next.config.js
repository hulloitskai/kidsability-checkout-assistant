module.exports = {
  redirects: async () => [
    {
      source: "/graphiql",
      destination: "/api",
      permanent: true,
    },
  ],
  future: {
    webpack5: true,
  },
};
