import { io } from "socket.io-client";
import React from "react";
let SOCKET_URL = 'http://localhost:5001';

if (process.env.NODE_ENV !== 'development') {
    SOCKET_URL = 'https://talkie-3.onrender.com';
}

export const socket = io(SOCKET_URL);
// app context
export const AppContext = React.createContext();
