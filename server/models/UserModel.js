import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    image: { type: String, required: false },
    color: { type: Number, required: false },
    profileSetup: { type: Boolean, default: false },
});

// 🔹 Hash password only if it's modified
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // ✅ Prevent double hashing

    const salt = await bcrypt.genSalt(10); // ✅ Explicitly define rounds
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 🔹 Add a method for password comparison
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("Users", userSchema);
export default User;
