const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    CompanyName: {
        type: String,
    },
    CompanyAddress: {
        type: String,
    },
    Telephone: {
        type: String,
    },
    Email: {
        type: String,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    token: {
        type: String,
    },
    blacklist: {
        type: Array,
        default: [],
    },
    tokens: [{ type: String }]
}, { timestamps: true });

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;

// profilePic: {
//     public_id: {
//         type: String,
//     },
//     url: {
//         type: String,
//     }
// },
