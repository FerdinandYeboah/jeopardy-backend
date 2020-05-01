import { UserCreated, RoomCreated } from "../models/Events";
import { dataStore } from "../persistence/Datastore";
import { Game, Player } from "../models/Game";
import { User } from "../models/User";

export class EventHandler {

    private socket: any;

    constructor(socket: any){
        console.log("socket in constructor", socket.id)
        this.socket = socket;
    }

    // Handler functions
    userCreated(data: UserCreated) {
        console.log("UserCreated server data: ", data)

        //Add the user and their profile info to datastore.
        dataStore.addUser(this.socket.id, data.name);
    }

    roomListRequested() {
        //Get list of rooms
        const games: Game[] = dataStore.games;

        //Optional - Convert to send relevant fields. I.e filter out player scores, file paths etc.


        //Return list of rooms //TODO: CHANGE TO ONLY RETURN RELEVANT INFO - NOT FILE & ANSWERS
        this.socket.emit("roomListResponse", games)
    }

    roomCreated(data: RoomCreated) {
        console.log("RoomCreated server data: ", data)
        /* Hmmm, this is a bit tricky. Seems I need an independent users[] in the datastore
           I logically should get the user profile (like name) from the users[] once I get the socket id passed in.
           This would mean I would need to store the users independently from the game.
           The issue I had was data duplication/keeping data in sync.
           Ex: How do you answer the questions
           -Is the user in a game? - If do not store status on user then have to query all games to answer. If do store status on user, than have data on user that always have to update/keep in sync - ugh.. I like the query better though
           
           I suppose the answer to the above question would be to keep a separate derived view that calculates that query
           -Few patterns of this are: DB Indexes, Kafka streaming to update view,
           
           I could see
            -a separate thread doing the query update, for an eventual eventual consistency.
            -transactional updates and rollbacks for all dependent data. i.e atomic. First option definitely better though.

           Verdict:
           - I don't have the luxury or skills for a "background" threaded approach.
           - Will be settling for generating derived view by querying relevant source of truth, even if inefficent.
           - Meaning the answer to the question is, query all the games and return if the user is in or not. 
        */

        //Create the room (game)
        let game: Game = dataStore.addGame(data.roomName, data.fileId);

        //Add the first player. Get from socket
        let user: User = dataStore.findUserBySocketId(this.socket.id);

        /* IMPORTANT NOTE: The players in the game structure can be better.
           The player information in the game should somehow be a REFERENCE to the users store
           That way if a user disconnects, updates their name, they can simply be updated in the users store only and then everything propgoates
           Right now as I have it, data duplication by VALUE, it means if the user disconnects
            I have to remove then from the users store and all the game stores and w/e else they may have been copied in.
          -The "REFERENCE" way doesn't have to be actual memory references could be a method call
            to a service that returns the user, or links the user, then if its null you know they are gone. I suppose the function would be called every time you want a player.
        */
        dataStore.addPlayerToGame(game.id, new Player(user.name, user.id, 0));

        //Notify list of rooms updated. emit roomListUpdated. Will deprecated roomListResponse //TODO: CHANGE TO ONLY RETURN RELEVANT INFO - NOT FILE & ANSWERS
        const games: Game[] = dataStore.games;
        this.socket.emit("roomListResponse", games);
    }
}


// //Need a way to instantiate socket in handlers, or could make socket a global variable with require?

// export function configureSocket(socket: any) {
//     socket.on("roomListRequested", roomListRequested)
// }

