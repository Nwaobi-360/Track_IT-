const express = require('express');
const mediaUpload = require('../middleware/multer')

const router = express.Router();

const { signUp, verify, logIn, getAll, getOne, updateParticipant, deleteParticipant, } = require('../controller/RidersControllers');
// const {authenticate} = require('../middleware/authentation');

//endpoint to register a new user
router.post('/create', signUp);

//endpoint to verify a registered user
// router.get('/verify/:id/:token', verify);

//endpoint to login a verified user
router.post('/login', logIn);

router.get('/requestInfo', getAll);

router.get('/getone/:participantId', getOne);

router.put('/update/:participantId', updateParticipant);

router.delete('/delete/:participantId', deleteParticipant);

module.exports = router;