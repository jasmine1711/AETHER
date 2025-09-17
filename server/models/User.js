// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-zA-Z0-9_]+$/, // Alphanumeric and underscores only
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    isAdmin: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // --- NEW FIELDS FOR PERSONALIZATION ---
    bodyType: {
      type: String,
      enum: ["Pear", "Hourglass", "Apple", "Rectangle", "Inverted Triangle", "Not Specified"],
      default: "Not Specified",
    },
    skinTone: {
      type: String,
      enum: ["Warm", "Cool", "Neutral", "Not Specified"],
      default: "Not Specified",
    },
    stylePreferences: {
      type: [String],
      default: [],
      enum: [
        "90s Grunge", "Y2K Revival", "Cottagecore", "Dark Academia",
        "Light Academia", "E-Girl/E-Boy", "Art Hoe", "Skater", "Soft Girl/Boy",
        "Vintage Glamour", "Minimalist", "Bohemian", "Streetwear", "Avant-Garde",
      ],
    },
  },
  { timestamps: true }
);

// 🔒 Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔒 Hash password on findOneAndUpdate (safeguard for updates)
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (update.password) {
    try {
      const salt = await bcrypt.genSalt(12);
      update.password = await bcrypt.hash(update.password, salt);
      this.setUpdate(update);
    } catch (err) {
      return next(err);
    }
  }

  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

// ✅ Export as ES module
export default mongoose.model("User", userSchema);
