import Sequelize from 'sequelize';
const { DataTypes } = Sequelize;
import bcrypt from 'bcryptjs';
import express from 'express';

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    walletAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEthereumAddress(value) {
          if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
            throw new Error('Must be a valid Ethereum address');
          }
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    nonce: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: () => Math.floor(Math.random() * 1000000).toString()
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user'
    }
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  User.prototype.generateNewNonce = function() {
    this.nonce = Math.floor(Math.random() * 1000000).toString();
    return this.save();
  };

  User.associate = (models) => {
    User.hasMany(models.Verification, {
      foreignKey: 'userId',
      as: 'verifications'
    });
  };

  return User;
};