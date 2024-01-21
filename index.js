const {Server} = require("socket.io")

const io = new Server(5000,  {
    cors: true
})

const usernameToSocket = new Map()
const socketToUsername = new Map()

io.on("connection", (socket) => {
    console.log(`New connection: ${socket.id}`);
    socket.on('room:join', ({username, roomId}) => {
        usernameToSocket.set(username, socket.id)
        socketToUsername.set(socket.id, username)
        socket.join(roomId)
        io.to(roomId).emit('user:joined', {username, id: socket.id})
        io.to(socket.id).emit('room:join', {username, roomId})
    })
    socket.on('room:ack', ({to, id}) => {
        io.to(to).emit("room:ack", {id: id})
    })
    socket.on("user:call", ({to, offer}) => {
        io.to(to).emit("incoming:call", {from: socket.id, offer})
    })
    socket.on("accepted:call", ({to, answer}) => {
        io.to(to).emit("accepted:call", {from: socket.id, answer})
    })

    // socket.on("sent:stream", ({to}) => {
    //     io.to(to).emit("sent:stream", {from: socket.id})
    // })

    socket.on("ice:candidate", ({candidate, to}) => {
        io.to(to).emit("ice:candidate", {from: socket.id, candidate})
    })
})