// const RidersModel = require('../UsersModel/RidersModel');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const { validateRider, validateRiderLogin, } = require('../helpers/Ridervalidate');
// const { sendEmail } = require('../middleware/email');
// // const  cloudinary  = require('../middleware/cloudinary');
// const { generateDynamicEmail } = require('../emailHTML');
// const { resetFunc } = require('../forgotPassword');
// const resetHTML = require('../resetHTML');
// require('dotenv').config();


// //function to capitalize the first letter
// const capitalizeFirstLetter = (str) => {
//     return str[0].toUpperCase() + str.slice(1);
// };



// //Function to register a new user
// exports.signUp = async (req, res) => {
//     try {
//         const { error } = validateRider(req.body);
//         console.log(req.body)
// if (error) {  
//     return res.status(500).json({
//         message: error.details[0].message
//     });
// } else {
//             const { FirstName, LastName, UserName,  PhoneNumber, Address, Email, Password } = req.body;
//             const emailExists = await userModel.findOne({ Email: Email.toLowerCase() });
//             console.log(Email)
//             if (emailExists) {
//                 return res.status(200).json({
//                     message: 'Email already exists',
//                 })
//             }
//             // console.log(req.body)
//             const userNameExists = await RidersModel.findOne({ UserName: UserName.toLowerCase() });
//             console.log(UserName)
//             if (userNameExists) {
//                 return res.status(403).json({
//                     message: 'Username taken',
//                 })
//             }
//             const salt = bcrypt.genSaltSync(12)
//             const hashpassword = bcrypt.hashSync(Password, salt);
//             // const profilePic = req.files.profilePic.tempFilePath;
//             // console.log(profilePic)

//             // const fileuploader = await cloudinary.uploader.upload(
//             //     profilePic,
//             //     (err, profilePic) => {
//             //         try {
//             //             return profilePic;
//             //         } catch (error) {
//             //             console.log(error);
//             //         }
//             //     }
//             // );
//             // console.log(fileuploader);


//             const user = new RidersModel({
//                 FirstName: capitalizeFirstLetter(FirstName).trim(),
//                 LastName: capitalizeFirstLetter(LastName).trim(),
//                 UserName: capitalizeFirstLetter(UserName).trim(),
//                 Address: capitalizeFirstLetter(Address).trim(),
//                 PhoneNumber: PhoneNumber,
                
//                 Email: Email.toLowerCase(),
//                 Password: hashpassword,
//             //     profilePic: {
//             //         public_id: fileuploader.public_id,
//             //         url: fileuploader.secure_url
//             //     },
//             });

//             if (!user) {
//                 return res.status(404).json({
//                     message: 'User not found',
//                 })
//             }

//             const first = user.FirstName.slice(0, 1).toUpperCase();
//             const firstN = user.FirstName.slice(1).toLowerCase();
//             const surn = user.Address.slice(0, 1).toUpperCase();

//             const fullName = first + firstN + " " + surn;

//             const token = jwt.sign({
//                 FirstName,
//                 // CompanysAddress,
//                 Email,
//             }, process.env.secret, { expiresIn: "60s" });
//             user.token = token;
//             const subject = 'Email Verification'
//             //await jwt.verify(token, process.env.secret);
//             const link = `${req.protocol}://${req.get('host')}/api/v1/verify/${user.id}/${user.token}`
//             const html = generateDynamicEmail(fullName, link)
//             sendEmail({
//                 Email: user.Email,
//                 html,
//                 subject
//             })

//             await user.save()
//             return res.status(200).json({
//                 message: 'User profile created successfully',
//                 data: user,
//             })

//         }
//     } catch (error) {
//         return res.status(500).json({
//             message: error.message,
//         })
//     }
// };


// //Function to login a verified user
// exports.logIn = async (req, res) => {
//     try {
//         const { error } = validateRiderLogin(req.body);
//         if (error) {
//             return res.status(500).json({
//                 message: error.details[0].message
//             }) 
//         } else {
//             const { Email, Password } = req.body;
//             const checkEmail = await RidersModel.findOne({ Email: Email.toLowerCase() });
//             if (!checkEmail) {
//                 return res.status(404).json({
//                     message: 'User not registered'
//                 });
//             }
//             const checkPassword = bcrypt.compareSync(Password, checkEmail.Password);
//             if (!checkPassword) {
//                 return res.status(404).json({
//                     message: "Password is incorrect"
//                 })
//             }
//             const token = jwt.sign({
//                 userId: checkEmail._id,
//                 Email: checkEmail.Email,
//             }, process.env.secret, { expiresIn: "1h" });

//             if (checkEmail.isVerified === true) {
//                 res.status(200).json({
//                     message: "Welcome " + checkEmail.UserName,
//                     token: token
//                 })
//                 checkEmail.token = token;
//                 await checkEmail.save();
//             } else {
//                 res.status(400).json({
//                     message: "Sorry user not verified yet."
//                 })
//             }
//         }

//     } catch (error) {
//         return res.status(500).json({
//             message: error.message,
//         })
//     }
// };
