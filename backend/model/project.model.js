const mongoose = require('mongoose');

const gallery_schema = new mongoose.Schema(
    {
        project_name: {
            type: String,
            required: false
        },
        lead_name: {
            type: String,
            required: false
        },
        manager_name: {
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

module.exports = mongoose.model('project', gallery_schema, 'project');