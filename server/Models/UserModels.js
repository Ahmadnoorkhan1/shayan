const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/db');

const User = sequelize?.define(
  'User',
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    preferences: {
      type: DataTypes.TEXT, // Stores JSON as text
      allowNull: true
  },
  onboarding_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
  },
    courses_created: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    books_created: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    plan_level: {
      type: DataTypes.STRING,
      defaultValue: 'free', // e.g., 'free', 'basic', 'premium'
    },
    monthly_allowed: {
      type: DataTypes.INTEGER,
      defaultValue: 10, // Default monthly allowed creations
    },
    monthly_created: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // Tracks monthly creations
    },
    email_generator: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Whether the user has access to email generator
    },
    audio_generator: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Whether the user has access to audio generator
    },
    premium_credits: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // Premium credits for additional features
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    tableName: 'users', // Explicitly set the table name
  }
);

module.exports = User;