const express = require('express');
const {
    handleSignup,
    handleLogin,
    getAllUsers,
    getAllChats,
    getAllGroups,
    createGroup,
    getGroupChats
} = require('../controllers/user');

const router = express.Router();

router.post('/signup', handleSignup);

router.post('/login', handleLogin);

router.get('/getallusers', getAllUsers);

router.get('/getchats', getAllChats);

router.get("/getallgroups", getAllGroups);
router.get("/getgroupchats", getGroupChats);
router.post("/creategroup", createGroup);

module.exports = router;