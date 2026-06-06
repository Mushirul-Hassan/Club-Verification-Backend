import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const AdminSchema = new mongoose.AdminSchema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false
    },
    fullName: {
        type: String,
        required: [true, 'Display name is required']
    },
    role: {
        type: String,
        enum: ['ADMIN', 'BOUNCER'],
        default: 'ADMIN'
    },
    isActive: {
        type: Boolean,
        default: true
    }

}, {timestamps: true });

AdminSchema.pre('save', async function (next) {
    if(!this.Modified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

export default mongoose.model('Admin', AdminSchema);