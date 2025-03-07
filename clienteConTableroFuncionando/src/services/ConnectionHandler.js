import { io } from "../../node_modules/socket.io-client/dist/socket.io.esm.min.js";

export const ConnectionHandler = {
    connected: false,
    socket: null,
    url: null,
    controller: null,
    init: (url, controller, onConnectedCallBack, onDisconnectedCallBack) => {
        ConnectionHandler.controller = controller;
        ConnectionHandler.socket = io(url); 
        
        ConnectionHandler.socket.on("connect", () => {
            console.log("Socket connected");
            
            ConnectionHandler.socket.on("connectionStatus", (data) => {
                console.log("Connection status:", data);
                ConnectionHandler.connected = true;
                onConnectedCallBack();
            });

            ConnectionHandler.socket.on("message", (payload) => {
                console.log("Received message:", payload);
                if (payload.type === "PLAYER_ELIMINATED" && 
                    payload.content.eliminatedPlayer === ConnectionHandler.socket.id) {
                    alert("¡Has sido eliminado!");
                    ConnectionHandler.socket.disconnect();
                    window.location.reload(); 
                }
                ConnectionHandler.controller.actionController(payload);
            });
        });

        ConnectionHandler.socket.on("disconnect", () => {
            console.log("Socket disconnected");
            ConnectionHandler.connected = false;
            onDisconnectedCallBack();
        });
        
        ConnectionHandler.socket.on("connect_error", (error) => {
            console.error("Connection error:", error);
        });
    }
};