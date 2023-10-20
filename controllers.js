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

const getproducts = async () =>{
    return await client.query('SELECT * FROM public.products ORDER BY id ASC');
}

const getproductsByCategory = async (category) =>{
    return await client.query('SELECT * FROM public.products WHERE category = $1 ORDER BY id ASC', [category]);
}

const addProduct = async(name, category, description, price) =>{
    await client.query('INSERT INTO public.products (name, category, description, price) VALUES ($1,$2,$3,$4)',[name, category,description,price]);
}

const getProductById = async(id) =>{
    return await client.query('SELECT * FROM public.products WHERE id=$1', [id]);
}

const updateproductById = async(id, body) =>{
    const {name, category, description, price} = body;
    await client.query(`UPDATE public.products SET name=$1, category=$2, description=$3, price=$4 WHERE id=$5`, [name,category,description,price,id]);
}

const deleteProductById = async(id) =>{
    await client.query('DELETE FROM public.products WHERE id = $1', [id]);
}


module.exports = {createUser, getUser, getAllusers, getUserById, updateUserById, deleteUserById, getproducts, getproductsByCategory, addProduct, getProductById, updateproductById, deleteProductById}