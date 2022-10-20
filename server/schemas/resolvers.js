const resolvers = {
  Query: {
    books: async () => {
      return Book.find().sort({ createdAt: -1 });
    },
  },
};

module.exports = resolvers;
