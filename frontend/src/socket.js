import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000'; // Adresse de votre serveur backend
export const socket = io(SOCKET_URL, {
  autoConnect: true
});