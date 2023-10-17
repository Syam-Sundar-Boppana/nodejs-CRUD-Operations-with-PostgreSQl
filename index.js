const http = require('http');
const PORT = process.env.PORT || 3000;
const client = require('./connection.js');
const emailValidator = require('email-validator');
const createUser = require('./controllers.js');

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

const server = http.createServer(async (req, res) => {
    const url = req.url;
    // Request to Register a User
    if (url === '/register' && req.method === "POST"){
        let body = '';
        req.on('data', (chunk) => {
            body += chunk
        });
        req.on('end', async () => {
            req.body = JSON.parse(body);
            const validEmail = emailValidator.validate(req.body.email);
            if (validEmail){
                const getUser = await client.query('SELECT * FROM public.user WHERE email = $1', [req.body.email]);
            if (getUser.rows.length === 0){
                const validPassword = passwordValidator(req.body.password);
                const {message, value} = validPassword
                if(value){
                    createUser(req.body);
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "text/html");
                    res.write(`User Created Succesfully ${req.body.name}`);
                    res.end();
                }else{
                    res.setHeader("Content-Type", "text/html");
                    res.write(message);
                    res.end();
                }
            }else{
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html");
                res.write('User Already Exists');
                res.end();
            }
            }else{
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html");
                res.write('Invalid Email Address');
                res.end(); 
            } 
        })
    }
    // Request to Login a User
    else if(url === '/login' && req.method === "POST"){
        let body = '';
        req.on('data', (chunk) => {
            body += chunk
        });
        req.on('end', async () => {
            req.body = JSON.parse(body);
            const validPassword = passwordValidator(req.body.password);
            const {message, value} = validPassword
            if (value) {
                const email = req.body.email.toLowerCase();
                const getUser = await client.query('SELECT * FROM public.user WHERE email = $1', [email]);
                if (getUser.rows.length === 0){
                    res.setHeader("Content-Type", "text/html");
                    res.write("User Not Found");
                    res.end();
                    }else{
                        if (getUser.rows[0].password === req.body.password){
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "text/html");
                            res.write(`Welcome ${getUser.rows[0].name}`);
                            res.end();
                        }else{
                            res.setHeader("Content-Type", "text/html");
                            res.write("Invalid Password");
                            res.end();
                        }
                    }
            }else{
                res.setHeader("Content-Type", "text/html");
                    res.write(message);
                    res.end();
                }
            })
    }else{
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.write("Welcome to Home Page");
        res.end();
    }
});

server.listen(PORT, ()=>{
    console.log("Server Running at Port No: 3000");
});

client.connect(()=>{
    console.log("Postgre DB Connected");
});

