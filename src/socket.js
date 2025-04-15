import { io } from 'socket.io-client';

// สร้าง socket instance (จะเชื่อมต่อกับ server ที่รันบน port 5000)
const socket = io('http://localhost:5000');

export default socket;