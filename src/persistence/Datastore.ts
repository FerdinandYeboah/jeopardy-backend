// Data layer
import { Game, Player, State } from "../models/Game";
import { File } from "../models/File";
import { fileService } from "../service/FileService";

class DataStore {
    // In memory datastore
    readonly games: Game[] = []

    files: File[] = fileService.getFiles();

    addGame(game: Game){
        this.games.push(game);
    }


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

}

// Global datastore variable
const dataStore = new DataStore();

// Add some initial games to test?
const game1 = new Game("EveryoneWelcome", "Genesis", "samples/Genesis.csv");
const game2 = new Game("Pros Only", "B-Ball Trick Plays", "samples/bball.csv");
game2.state = State.GAME


dataStore.addGame(game1)
dataStore.addGame(game2)

dataStore.addPlayerToGame(game1.id, new Player("Ferdinand", 0))
dataStore.addPlayerToGame(game2.id, new Player("Baller", 0))
dataStore.addPlayerToGame(game2.id, new Player("Bucket", 0))


export {dataStore}


//Usage. import { dataStore } from '/persistence/Datastore'. datastore.addNewGame(), datastore.addNewPlayer(game, player), dataStore.startGame()