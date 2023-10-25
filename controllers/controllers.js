const client = require('../models/connection');
const jwt = require('jsonwebtoken');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');

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
exports.userRegister = async (req,res) => {
    const {name, email, password} = req.body;
    const validateEmail = emailValidator.validate(email);
    const validatePassword = passwordValidator(password);
    const validUser = await client.query('SELECT * FROM public.user WHERE email = $1', [email]);
    if (validUser.rows.length === 0){
        if(validateEmail){
            if(validatePassword.value){
                const hassedPassword = await bcrypt.hash(password, 10);
                await client.query('INSERT INTO public.user (name, email, password) VALUES ($1, $2, $3)' , [name, email, hassedPassword]);
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
};


// Request for User Login
exports.userLogin =  async (req,res) =>{
    const {email, password} = req.body;
    const validUser = await client.query('SELECT * FROM public.user WHERE email = $1', [email]);
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
};


// Request for Getting All Users
exports.getAllusers = async(req, res) => {
    const users = await client.query('SELECT * FROM public.user ORDER BY id ASC');
    if (users.rows.length === 0){
        res.send("No Users Found");
    }else{
        res.send(users.rows);
    }
};


// Request for Getting User By ID
exports.getUserById = async(req,res) => {
    const id = req.params.id;
    const user = await client.query('SELECT * FROM public.user WHERE id = $1', [id]);
    if(user.rows.length !== 0){
        res.send(user.rows[0]);
    }else{
        res.send("User Doesn`t Exists")
    }
};


// Request for Updating User By ID
exports.updateUserById =  async(req,res) => {
    const id = req.params.id;
    const {name, email, password} = req.body;
    const validateEmail = emailValidator.validate(email);
    const validatePassword = passwordValidator(password);
    const validUser = await client.query('SELECT * FROM public.user WHERE id = $1', [id]);
    if (validUser.rows.length !== 0){
        if(validateEmail){
            if(validatePassword.value){
                const hassedPassword = await bcrypt.hash(password, 10);
                await await client.query(`UPDATE public.user SET name=$1, email=$2, password=$3 WHERE id=$4`, [name,email,hassedPassword,id]);
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
};


// Request for Deleting User By ID
exports.deleteUserById = async(req,res) => {
    const id = req.params.id;
    const user = await client.query('SELECT * FROM public.user WHERE id = $1', [id]);
    if(user.rows.length !== 0){
        await client.query('DELETE FROM public.user WHERE id = $1', [id]);
        res.send("User Deleted Successfully");
    }else{
        res.send("User Doesn`t Exists")
    }  
};


// Request for Getting All Products
exports.getproducts = async(req,res) => {
    const products = await client.query('SELECT * FROM public.products ORDER BY id ASC');
    if (products.rows.length === 0){
        res.send("No Products Found")
    }else{
        res.send(products.rows);
    }
};


// Request for Getting Products By Category
exports.getproductsByCategory = async(req,res) => {
    const category = req.params.category
    const products = await client.query('SELECT * FROM public.products WHERE category = $1 ORDER BY id ASC', [category]);
    if (products.rows.length === 0){
        res.send("No Products Found on Given Category")
    }else{
        res.send(products.rows);
    }
};


// Request for Adding Product
exports.addProduct = async(req,res) => {
    const {name, category, description, price} = req.body;
    const product = await client.query('SELECT * FROM public.products WHERE name = $1', [name]);
    if(product.rows.length === 0){
        await client.query('INSERT INTO public.products (name, category, description, price) VALUES ($1,$2,$3,$4)',[name, category,description,price]);
        res.send("Product Added Successfully");
    }else{
        res.send("Product Already Exists");
    }
};


// Request for Getting Product By Id
exports.getProductById = async(req,res) => {
    const id = req.params.id;
    const product = await client.query('SELECT * FROM public.products WHERE id=$1', [id]);
    if (product.rows.length === 0){
        res.send("Product Doesn`t Exists");
    }else{
        res.send(product.rows[0]);
    }
};


// Request for Updating Product By Id
exports.updateproductById = async(req,res) =>{
    const {name, category,description,price} = req.body;
    const id = req.params.id;
    const product = await client.query('SELECT * FROM public.products WHERE id=$1', [id]);
    if (product.rows.length === 0){
        res.send("Product Doesn`t Exists");
    }else{
        await client.query(`UPDATE public.products SET name=$1, category=$2, description=$3, price=$4 WHERE id=$5`, [name,category,description,price,id]);
        res.send("Product Updated Successfully");
    }
};


// Request for Deleting product By ID
exports.deleteProductById = async(req,res) => {
    const id = req.params.id;
    const product = await client.query('SELECT * FROM public.products WHERE id=$1', [id]);
    if(product.rows.length !== 0){
        await client.query('DELETE FROM public.products WHERE id = $1', [id]);
        res.send("Product Deleted Successfully");
    }else{
        res.send("Product Doesn`t Exists");
    }  
};
