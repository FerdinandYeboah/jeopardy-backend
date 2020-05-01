// Data layer
import { Game, Player, State } from "../models/Game";
import { File } from "../models/File";
import { fileService } from "../service/FileService";
import { User } from "../models/User";

class DataStore {
    // In memory datastore
    readonly games: Game[] = []
    readonly users: User[] = []

    files: File[] = fileService.getFiles();

    addGame(name: string, fileId: number): Game {
        //Get the relevant file
        let file: File = fileService.getFileById(fileId);
        let filename: string = file.name.split(".")[0];

        //Add the game
        let game: Game = new Game(name, filename, file);
        this.games.push(game);

        //Return for use
        return game;
    }

    // addGame(game: Game){
    //     this.games.push(game);
    // }


    // Exposed function operations
    // addNewGame, addNewPlayer, startGame
    addPlayerToGame(gameId: number, player: Player){
        let foundGame = false;
        
        //Get the game from id
        for (let game of this.games){
            if (game.id === gameId){
                game.addPlayer(player);
                foundGame = true;
            }
        }

        // If foundGame is false, throw error

    }

    startGame(gameId: number){
        let foundGame = false;
        
        //Get the game from id
        for (let game of this.games){
            if (game.id === gameId){
                game.state = State.GAME;
                foundGame = true;
            }
        }

        // If foundGame is false, throw error

    }

    addUser(socket: any, name: string){
        this.users.push(new User(socket, name));
    }

    findUserBySocketId(socketId: string): User {
        //This could be extracted into a userService?

        let foundUser: User = null;
        
        //Get the game from id
        for (let user of this.users){
            if (user.id === socketId){
                foundUser = user;
            }
        }

        if (foundUser !== null){
            return foundUser;
        }
        else {
            //Throw error? I guess since I disabled strictNullChecks its not warning me the possiblity of returning null right now
        }

    }

}

// Global datastore variable
const dataStore = new DataStore();

// Add some initial games to test?
dataStore.addGame("EveryoneWelcome", 3);
dataStore.addGame("Pros Only", 1);
dataStore.startGame(2);

dataStore.addPlayerToGame(1, new Player("Ferdinand", "fake_socket_id", 0))
dataStore.addPlayerToGame(2, new Player("Baller", "socket_id" , 0))
dataStore.addPlayerToGame(2, new Player("Bucket", "wss_id", 0))


export {dataStore}


//Usage. import { dataStore } from '/persistence/Datastore'. datastore.addNewGame(), datastore.addNewPlayer(game, player), dataStore.startGame()