const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );

        return userData;
      }

      throw new AuthenticationError("User Not logged in");
    },
  },

  Mutation: {
    addUser: async (_, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect username or password");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect username or password");
      }

      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (_, { bookData }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: bookData } },
          { new: true }
        );

        return updatedUser;
      }

      throw new AuthenticationError("Please log in!");
    },
    removeBook: async (_, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );

        return updatedUser;
      }

      throw new AuthenticationError("Please log in!");
    },
  },
};

module.exports = resolvers;
