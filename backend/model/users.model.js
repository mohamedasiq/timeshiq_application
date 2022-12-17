const mongoose = require('mongoose');

const user_schema = new mongoose.Schema(
    {
        display_name: {
            type: String,
            required: false
        },
        email_id: {
            type: String,
            required: false
        },
        password: {
            type: String,
            required: false
        },
        passwordHash: {
            type: String,
            required: false
        },
        role: {
            type: String,
            required: false
        },
        isActive: {
            type: Boolean,
            required:false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('user', user_schema, 'users');