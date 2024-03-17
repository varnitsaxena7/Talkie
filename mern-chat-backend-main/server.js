// Import necessary modules
const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const User = require('./models/User');
const Message = require('./models/Message');
const rooms = ['Tech Talk', 'Finance Corner', 'Fun Corner'];
const cors = require('cors');
const path = require('path');

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Routes setup
app.use('/users', userRoutes);

// MongoDB connection setup
require('./connection');

// Server setup
const server = require('http').createServer(app);
const PORT = 5001;
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*', // Set FRONTEND_URL or allow all origins
    methods: ['GET', 'POST']
  }
});

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Event handler for new user
  socket.on('new-user', async () => {
    const members = await User.find();
    io.emit('new-user', members);
  });

  // Event handler for joining a room
  socket.on('join-room', async (newRoom, previousRoom) => {
    socket.join(newRoom);
    socket.leave(previousRoom);
    let roomMessages = await getLastMessagesFromRoom(newRoom);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    socket.emit('room-messages', roomMessages);
  });

  // Event handler for sending a message to a room
  socket.on('message-room', async (room, content, sender, time, date) => {
    const newMessage = await Message.create({ content, from: sender, time, date, to: room });
    let roomMessages = await getLastMessagesFromRoom(room);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    io.to(room).emit('room-messages', roomMessages);
    socket.broadcast.emit('notifications', room);
  });

  // Event handler for disconnecting
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Function to fetch last messages from a room
async function getLastMessagesFromRoom(room) {
  let roomMessages = await Message.aggregate([
    { $match: { to: room } },
    { $group: { _id: '$date', messagesByDate: { $push: '$$ROOT' } } }
  ]);
  return roomMessages;
}

// Function to sort room messages by date
function sortRoomMessagesByDate(messages) {
  return messages.sort((a, b) => {
    let date1 = a._id.split('/');
    let date2 = b._id.split('/');
    date1 = date1[2] + date1[0] + date1[1];
    date2 = date2[2] + date2[0] + date2[1];
    return date1 < date2 ? -1 : 1;
  });
}

// Route to fetch rooms
app.get('/rooms', (req, res) => {
  res.json(rooms);
});

// Serve static files for frontend
app.use(express.static(path.join(__dirname, './mern-chat-frontend-master/build')));

// Catch-all route to serve index.html for frontend routes
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, './mern-chat-frontend-master/build/index.html'));
});

// Start the server
server.listen(PORT, () => {
  console.log('Listening to port', PORT);
});
