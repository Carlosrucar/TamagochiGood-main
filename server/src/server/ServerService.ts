import { DefaultEventsMap, Server, Socket } from 'socket.io';
import http from 'http';
import { GameService } from '../game/GameService';


export class ServerService {
    private io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> | null;
    private active : boolean;
    static messages = {
        out: {
            new_player: "NEW_PLAYER"
        } 
    }

    public inputMessage = [
            {
                type: "HELLO",
                do: this.doHello
            },
            {
                type: "BYE",
                do: this.doBye
            }
        ];

    private static instance: ServerService;
    private constructor() {
        this.io = null;
        this.active = false;
    };

    static getInstance(): ServerService {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ServerService();
        return this.instance;
    }

    public init(httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) {
        this.io = new Server(httpServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });
        this.active = true;
    
        this.io.on('connection', (socket) => {
            console.log("New client connected:", socket.id);
            socket.emit("connectionStatus", { status: true });
            GameService.getInstance().addPlayer(GameService.getInstance().buildPlayer(socket));
            
            socket.on("message", (data) => {
                console.log("Received message from client:", data);
                if (data.type === "MOVE_FORWARD" || data.type === "ROTATE") {
                    console.log("Processing player action:", data.type);
                    GameService.getInstance().handlePlayerAction(socket, data.type);
                }
            });
    
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }

    public addPlayerToRoom(player : Socket, room: String) {
        player.join(room.toString());
    }

    public sendMessage(room: String |null, type: String, content: any) {
        console.log(`Sending message to room ${room}:`, { type, content });
        if (this.active && this.io != null && room != null) {

            const message = {
                type,
                content 
            };
            console.log("Emitting message to room:", room, message);
            

            this.io.to(room.toString()).emit("message", message);
        } else {
            console.warn("Cannot send message:", {
                active: this.active,
                hasIO: this.io != null,
                room: room
            });
        }
    }

    public gameStartMessage() {
        //
    }

    public isActive() {
        return this.active;
    }

    private doHello(data: String) {
        console.log("Hola");
        console.log(data);
    }

    private doBye(data: String) {
        console.log("Adios");
        console.log(data);
    }
}