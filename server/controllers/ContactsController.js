import mongoose from "mongoose";
import User from "../models/UserModel.js"; // Corrected import
import Message from "../models/MessagesModel.js"; // Corrected import


export const searchContacts = async (request, response, next) => {
    try {
        const { searchTerm } = request.body;

        if (!searchTerm) {
            return response.status(400).send({ error: "searchTerm is required." });
        }

        const regex = new RegExp(searchTerm, "i"); // Case-insensitive search

        const contacts = await User.find({
            _id: { $ne: request.userId }, // Exclude the current user
            $or: [
                { firstName: regex }, // Fixed field name
                { lastName: regex },  // Fixed field name
                { email: regex }
            ]
        });

        return response.status(200).json({ contacts });

        
    } catch (error) {
        console.error("Error searching contacts:", error);
        return response.status(500).json({ error: "Internal Server Error" });
    }
};

export const getContactsForDMList = async (request, response, next) => {
    try {
       
        let {userId} = request;
        userId = new mongoose.Types.ObjectId(userId);
        const contacts = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: userId },
                        { recipient: userId }
                    ],
                },
            },
            {
                $sort: { timestamp: -1},
            },
            {$group:{
                _id:{
                    $cond: {
                        if:{$eq: ["$sender", userId]},
                        then: "$recipient",
                        else: "$sender"
                    },
                },
                lastMessageTime: { $first: "$timestamp"}
            },
        },
        {$lookup:{
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "contactInfo"
        },
    },
    {
        $unwind: "$contactInfo",
    },
    {
        $project:{
            _id: 1,
            lastMessageTime: 1,
            email: "$contactInfo.email",
            firstName: "$contactInfo.firstName",
            lastName: "$contactInfo.lastName",
            image: "$contactInfo.image",
            color: "$contactInfo.color",
            
        },
    },
    {
        $sort: { lastMessageTime: -1 },
    },
            

        ]);
        return response.status(200).json({ contacts });

        
    } catch (error) {
        console.error("Error searching contacts:", error);
        return response.status(500).json({ error: "Internal Server Error" });
    }
};
