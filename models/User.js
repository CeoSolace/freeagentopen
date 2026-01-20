const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      index: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    username: {
      type: String,
      index: true,
    },

    avatar: {
      type: String,
    },

    // ---- Discord OAuth ----
    discordId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    // ---- Account state ----
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

/**
 * Create or update a user from a Discord OAuth profile
 *
 * @param {Object} profile Discord profile payload
 * @returns {Promise<User>}
 */
UserSchema.statics.upsertFromDiscord = async function upsertFromDiscord(profile) {
  if (!profile?.id) {
    throw new Error('Invalid Discord profile');
  }

  const update = {
    discordId: profile.id,
    username: profile.username,
    avatar: profile.avatar
      ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
      : null,
  };

  if (profile.email) {
    update.email = profile.email.toLowerCase();
  }

  const user = await this.findOneAndUpdate(
    { discordId: profile.id },
    { $set: update },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return user;
};

module.exports =
  mongoose.models.User ||
  mongoose.model('User', UserSchema);
