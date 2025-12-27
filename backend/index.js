const http = require('http');
const express = require('express');
const connectMongoDB = require('./connection');
const userRoute = require('./routes/userRoutes');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const Chats = require('./modles/chats');
const GroupMessage = require('./modles/groupMessage');
const User = require('./modles/user');

const app = express();
const PORT = 8000;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// MongoDB connection
connectMongoDB('mongodb://127.0.0.1:27017/chattingApp')
    .then(() => console.log("Connected to MongoDB"));

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const userSocketMap = {};
io.on('connection', (socket) => {

    socket.on('register-user', (user_id) => {
        userSocketMap[user_id] = socket.id;
    });

    socket.on('send-message', async ({ message, sender_id, receiver_id }) => {
        await Chats.create({
            sender_id: sender_id,
            receiver_id: receiver_id,
            message: message
        })


        const receiverSocketId = userSocketMap[receiver_id];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('receive-private-message', { message, sender_id, receiver_id });
        }
    });

    socket.on("join-group", (group_id) => {
        socket.join(group_id);
    });

    socket.on("send-group-message", async ({ sender_id, group_id, message }) => {

        const sender = await User.findById(sender_id);
        const sender_name = sender.userName;

        await GroupMessage.create({
            sender_id, group_id, sender_name, message
        });

        socket.to(group_id).emit("receive-group-message", {
            sender_id,
            group_id,
            sender_name,
            message,
        });
    });

    socket.on('disconnect', () => {
        for (const userId in userSocketMap) {
            if (userSocketMap[userId] === socket.id) {
                delete userSocketMap[userId];
                break;
            }
        }
    });
})

app.use('/api', userRoute);

server.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));