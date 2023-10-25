const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const controller = require('../controllers/controllers');

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


router.post('/register', controller.userRegister);
router.post('/login', controller.userLogin);
router.get('/all-users', authToken, controller.getAllusers);
router.get('/user/:id', authToken, controller.getUserById);
router.put("/user/:id", authToken, controller.updateUserById);
router.delete("/user/:id", authToken, controller.deleteUserById);
router.get('/products', authToken, controller.getproducts);
router.get('/products/:category', authToken, controller.getproductsByCategory);
router.post('/add-product', authToken, controller.addProduct);
router.get('/product/:id', authToken, controller.getProductById);
router.put("/product/:id", authToken, controller.updateproductById);
router.delete("/product/:id", authToken, controller.deleteProductById);

module.exports = router;