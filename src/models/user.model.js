let mongoose = require("mongoose");
let bcrypt = require("bcrypt");
let { toJSON, paginate } = require("./plugins");
let validator = require("validator");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, "Please enter a valid username!"],
      unique: [true, "Username already exists!"],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, "Please enter a valid email address!"],
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    phoneNumber: {
      type: String,
      trim: true,
      required: [true, "Please enter a valid phone number!"],
      validate: {
        validator: function (value) {
          return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
            value,
          );
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    password: {
      type: String,
      trim: true,
      minlength: [8, "Password must have at least 8 characters!"],
      required: [true, "Please enter a valid password!"],
      validate: {
        validator: function (value) {
          return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(
            value,
          );
        },
        message:
          "Valid password at least 8 characters including: number, uppercase, lowercase",
      },
      private: true,
    },
    fullName: {
      type: String,
      trim: true,
      required: [true, "Please enter your full name!"],
    },
    address: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: "default/user-default.png",
    },
    roles: {
      type: String,
      lowercase: true,
      required: [true, "Please select a valid role!"],
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Add plugin that converts mongoose to json
 */
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model("User", userSchema);

module.exports = User;
