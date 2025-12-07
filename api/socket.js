// Vercel Serverless Function for Socket.io
import { Server } from 'socket.io';

let io;

export default function handler(req, res) {
    if (!res.socket.server.io) {
        console.log('Initializing Socket.io server...');

        io = new Server(res.socket.server, {
            path: '/api/socket',
            addTrailingSlash: false,
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            // Broadcast control changes to all other clients
            socket.on('control-change', (data) => {
                console.log('Broadcasting control change:', data);
                socket.broadcast.emit('control-change', data);
            });

            // LED scene change
            socket.on('led-scene', (data) => {
                socket.broadcast.emit('led-scene', data);
            });

            // Light/Laser scene change
            socket.on('light-scene', (data) => {
                socket.broadcast.emit('light-scene', data);
            });

            // Camera controls
            socket.on('camera-control', (data) => {
                socket.broadcast.emit('camera-control', data);
            });

            // Music controls
            socket.on('music-control', (data) => {
                socket.broadcast.emit('music-control', data);
            });

            // Audio data broadcast
            socket.on('audio-data', (data) => {
                socket.broadcast.emit('audio-data', data);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });

        res.socket.server.io = io;
    }

    res.end();
}
