// //fisrt we impoort our mongoose dependency
const mongoose = require('mongoose');
// //then we create a bdhost
// const dbhost = 'localhost:27017';
// //then we create a dbname
// const dbName = 'LogisticsDB';
// //we then connecct to our mongoose
// mongoose.connect(`mongodb://${dbhost}/${dbName}`)
// //we then use dot then and catch to handle errors
// .then(() => {
//     console.log('CONNECTION TO DATABASE SUCCESSFULLY ESTABLISHED');
// }) 
// .catch((error) => {
//     console.log('SOMETHING WENT WRONG', error.message);
// })

// const mongoose = require('mongoose');
require('dotenv').config();

const db = process.env.db;

mongoose.connect(db)
.then(() => {
    console.log('Connection to database established successfully');
})
.catch((error) => {
    console.log('Error connecting to database: ' + error.message); 
})