const client = require('./connection')

const createUser = async (body) => {
    const {name, email, password} = body;
    await client.query('INSERT INTO public.user (name, email, password) VALUES ($1, $2, $3)' , [name, email, password], (err, result) =>{
        if (err){
            console.log(err);
        }
    });

}


module.exports = {createUser}