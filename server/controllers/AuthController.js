import { compare } from "bcrypt";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { renameSync,unlinkSync } from "fs";
import bcrypt from "bcrypt";


const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, userId) => {
    return jwt.sign({ email, userId }, process.env.JWT_KEY, { expiresIn: maxAge });
};

export const signup = async (request, response) => {
    try {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).json({ message: "Email and password are required." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return response.status(400).json({ message: "User already exists." });
        }

        // 🔹 Remove manual password hashing; User model will hash it
        const user = await User.create({
            email,
            password,  // Don't hash it manually
            profileSetup: false
        });

        const token = createToken(user.email, user.id);

        response.cookie("jwt", token, {
            maxAge,
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });

        return response.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
            }
        });

    } catch (error) {
        console.error("Signup Error:", error);
        return response.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (request, response) => {
    try {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return response.status(404).json({ message: "User with the given email not found." });
        }

        console.log("Stored Password in DB:", user.password); // Debugging

        // 🔹 Use model's comparePassword method
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return response.status(400).json({ message: "Password is incorrect." });
        }

        const token = createToken(user.email, user.id);

        response.cookie("jwt", token, {
            maxAge,
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });

        return response.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                color: user.color,
            },
        });

    } catch (error) {
        console.error("Login error:", error);
        return response.status(500).json({ message: "Internal Server Error" });
    }
};


export const getUserInfo=async (request, response, next) => {
    try{
        const userData= await User.findById(request.userId);
        if (!userData) {
            return response.status(404).send( 'User with given id not found.');
        }

        
        return response.status(200).json({
           
            id: userData.id,
            email: userData.email,
            
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
        
    });

    } catch (error){
        console.log((error));
        return response.status(500).send("Internal Server Error");
    }
    

};

export const updateProfile=async (request, response, next) => {
    try{
        const {userId}=request;
        const {firstName, lastName,  color}=request.body;

        
        if (!firstName || !lastName ) {
            return response.status(400).send( 'First name, last name and color are required.');
        }

        const userData= await User.findByIdAndUpdate(userId, {firstName, lastName, color, profileSetup: true}, {new: true, runValidators: true});
        
        return response.status(200).json({
           
            id: userData.id,
            email: userData.email,
            
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
        
    });

    } catch (error){
        console.log((error));
        return response.status(500).send("Internal Server Error");
    }
    

};



export const addProfileImage
=async (request, response, next) => {
    try{
        if (!request.file){
            return response.status(400).send( 'File is required.');
        }

        const date=Date.now();
        let fileName="uploads/profiles/" +date + request.file.originalname;
        renameSync(request.file.path, fileName);

        const updatedUser=await User.findByIdAndUpdate(request.userId, {image:fileName}, {new: true, runValidators: true});
        
        return response.status(200).json({
           
            
            image: updatedUser.image,
           
        
    });

    } catch (error){
        console.log((error));
        return response.status(500).send("Internal Server Error");
    }
    

};




export const removeProfileImage
=async (request, response, next) => {
    try{
        const {userId}=request;
        const user = await User.findById(userId);
        if (!user) {
            return response.status(404).send("User not found");
        }
        if (user.image) {
            unlinkSync(user.image);
        }

        user.image = null;
        await user.save();

        
        
        return response.status(200).send("Profile image removed successfully");}
        catch (error){
        console.log((error));
        return response.status(500).send("Internal Server Error");
    }
    

};

export const logout
=async (request, response, next) => {
    try{
        response.cookie("jwt", "",{
            maxAge: 1,
            secure: true,
            sameSite: "None",
        })
        
        
        return response.status(200).send("Logout Successful.");}
        catch (error){
        console.log((error));
        return response.status(500).send("Internal Server Error");
    }
    

};






