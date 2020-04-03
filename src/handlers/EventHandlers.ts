import { UserCreated } from "../models/Events";
import { dataStore } from "../persistence/Datastore";
import { Game } from "../models/Game";

export class EventHandler {

    private socket: any;

    constructor(socket: any){
        console.log("socket in constructor", socket.id)
        this.socket = socket;
    }

    // Handler functions
    userCreated(data: UserCreated) {
        console.log("UserCreated server data: ", data)

        //Add the user. I don't think I have to add them to anything until they join a room.
    }

    roomListRequested() {
        //Get list of rooms
        const games: Game[] = dataStore.games;

        //Optional - Convert to send relevant fields. I.e filter out player scores, file paths etc.


        //Return list of rooms
        this.socket.emit("roomListResponse", games)
    }
}


// //Need a way to instantiate socket in handlers, or could make socket a global variable with require?

// export function configureSocket(socket: any) {
//     socket.on("roomListRequested", roomListRequested)
// }

