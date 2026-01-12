const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    try {
        const {
            fullName,
            phone,
            password,
            role, // SERVICE_RECEIVER or SERVICE_PROVIDER
            accessCode, // For Provider
            location,   // For Receiver
            idNumber    // For Receiver or others
        } = req.body;

        const userExists = await prisma.user.findFirst({
            where: {
                OR: [{ phone: phone }]
            }
        });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        const user = await prisma.user.create({
            data: {
                phone,
                password: hashedPassword,
                role: role || 'SERVICE_RECEIVER',
                accessCode: accessCode || null,
                profile: {
                    create: {
                        fullName,
                        location: location || null,
                        idNumber: idNumber || null
                    }
                }
            },
            include: {
                profile: true
            }
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                fullName: user.profile.fullName,
                phone: user.phone,
                role: user.role,
                token: generateToken(user.id, user.role),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const loginUser = async (req, res) => {
    const { identifier, password } = req.body; // Identifier can be Phone or Names (mapped to name search if needed, but phone is unique)

    try {
        // For simplicity, we assume identifier is PHONE for now, 
        // but the UI says "Names / Mobile". If Names, we'd need to search profile, which is harder since names aren't unique.
        // We will support PHONE primarily for unique login.

        // Check for user by phone
        const user = await prisma.user.findFirst({
            where: { phone: identifier },
            include: { profile: true }
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                fullName: user.profile?.fullName,
                phone: user.phone,
                role: user.role,
                token: generateToken(user.id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid phone number or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMe = async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            phone: true,
            role: true,
            profile: true
        }
    });

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = { registerUser, loginUser, getMe };
