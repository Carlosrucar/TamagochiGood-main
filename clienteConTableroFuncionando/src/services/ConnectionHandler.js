import { io } from "../../node_modules/socket.io-client/dist/socket.io.esm.min.js";

export const ConnectionHandler = {
    connected: false,
    socket: null,
    url: null,
    controller: null,
    init: (url, controller, onConnectedCallBack, onDisconnectedCallBack) => {
        ConnectionHandler.controller = controller;
        ConnectionHandler.socket = io(url); // Store the socket reference
        
        ConnectionHandler.socket.on("connect", () => {
            console.log("Socket connected");
            
            ConnectionHandler.socket.on("connectionStatus", (data) => {
                console.log("Connection status:", data);
                ConnectionHandler.connected = true;
                onConnectedCallBack();
            });

            ConnectionHandler.socket.on("message", (payload) => {
                console.log("Received message:", payload);
                ConnectionHandler.controller.actionController(payload);
            });
        });

        ConnectionHandler.socket.on("disconnect", () => {
            console.log("Socket disconnected");
            ConnectionHandler.connected = false;
            onDisconnectedCallBack();
        });

        // Add error handler
        ConnectionHandler.socket.on("connect_error", (error) => {
            console.error("Connection error:", error);
        });
    }
};