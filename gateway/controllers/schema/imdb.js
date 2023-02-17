const titleSchema = {
  params: {
    type: "object",
    properties: {
      id: {
        type: "string",
      },
    },
    required: ["id"],
  },
};

const searchSchema = {
  query: {
    type: "object",
    properties: {
      title: {
        type: "string",
      },
    },
    required: ["title"],
  },
};

module.exports = { searchSchema, titleSchema };
