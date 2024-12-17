const express = require('express');
const cors=require('cors');
const app = express();
const userModel = require('./userDB');
const Orders = require('./ordersDB')
const bcrypt = require('bcrypt');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/users', async (req, res) => {
    try {
        const users = await userModel.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: `Error while fetching users ${error}`});
    }
});
app.get('/api/:id/orders',async(req,res)=>{
    try{
        const id=req.params.id;
        const userOrders=await Orders.find({userId:id});
        if(!userOrders.length){
            res.status(404).json({message:"No orders found"});
            return;
        }
        res.status(200).json(userOrders);

    }
    catch(e){
        res.status(500).json({message: `An error occured : ${e}`})
    }
})

app.post('/api/check-user', async (req, res) => {
    const { userName, password } = req.body;
    try {
        const user = await userModel.findOne({ userName });
        if (!user) {
            return res.status(404).json({ message: 'Username does not exist' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect password' });
        }
        res.status(200).json({ message: 'User authenticated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error });
    }
});

app.post('/api/create-user', async (req, res) => {
    const { userName, email, password } = req.body;
    console.log("signup rececived");
    try {
        const saltRounds = 6;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const existingUser = await userModel.findOne({ userName });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const existingEmail = await userModel.findOne({ email });
        if(existingEmail) {
            return res.status(400).json({ message : 'Email already exists'});
        }
        const newUser = new userModel({
            userName,
            email,
            password: hashedPassword,
        });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: `Error while creating account: ${error}` });
    }
});


app.post('/api/:id/place-order', async (req, res) => {
    try {
        const { cart, totalCost } = req.body;
        const userId = req.params.id;
        const newOrder = new Orders({
            userId: userId,
            orderList: cart,
            totalCost: totalCost,
            orderDate : Date.now()
        });
        await newOrder.save();
        res.status(200).json({ message: "Order Placed Successfully..!" });
    } catch (error) {
        res.status(500).json({ message: `Error while placing order: ${error}` });
    }
});

app.listen(PORT, (err) => {
    if (err) console.log(err);
    else console.log(`Server running on http://localhost:${PORT}`);
});
