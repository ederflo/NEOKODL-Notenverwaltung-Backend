module.exports = (sequelize, DataTypes) => {
    const A_PupilOU = sequelize.define('A_PupilOU', {
        locked : {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        OrganizationalUnitId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'OrganizationalUnit',
                key: 'id'
            }
        },
        PupilId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'Pupil',
                key: 'id'
            }
        }
    });

    A_PupilOU.associate = (models) => {
        A_PupilOU.belongsTo(models.Pupil, { foreignKey: 'PupilId', targetKey: 'id', as: 'Pupil' });
        A_PupilOU.belongsTo(models.OrganizationalUnit, { foreignKey: 'OrganizationalUnitId', targetKey: 'id', as: 'OrganizationalUnit' });
      }
    return A_PupilOU;
}