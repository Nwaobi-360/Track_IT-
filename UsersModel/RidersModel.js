const mongoose = require('mongoose');

const RiderSchema = new mongoose.Schema({
    RiderFirstName: {
        type: String,
    },
    RiderLastName: {
        type: String,
    },
    RiderPhoneNumber: {
        type: String,
    },
    RiderAddress: {
        type: String,
    },
    RiderEmail: {
        type: String,
        unique: true,
        trim: true,
    },
    RiderPassword: {
        type: String,
    },
    // profilePic: {
    // public_id: {
    //     type: String,
    // },
    // url: { 
    //     type: String,
    // } 
// },
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

const RiderModel = mongoose.model('Rider', RiderSchema);

module.exports = RiderModel;
