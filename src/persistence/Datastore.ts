// Data layer
import { Game, Player, State, PlayerReadyStatus } from "../models/Game";
import { File } from "../models/File";
import { fileService } from "../service/FileService";
import { User } from "../models/User";

class DataStore {
    // In memory datastore
    games: Game[] = []
    users: User[] = []

    files: File[] = fileService.getFiles();

    findGame(gameId: number): Game {
        for (let game of this.games){
            if (game.id === gameId){
                return game;
            }
        }

        //If game not found throw error, or configure typing to force null is a possible return type and its handling...
    }

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

    removeGame(gameId: number){
        //Filter (keep) games
        this.games = this.games.filter((game) => {
            return gameId != game.id;
        })
    }


    // Exposed function operations
    // addNewGame, addNewPlayer, startGame
    addPlayerToGame(gameId: number, name: string, id: string){
        let player: Player = new Player(name, id, 0, this.findGame(gameId));

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

    findPlayerBySocketId(socketId: string): Player {
        //Search through all games and its players
        let foundPlayer: Player = null;
        
        for (let game of this.games){
            for (let player of game.players){
                if (player.id === socketId){
                    foundPlayer = player;
                }
            }
        }

        if (foundPlayer !== null){
            return foundPlayer;
        }
        else {
            //Throw error? I guess since I disabled strictNullChecks its not warning me the possiblity of returning null right now
        }
    }

}

// Global datastore variable
const dataStore = new DataStore();

// Add some initial games to test?
let game1 = dataStore.addGame("EveryoneWelcome", 3);
let game2 = dataStore.addGame("Pros Only", 1);
dataStore.startGame(game2.id);


dataStore.addPlayerToGame(game1.id, "Ferdinand", "fake_socket_id")
dataStore.addPlayerToGame(game2.id, "Baller", "socket_id")
dataStore.addPlayerToGame(game2.id, "Bucket", "wss_id")


export {dataStore}


//Usage. import { dataStore } from '/persistence/Datastore'. datastore.addNewGame(), datastore.addNewPlayer(game, player), dataStore.startGame()