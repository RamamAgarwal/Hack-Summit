import pkg from 'sequelize';
const { DataTypes } = pkg;
import { Sequelize } from 'sequelize'; 
import {config} from '../config.js';
import UserModel from './User.js';
import VerificationModel from './Verification.js';

const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {
  User: UserModel(sequelize),
  Verification: VerificationModel(sequelize)
};

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export { sequelize, Sequelize, db };