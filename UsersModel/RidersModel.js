// const mongoose = require('mongoose');

// const RiderSchema = new mongoose.Schema({
//     FirstName: {
//         type: String,
//     },
//     LastName: {
//         type: String,
//     },
//     UserName: {
//         type: String,
//     },
//     PhoneNumber: {
//         type: String,
//     },
//     Address: {
//         type: String,
//     },
//     Email: {
//         type: String,
//         unique: true,
//         trim: true,
//     },
//     Password: {
//         type: String,
//     },
//     isVerified: {
//         type: Boolean,
//         default: false,
//     },
//     token: {
//         type: String,
//     },
//     blacklist: {
//         type: Array,
//         default: [],
//     },
//     tokens: [{ type: String }]
// }, { timestamps: true });

// const RiderModel = mongoose.model('Rider', RiderSchema);

// module.exports = RiderModel;

// // profilePic: {
// //     public_id: {
// //         type: String,
// //     },
// //     url: {
// //         type: String,
// //     }
// // },
