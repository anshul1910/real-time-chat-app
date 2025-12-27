const User = require('../modles/user');
const Chats = require('../modles/chats');
const Group = require('../modles/group');
const GroupMessage = require('../modles/groupMessage');
const bcrypt = require('bcrypt');
const { setUser } = require('../services/auth');
const jwt = require("jsonwebtoken");
const SecretKey = "HomeAlone";

function handleSignup(req, res) {
    const newUser = req.body;
    if (!newUser || !newUser.userName || !newUser.email || !newUser.password) {
        return res.status(400).json({ error: "Enter valid details" });
    }

    const plainPass = newUser.password;
    const saltRounds = 10;

    bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) return res.status(500).json({ error: "Error generating salt" });

        bcrypt.hash(plainPass, salt, async function (err, hash) {
            if (err) return res.status(500).json({ error: "Error hashing password" });

            try {
                const result = await User.create({
                    userName: newUser.userName,
                    email: newUser.email,
                    password: hash,
                });
                return res.status(201).json({ message: "User created successfully", userId: result._id });
            } catch (error) {
                return res.status(500).json({ error: "Error creating user" });
            }
        })
    })
}

async function handleLogin(req, res) {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = setUser(user);
            res.cookie("uid", token);
            return res.status(200).json({ message: "Login successful" });
        } else {
            return res.status(401).json({ message: "Invalid credentials" });
        }
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    }
}

async function getAllUsers(req, res) {
    try {
        const allUsers = await User.find();
        return res.status(200).send(allUsers);
    }
    catch (e) {
        return res.status(500).send({ error: `Failed to load users : ${e}` });
    }
}

async function getAllChats(req, res) {
    try {
        const allChats = await Chats.find();
        return res.status(200).send(allChats);
    } catch (e) {
        return res.status(500).send({ error: `Failed to load Chats : ${e}` });
    }
}

async function getAllGroups(req, res) {
    try {
        const token = req.cookies?.uid;
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const userId = getUser(token);

        const groups = await Group.find({ members: userId });

        return res.status(200).json(groups);
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
};

async function getGroupChats(req, res) {
    try {
        const groupMessages = await GroupMessage.find();

        const groupedData = {};

        for (const message of groupMessages) {
            const groupId = message.group_id.toString();

            if (!groupedData[groupId]) {
                const group = await Group.findById(groupId);
                let memberNames = [];

                if (group && group.members && group.members.length > 0) {
                    const members = await User.find({ _id: { $in: group.members } }).select("userName");
                    memberNames = members.map((u) => u.userName);
                }
                groupedData[groupId] = {
                    group_id: groupId,
                    memberNames,
                    messages: []
                };
            }
            groupedData[groupId].messages.push(message.toObject());
        }
        const responseData = Object.values(groupedData);

        res.json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch group chats" });
    }
}

function getUser(token) {
    if (!token) throw new Error("No token provided");
    const decoded = jwt.verify(token, SecretKey);
    return decoded._id;
}

async function createGroup(req, res) {
    try {
        const token = req.cookies?.uid;
        const userId = getUser(token);

        const { groupName, members } = req.body;

        if (!groupName?.trim() || !Array.isArray(members) || members.length === 0) {
            return res.status(400).json({ message: "Invalid group data" });
        }

        await Group.create({
            groupName: groupName.trim(),
            members: [userId, ...members],
        });
        return res.status(201).json({ message: "Group created successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
}

module.exports = {
    handleSignup,
    handleLogin,
    getAllUsers,
    getAllChats,
    getAllGroups,
    getGroupChats,
    createGroup
}