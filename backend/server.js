//-------------------------------------------------------------db connection


// import express from 'express';
// import cors from 'cors';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();


const app = express();

app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3001", "http://localhost:3000","https://maleeshapa.github.io/SayCheese-f"],
    methods: ["GET","POST","PUT","DELETE"],
    credentials:true
}));


// Connect to the database
const uri = process.env.MONGO_URI;

mongoose.connect(uri)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log('MongoDB connection error:', err));


const PORT = 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});




//----------------------------------------------------------------------------booking

//--------------------------------------------------------------

const bookingDetailSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    nic: { type: String, required: true },
    type: { type: String, required: true },
    date: { type: Date, required: true },
    message: { type: String, required: true },
    download: { type: String}
});

const BookingDetail = mongoose.model('BookingDetail', bookingDetailSchema);

bookingDetailSchema.virtual('formattedDate').get(function() {
    const date = this.date;
    const formattedDate = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
    return formattedDate;
});


//--------------------------------------------------------------


const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    nic: { type: String, required: true, unique: true }
});

const User = mongoose.model('User', userSchema);

//-----------------------------------------------------------

app.post('/Booking', async (req, res) => {
    // Extract data from request body
    const { name, email, phone, nic, type, date, message } = req.body;
    if (!name || !email || !phone || !nic || !type || !date || !message) {
        return res.status(400).json({ error: 'Fill required fields' });
    }

    try {
        // Insert booking details into 'bookingdetails' collection
        const newBooking = new BookingDetail({ name, email, phone, nic, type, date, message });
        const bookingResult = await newBooking.save();


        // Check if email or NIC already exists in 'users' collection
        const existingUser = await User.findOne({ $or: [{ email }, { nic }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Email or NIC already exists' });
        }

        // Email and NIC do not exist, insert them into 'users' collection
        const newUser = new User({ email, nic });
        await newUser.save();

        // Return success response
        return res.json({ message: 'Booking added successfully', bookingResult });
    } catch (error) {
        console.error('Error processing booking:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


// ------------------------------------------------------- User Login--------------------------------------------

app.post('/Login', async (req, res) => {
    const { email, nic } = req.body;

    try {
        const bookingDetail = await BookingDetail.findOne({ email, nic });

        if (bookingDetail) {
            return res.json({ message: "Logged In" });
        } else {
            return res.status(401).json({ message: "Login Failed" });
        }
    } catch (err) {
        console.error('Error executing login query:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});



// ------------------------------------------------------- Read by email--------------------------------------------

app.get('/view/:email', async (req, res) => {
    const email = req.params.email;

    try {
        const bookingDetails = await BookingDetail.find({ email }).select('id name type date message download');
        if (!bookingDetails.length) {
            return res.status(404).json({ message: 'No bookings found for this email' });
        }
        return res.json(bookingDetails);
    } catch (err) {
        console.error('Error fetching booking details:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});



// ------------------------------------------------------- Admin Login--------------------------------------------

//-------------------------------------------------------

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const Admin = mongoose.model('Admin', adminSchema);

//-------------------------------------------------------

app.post('/Admin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email, password });
        if (admin) {
            return res.json({ message: "Logged In" });
        } else {
            return res.status(401).json({ message: "Login Failed" });
        }
    } catch (err) {
        console.error('Error executing admin query:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});



//----------------------------------------------------Retrieve booking details to Dashboard

app.get('/bookingdetails', async (req, res) => {
    try {
        const bookingDetails = await BookingDetail.find({});
        return res.json(bookingDetails);
    } catch (err) {
        console.error('Error retrieving booking details:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});

//------------------------------------------------------ DELETE booking by ID 

app.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await BookingDetail.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ error: 'Record not found' });
        }

        console.log('Deleted Document:', result);
        return res.status(200).json({ message: 'Record deleted successfully' });
    } catch (err) {
        console.error('Error deleting record:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


//------------------------------------------------------- insert booking details


app.post('/bookingdetails', async (req, res) => {
    const { name, email, nic, type, date, message, download } = req.body;

    // Validate request body
    if (!name || !email || !nic || !type || !date || !message || !download) {
        return res.status(400).json({ error: 'Fill required fields' });
    }

    // Create a new booking detail
    const newBooking = new BookingDetail({ name, email, nic, type, date, message, download });

    try {
        const result = await newBooking.save();
        console.log("Record inserted successfully");
        return res.json({ success: true, result });
    } catch (err) {
        console.error('Error inserting record:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});


// ----------------------------------------------------------------- user details show in dashboard

app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        return res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});


//----------------------------------------------------------------------update download URL by dashboard


app.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { download } = req.body;

    try {
        const updatedBooking = await BookingDetail.findByIdAndUpdate(
            id,
            { download },
            { new: true }
        );
        if (!updatedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        return res.json(updatedBooking);
    } catch (err) {
        console.error('Error updating booking:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});


//----------------------------------------------------------------- Route to handle sending email

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/send-email', (req, res) => {
    const { name, email, phone, nic, type, date, message } = req.body;

    // Email content
    const mailOptions = {
        from: 'SayCheese Booking System',
        to: 'maleeshapathirana1@gmail.com', // Change this to your desired recipient email
        subject: `New Booking Alert - ${name}`,
        text:
            `Name: ${name}
        \nEmail: ${email}
        \nContact Number: ${phone}
        \nNIC: ${nic}
        \nType: ${type}
        \nDate: ${date}
        \nMessage: ${message}`
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.send('Email sent successfully');
        }
    });
});


// -------------------------------------------gallery image---------------------------//

//---------------------------------------

const productSchema = new mongoose.Schema({

    Price: Number,
    Image: String
});

const Product = mongoose.model('Product', productSchema);

//---------------------------------------


app.get('/product', async (req, res) => {
    try {
        const products = await Product.find({}, { _id: 1, Price: 1, Image: 1 }); // Corrected to use _id instead of Id
        return res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


// -------------------------------------product detail show--------------------------------


app.get('/product', async (req, res) => {
    try {
        const products = await Product.find({}, { _id: 1, Price: 1, Image: 1 });
        return res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


//------------------------------------------------------- insert product details


app.post('/product', async (req, res) => {
    const { price, image } = req.body;

    try {
        // Create a new instance of Product model
        const newProduct = new Product({ Price: price, Image: image });

        // Save the new product to the database
        const savedProduct = await newProduct.save();

        console.log("Record inserted successfully");
        return res.json({ success: true, result: savedProduct });
    } catch (err) {
        console.error('Error inserting product:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});


// ----------------------------------------------------------------------DELETE product by ID

app.delete('/product/delete/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        // Attempt to delete the product from MongoDB
        const deletedProduct = await Product.findByIdAndDelete(productId);

        // Check if the product was found and deleted
        if (!deletedProduct) {
            console.log('No product found to delete');
            return res.status(404).json({ message: 'Product not found' });
        }

        console.log('Deleted product:', deletedProduct);
        return res.status(200).json({ message: 'Product deleted successfully', deletedProduct });
    } catch (err) {
        console.error('Error deleting product:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
