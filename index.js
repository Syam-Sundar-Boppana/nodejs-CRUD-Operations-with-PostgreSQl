const express = require('express');
const bodyParser = require('body-parser');
const client = require('./connection.js');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');
const {createUser, getUser, getAllusers, getUserById, updateUserById, deleteUserById} = require('./controllers.js')

const app = express();
app.use(bodyParser.json());

const passwordValidator = (password) =>{
    let value;
    let message = "";
    if(password.length < 8) { 
        message = "Password must be at least 8 characters";
        value = false;
    } else if(password.search(/[a-z]/) < 0) { 
        message = "Password must contain at least one lowercase letter";
        value = false;
    } else if(password.search(/[A-Z]/) < 0) { 
        message = "Password must contain at least one uppercase letter";
        value = false; 
    } else if(password.search(/[0-9]/) < 0) { 
        message = "Password must contain at least one number";
        value = false;
    } else { 
        message = "Success!";
        value = true
    }
    return {message:message, value:value};
}

// Request for User Registration
app.post('/register', async (req,res) => {
    const {name, email, password} = req.body;
    const validateEmail = emailValidator.validate(email);
    const validatePassword = passwordValidator(password);
    const validUser = await getUser(email);
    if (validUser.rows.length === 0){
        if(validateEmail){
            if(validatePassword.value){
                const hassedPassword = await bcrypt.hash(password, 10);
                const userData = {name:name, email:email, password:hassedPassword};
                await createUser(userData);
                res.send("User Created Successfully")
            }else{
                res.send(validatePassword.message);
            }
        }else{
            res.send("Invalid Email Address");
        }
    }else{
        res.send("User Already Exists");
    }  
});


// Request for User Login
app.post('/login', async (req,res) =>{
    const {email, password} = req.body;
    const validUser = await getUser(email);
    const dbUser = validUser.rows[0].name;
    const dbPassword = validUser.rows[0].password;
    if(validUser.rows.length === 0){
        res.send("Invalid User");
    }else{
        const validatePassword = await bcrypt.compare(password, dbPassword);
        if(validatePassword){
            res.send(`Welcome ${dbUser}`);
        }else{
            res.send("Incorrect password");
        }
    }
});


// Request for Getting All Users
app.get("/all-users", async(req, res) => {
    const users = await getAllusers();
    res.send(users.rows);
});


// Request for Getting User By ID
app.get("/user/:id", async(req,res) => {
    const id = req.params.id;
    const user = await getUserById(id);
    if(user.rows.length !== 0){
        res.send(user.rows[0]);
    }else{
        res.send("User Doesn`t Exists")
    }
});


// Request for Updating User By ID
app.put("/user/:id", async(req,res) => {
    const id = req.params.id;
    const {name, email, password} = req.body;
    const validateEmail = emailValidator.validate(email);
    const validatePassword = passwordValidator(password);
    const validUser = await getUserById(id);
    if (validUser.rows.length !== 0){
        if(validateEmail){
            if(validatePassword.value){
                const hassedPassword = await bcrypt.hash(password, 10);
                const userData = {name:name, email:email, password:hassedPassword};
                await updateUserById(id, userData);
                res.send("User Updated Successfully")
            }else{
                res.send(validatePassword.message);
            }
        }else{
            res.send("Invalid Email Address");
        }
    }else{
        res.send("User Doesn`t Exists");
    }
});


// Request for Deleting User By ID
app.delete("/user/:id", async(req,res) => {
    const id = req.params.id;
    const user = await getUserById(id);
    if(user.rows.length !== 0){
        await deleteUserById(id);
        res.send("User Deleted Successfully");
    }else{
        res.send("User Doesn`t Exists")
    }  
});


// Running the Server on Port 3000
app.listen(3000, ()=>{
    console.log("Server Running at Port No: 3000");
});


// Database Connection
client.connect(()=>{
    console.log("Postgre DB Connected");
});

