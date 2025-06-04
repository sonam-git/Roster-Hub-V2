const {Schema, model } = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const skillSchema = new Schema ({
    skillText : {
        type: String,
        required: true
    },
    skillAuthor: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        get: (timestamp) => dateFormat(timestamp)
    }
},
{
    timestamps: true
}
);
module.exports = model('Skill', skillSchema);