module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.createTable('Contributions', {
            id: {
                type: Sequelize.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            contributor_id: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Contributors',
                    key: 'id'
                }
            },
            issue_id: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Issues',
                    key: 'id'
                }
            },
            is_author: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false
            },
            is_assigned: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false
            },
            date_contributed: {
                type: Sequelize.DataTypes.DATE,
                allowNull: false
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Contributions');
    }
};
