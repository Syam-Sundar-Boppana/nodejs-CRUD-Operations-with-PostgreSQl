const express = require('express');
const bodyParser = require('body-parser');
const client = require('./connection.js');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {createUser, getUser, getAllusers, getUserById, updateUserById, deleteUserById, getproducts, getproductsByCategory, addProduct, getProductById,updateproductById, deleteProductById} = require('./controllers.js')

const app = express();
app.use(bodyParser.json());

const authToken = (req,res, next) =>{
    let jwtToken;
    const authHeader = req.headers["authorization"];
    if(authHeader !== undefined){
        jwtToken = authHeader.split(" ")[1];
    }
    if(jwtToken === undefined){
        res.send("ACCESS DENIED");
    }else{
        jwt.verify(jwtToken,"SECERET_KEY", async(err, payload) =>{
            if(err){
                res.send(err);
            }else{
                next();
            }
        });
    }
}

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
            const payload = {email: email};
            jwt.sign(payload, "SECERET_KEY");
            res.send(`Welcome ${dbUser}`);
        }else{
            res.send("Incorrect password");
        }
    }
});


// Request for Getting All Users
app.get("/all-users", authToken, async(req, res) => {
    const users = await getAllusers();
    if (users.rows.length === 0){
        res.send("No Users Found");
    }else{
        res.send(users.rows);
    }
});


// Request for Getting User By ID
app.get("/user/:id",authToken, async(req,res) => {
    const id = req.params.id;
    const user = await getUserById(id);
    if(user.rows.length !== 0){
        res.send(user.rows[0]);
    }else{
        res.send("User Doesn`t Exists")
    }
});


// Request for Updating User By ID
app.put("/user/:id", authToken, async(req,res) => {
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
app.delete("/user/:id", authToken, async(req,res) => {
    const id = req.params.id;
    const user = await getUserById(id);
    if(user.rows.length !== 0){
        await deleteUserById(id);
        res.send("User Deleted Successfully");
    }else{
        res.send("User Doesn`t Exists")
    }  
});


// Request for Getting All Products
app.get('/products', authToken, async(req,res) => {
    const products = await getproducts();
    if (products.rows.length === 0){
        res.send("No Products Found")
    }else{
        res.send(products.rows);
    }
});


// Request for Getting Products By Category
app.get('/products/:category', authToken, async(req,res) => {
    const category = req.params.category
    const products = await getproductsByCategory(category);
    if (products.rows.length === 0){
        res.send("No Products Found on Given Category")
    }else{
        res.send(products.rows);
    }
});


// Request for Adding Product
app.post('/add-product', authToken, async(req,res) => {
    const {name, category, description, price} = req.body;
    await addProduct(name,category,description,price);
    res.send("Product Added Successfully");
});


// Request for Getting Product By Id
app.get('/product/:id', authToken, async(req,res) => {
    const id = req.params.id;
    const product = await getProductById(id);
    if (product.rows.length === 0){
        res.send("Product Doesn`t Exists");
    }else{
        res.send(product.rows[0]);
    }
});


// Request for Updating Product By Id
app.put('/product/:id', authToken, async(req,res) =>{
    const {name, category,description,price} = req.body;
    const id = req.params.id;
    const userData = {name:name, category:category, description:description, price:price};
    const product = await getProductById(id);
    if (product.rows.length === 0){
        res.send("Product Doesn`t Exists");
    }else{
        await updateproductById(id, userData);
        res.send("Product Updated Successfully");
    }
});


// Request for Deleting product By ID
app.delete("/product/:id", authToken, async(req,res) => {
    const id = req.params.id;
    const product = await getProductById(id);
    if(product.rows.length !== 0){
        await deleteProductById(id);
        res.send("Product Deleted Successfully");
    }else{
        res.send("Product Doesn`t Exists");
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
