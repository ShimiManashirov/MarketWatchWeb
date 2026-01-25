import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false 
    },
    image: {
        type: String, 
        default: ""
    },
    refreshTokens: {
        type: [String], 
        default: []
    }
});

export default mongoose.model('User', userSchema);