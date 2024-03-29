const userModel = require('../UsersModel/companyModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateUser, validateUserLogin, } = require('../helpers/validator');
const  sendEmail  = require('../middleware/email');
// const  cloudinary  = require('../middleware/cloudinary');
const { generateDynamicEmail } = require('../emailHTML');
const { resetFunc } = require('../forgotPassword');
const resetHTML = require('../resetHTML');
require('dotenv').config();


//function to capitalize the first letter
const capitalizeFirstLetter = (str) => {
    return str[0].toUpperCase() + str.slice(1);
};



//Function to register a new user
exports.signUp = async (req, res) => {
    try {
       
        const { error } = validateUser(req.body);
        console.log(req.body)
if (error) {  
    return res.status(500).json({
        message: error.details[0].message 
    });
} else {
            const { CompanyName, CompanyAddress, Telephone, Email, password, } = req.body;
            const emailExists = await userModel.findOne({ Email: Email.toLowerCase(), CompanyName: CompanyName.toLowerCase() });
            // console.log(emailExists)
            if (emailExists) {
                return res.status(200).json({
                    message: 'Email or CompanyName already exists',
                })
            }
            // console.log(req.body)
            // const userNameExists = await userModel.findOne({ CompanyName: CompanyName.toLowerCase() });
            // console.log(userNameExists)
            // if (userNameExists) {
            //     return res.status(403).json({
            //         message: 'Username taken',
            //     })
            // }
            const salt = bcrypt.genSaltSync(12)
            const hashpassword = bcrypt.hashSync(password, salt);
            // const profilePic = req.files.profilePic.tempFilePath;
            // console.log(profilePic)

            // const fileuploader = await cloudinary.uploader.upload(
            //     profilePic,
            //     (err, profilePic) => {
            //         try {
            //             return profilePic;
            //         } catch (error) {
            //             console.log(error);
            //         }
            //     }
            // );
            // console.log(fileuploader);


            const user = new userModel({
                CompanyName: capitalizeFirstLetter(CompanyName).trim(),
                CompanyAddress: capitalizeFirstLetter(CompanyAddress).trim(),
                Telephone: Telephone,
                
                Email: Email.toLowerCase(),
                password: hashpassword,
            //     profilePic: {
            //         public_id: fileuploader.public_id,
            //         url: fileuploader.secure_url
            //     },
            });
            const name= user.CompanyName
            if (!user) {
                return res.status(404).json({
                    message: 'User not found',
                })
            }

            const first = user.CompanyName.slice(0, 1).toUpperCase();
            const firstN = user.CompanyName.slice(1).toLowerCase();
            const surn = user.CompanyAddress.slice(0, 1).toUpperCase();

            const fullName = first + firstN + " " + surn;

            const token = jwt.sign({
                CompanyName,
                // CompanysAddress,
                Email,
            }, process.env.secret, { expiresIn: "5m" });
            user.token = token;
            const subject = 'Email Verification'
            //await jwt.verify(token, process.env.secret);
            const link = `${req.protocol}://${req.get('host')}/api/v1/verify/${user.id}/${user.token}`
            const html = generateDynamicEmail(link, name)
            sendEmail({
                email: user.Email,
                html,
                subject
            })
            console.log(user.Email)
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


//Function to verify a new user with a link
exports.verify = async (req, res) => {
    try {
        const id = req.params.id;
        const token = req.params.token;
        const user = await userModel.findById(id); 
        const jsonStuff = jwt.verify(token, process.env.secret);
 
        if (jsonStuff) { 
            // Update the user if verification is successful
            const updatedUser = await userModel.findByIdAndUpdate(id, { isVerified: true }, { new: true });

            if (updatedUser.isVerified === true) {
                return res.status(200).send(
                    "<h3>You have been successfully verified. Kindly visit the login page.</h3><script>setTimeout(() => { window.location.href = 'https://the-track-it.vercel.app/login'; }, 2000);</script>");
            }
        } else {
            jwt.verify(token, process.env.secret, async (error) => {
                if (error instanceof jwt.JsonWebTokenError) {
                    // Handle token expiration
                    const id = req.params.id;
                    const updatedUser = await userModel.findById(id);
                    //const { firstName, lastName, email } = updatedUser;
                    const newtoken = jwt.sign({ Email: updatedUser.Email, CompanyName: updatedUser.CompanyName, CompanyAddress: updatedUser.CompanyAddress }, process.env.secret, { expiresIn: "300s" });
                    updatedUser.token = newtoken;
                    updatedUser.save();

                    const link = `${req.protocol}://${req.get('host')}/api/v1/verify/${id}/${updatedUser.token}`;
                    sendEmail({
                        Email: updatedUser.Email,
                        html: generateDynamicEmail(updatedUser.CompanyName, link),
                        subject: "RE-VERIFY YOUR ACCOUNT"
                    });
                    res.status(401).send("<h3>This link is expired. Kindly check your email for another email to verify.</h3><script>setTimeout(() => { window.location.href = 'https://the-track-it.vercel.app/login'; }, 2000);</script>");
                    return;
                }
            })
        }
    } catch (error) {
        return res.status(500).json({ 
            message: "Internal server error: " + error.message, 
        })
    }

} 
//Function to login a verified user
exports.logIn = async (req, res) => {
    try {
        const { error } = validateUserLogin(req.body);
        if (error) {
            return res.status(500).json({
                message: error.details[0].message
            }) 
        } else {
            const { Email, password } = req.body;
            const checkEmail = await userModel.findOne({ Email: Email.toLowerCase() });
            if (!checkEmail) {
                return res.status(404).json({
                    message: 'User not registered'      
                });
            }
            const checkPassword = bcrypt.compareSync(password, checkEmail.password);
            if (!checkPassword) {
                return res.status(404).json({
                    message: "Password is incorrect"
                })
            }
            const token = jwt.sign({
                userId: checkEmail._id,
                email: checkEmail.Email,
            }, process.env.secret, { expiresIn: "1h" });

            if (checkEmail.isVerified === true) {
                res.status(200).json({
                    message: "Welcome " + checkEmail.CompanyName,
                    token: token
                })
                checkEmail.token = token;
                await checkEmail.save();
            } else {
                res.status(400).json({
                    message: "Sorry user not verified yet."
                })
            }
        }

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        })
    }
};

//Function for the user incase password is forgotten
exports.forgotPassword = async (req, res) => {
    try {
        const checkUser = await userModel.findOne({ Email: req.body.Email });
        if (!checkUser) {
            return res.status(404).json({
                message: 'Email does not exist'
            });
        }
        else {
            const subject = 'Kindly reset your password'
            const link = `${req.protocol}://${req.get('host')}/api/v1/reset/${checkUser.id}`
            const html = resetFunc(checkUser.CompanyName, link)
            sendEmail({
                Email: checkUser.Email,
                html,
                subject
            })
            return res.status(200).json({
                message: "Kindly check your email to reset your password",
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        })
    }
};


//Funtion to send the reset Password page to the server
exports.resetPasswordPage = async (req, res) => {
    try {
        const userId = req.params.userId;
        const resetPage = resetHTML(userId);

        // Send the HTML page as a response to the user
        res.send(resetPage);
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        })
    }
};



//Function to reset the user password
exports.resetPassword = async (req, res) => {
    try {
        const userId = req.params.userId;
        const password = req.body.password;

        if (!password) {
            return res.status(400).json({
                message: "Password cannot be empty",
            });
        }

        const salt = bcrypt.genSaltSync(12);
        const hashPassword = bcrypt.hashSync(password, salt);

        const reset = await userModel.findByIdAndUpdate(userId, { password: hashPassword }, { new: true });
        return res.status(200).json({
            message: "Password reset successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        })
    }
};


//Function to signOut a user
// exports.signOut = async (req, res) => {
//     try {
//         const userId = req.params.userId
//         const user = await userModel.findById(userId)

//         user.token = null;
//         await user.save();
//         res.status(201).json({
//             message: `user has been signed out successfully`
//         })
//     } catch (error) {
//         return res.status(500).json({
//             message: error.message,
//         })
//     }
// };

//sign out function
exports.signOut = async (req, res) => {
    try {
        //get the user's id from the request user payload
        const { userId } = req.body

        const hasAuthorization = req.headers.authorization
        if (!hasAuthorization) {
            return res.status(401).json({
                message: 'Invalid authorization',
            })
        }

        const token = hasAuthorization.split(' ')[1]
        const user = await userModel.findById(userId)

        //check if theuser is not exisiting
        if (!hasAuthorization) {
            return res.status(401).json({
                message: "User not found",
            })
        }

        //Blacklist the token
        user.blacklist.push(token)
        await user.save()

        //return a respponse
        res.status(200).json({
            message: "User logged out successfully"
        })


    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}
