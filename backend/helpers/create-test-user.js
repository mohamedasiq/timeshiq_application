const bcrypt = require('bcryptjs');
const users = require('../model/users.model');
const Role = require('./role');

module.exports = createTestUser;

async function createTestUser() {
    // create test user if the db is empty
    if ((await users.countDocuments({})) === 0) {
        const user = new users({
            display_name: 'Asiq',
            email_id: 'asiq@gmail.com',
            password: '123456',
            passwordHash: bcrypt.hashSync('123456', 10),
            role: Role.Admin,
            isActive: true
        });
        await user.save();
    }
}