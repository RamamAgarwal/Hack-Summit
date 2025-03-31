import pkg from 'sequelize';
const { DataTypes } = pkg;

export default  (sequelize) => {
  const Verification = sequelize.define('Verification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    documentType: {
      type: DataTypes.ENUM('passport', 'driverLicense', 'nationalId', 'other'),
      allowNull: false
    },
    documentHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ipfsHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    txHash: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Blockchain transaction hash'
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  Verification.associate = (models) => {
    Verification.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Verification;
};