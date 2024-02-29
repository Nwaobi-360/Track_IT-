const RidersModel = require('../UsersModel/RidersModel');
const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { validateRider, validateRiderLogin, } = require('../helpers/Ridervalidate');
const  cloudinary  = require('../middleware/cloudinary');
const { sendEmail } = require('../middleware/email');
const { generateDynamicEmail } = require('../emailHTML');
require('dotenv').config();

//function to capitalize the first letter
const capitalizeFirstLetter = (str) => {
    return str[0].toUpperCase() + str.slice(1);
};

//Function to register a new user
exports.signUp = async (req, res) => {
    try {
       
        const { error } = validateRider(req.body);
        console.log(req.body)
if (error) {  
    return res.status(500).json({
        message: error.details[0].message
    });
} else {
        const { RiderFirstName, RiderLastName, RiderPhoneNumber, RiderAddress, RiderEmail, RiderPassword, } = req.body;
            const emailExists = await RidersModel.findOne({ RiderEmail: RiderEmail.toLowerCase() });
            console.log(RiderEmail)
            if (emailExists) {
                return res.status(200).json({
                    message: 'Email already exists',
                })
            }
            // console.log(req.body)
            const FirstNameExists = await RidersModel.findOne({ RiderFirstName: RiderFirstName.toLowerCase() });
            console.log(RiderFirstName)
            if (FirstNameExists) {
                return res.status(403).json({
                    message: 'RiderFirstName taken',
                })
            }
            const salt = bcrypt.genSaltSync(12)
            const hashpassword = bcrypt.hashSync(RiderPassword, salt);

           
            // const fileuploader = await cloudinary.uploader.upload(req.files.profilePic.tempFilePath,{folder:"Track_IT"},(error, profilePic) => {
            //     try{
            //         //Delete the temporary file
            //         fs.unlikeSync(req.files.profilePic.tempFilePath);

            //         return profilePic
            //     } catch (error) {
            //         return error
            //     }
            // })
            // console.log(fileuploader);

            const user = new RidersModel({
                RiderFirstName: capitalizeFirstLetter(RiderFirstName).trim(),
                RiderLastName: capitalizeFirstLetter(RiderLastName).trim(),
                RiderPhoneNumber,
                RiderAddress: capitalizeFirstLetter(RiderAddress).trim(),
                RiderEmail: RiderEmail.toLowerCase(),
                RiderPassword: hashpassword,
                // profilePic: {
                // public_id: fileuploader.public_id,
                // url: fileuploader.secure_url
                // },
            });

            if (!user) {
                return res.status(404).json({
                    message: 'User not found',
                })
            }

           const token = jwt.sign({
                RiderFirstName,
                // CompanysAddress,
                RiderEmail,
            }, process.env.secret, { expiresIn: "60s" });
            user.token = token;
            const subject = 'Email Verification'
            await jwt.verify(token, process.env.secret);
            const link = `${req.protocol}://${req.get('host')}/api/v1/verify/${user.id}/${user.token}`
            const html = generateDynamicEmail(RiderFirstName, link)
            sendEmail({
                RiderEmail: user.RiderEmail,
                html,
                subject
            })

            await user.save()
            return res.status(200).json({
                message: 'User profile created successfully',
                data: user,
            })

        }
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        })
    }
};

//Function to login a verified user
exports.logIn = async (req, res) => {
    try {
        const { error } = validateRiderLogin(req.body);
        if (error) {
            return res.status(500).json({
                message: error.details[0].message
            }) 
        } else {
            const { RiderEmail, RiderPassword } = req.body;
            const checkEmail = await RidersModel.findOne({ RiderEmail: RiderEmail.toLowerCase() });
            if (!checkEmail) {
                return res.status(404).json({
                    message: 'User not registered'
                });
            }
            const checkPassword = bcrypt.compareSync(RiderPassword, checkEmail.RiderPassword);
            if (!checkPassword) {
                return res.status(404).json({
                    message: "Password is incorrect"
                })
            }
            const token = jwt.sign({
                userId: checkEmail._id,
                RiderEmail: checkEmail.RiderEmail,
            }, process.env.secret, { expiresIn: "1h" });

            if (checkEmail.isVerified === true) {
                res.status(200).json({
                    message: "Welcome " + checkEmail.RiderFirstName,
                    token: token
                })
                checkEmail.token = token;
                await checkEmail.save();
            } else {
                res.status(400).json({
                    message: "Sorry rider not verified yet."
                })
            }
        }

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        })
    }
};

exports.getAll = async (req, res) => {
    try{
        const user = await RidersModel.find();
        if (!user){
            res.status(400).json({
                message: "Failed to get riders"
            })
        }
        else {
            res.status(201).json({
                message: "Riders fetched successfully",
                totalNumberOfRiders: user.length,
                data:user
            })
        }

    }catch (err){
        res.status (500).json({
            message:err.message
        })
    }
}

exports.getOne = async (req, res)=>{
    try{
        const userId = req.params.userId
        const user = await RidersModel.findById(userId);
        if (!user){
            res.status(404).json({
                message: "Failed to get Rider"
            })
        }
        else {
            res.status(201).json({
                message: "Rider fetched successfully",
                data:user
            })
        }
    }catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
}

exports.updateParticipant = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await RidersModel.findById(userId);
        if (!user) {
            return res.status(400).json({
                message: `Rider with id ${userId} does not exist`
            });
        }

        const userData = {
            RiderFirstName: req.body.RiderFirstName || user.RiderFirstName,
            RiderLastName: req.body.RiderLastName || user.RiderLastName,
            RiderPhoneNumber: req.body.RiderPhoneNumber || user.RiderPhoneNumber,
            RiderAddress: req.body.RiderAddress || user.RiderAddress,
            RiderEmail: req.body.RiderEmail || user.RiderEmail,
            RiderPassword: req.body.RiderPassword || user.RiderPassword,
        };

        // Check if profile picture is included in the request
        if (req.file) {
            const profilePicturePath = req.file.path; // Path of the uploaded file

            // Move profile picture to desired location
            const newPath = path.join(__dirname, 'profilePic', req.file.originalname);
            fs.renameSync(profilePicturePath, newPath);

            // Update user data with profile picture path
            userData.profilePicture = newPath;
        }

        const updatedData = await RidersModel.findByIdAndUpdate(
            userId,
            userData,
            { new: true }
        );

        res.status(201).json({
            message: `Rider with id ${userId} updated`,
            data: updatedData
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.deleteParticipant = async (req, res)=>{
    try{
        const userId = req.params.userId;
        const user = await RidersModel.findById(req.params.userId)
    
        if (!participant) {
            res.status(404).json({
              message: `Rider with id ${userId} does not exist`
            });
          }
          else{
            await RiderModel.findByIdAndDelete(userId);
            res.status(201).json({
              message: `Rider with id ${userId} deleted`
            });
          }
      
    }catch (err){
        res.status(500).json({
            message: err.message
        })
    }
}
