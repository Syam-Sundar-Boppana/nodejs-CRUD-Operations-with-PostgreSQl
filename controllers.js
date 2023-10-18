const client = require('./connection')

const createUser = async(body) => {
    const {name, email, password} = body;
    await client.query('INSERT INTO public.user (name, email, password) VALUES ($1, $2, $3)' , [name, email, password]);
}

const getUser = async(email) => {
    return await client.query('SELECT * FROM public.user WHERE email = $1', [email]);
}

const getAllusers = async() =>{
    return await client.query('SELECT * FROM public.user ORDER BY id ASC');
}

const getUserById = async(id) =>{
    return await client.query('SELECT * FROM public.user WHERE id = $1', [id]);
}

const updateUserById = async(id, body) =>{
    const{name, email, password} = body;
    await client.query(`UPDATE public.user SET name=$1, email=$2, password=$3 WHERE id=$4`, [name,email,password,id]);
}

const deleteUserById = async(id) =>{
    await client.query('DELETE FROM public.user WHERE id = $1', [id]);
}

module.exports = {createUser, getUser, getAllusers, getUserById, updateUserById, deleteUserById}