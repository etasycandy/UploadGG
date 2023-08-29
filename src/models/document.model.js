const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const documentSchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Please enter a valid title!"],
    },
    description: {
      type: String,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
      lowercase: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    video: {
      type: String,
      trim: true,
    },
    idVideo: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
documentSchema.plugin(toJSON);
documentSchema.plugin(paginate);

/**
 * @typedef Document
 */
const Document = mongoose.model("Document", documentSchema);

module.exports = Document;
