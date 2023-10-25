const express = require('express');
const bodyParser = require('body-parser');
const client = require('./models/connection');
const routes = require('./routes/routes.js');

const app = express();
app.use(bodyParser.json());
app.use(routes);


// Running the Server on Port 3000
app.listen(3000, ()=>{
    console.log("Server Running at Port No: 3000");
});


// Database Connection
client.connect(()=>{
    console.log("Postgre DB Connected");
});
