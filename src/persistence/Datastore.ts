// Data layer
import { Game, Player } from "../models/Game";

class DataStore {
    // In memory datastore
    readonly games: Game[] = []

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
const game = new Game("EveryoneWelcome", "Genesis", "samples/Genesis.csv");

dataStore.addGame(game)
dataStore.addPlayerToGame(game.id, new Player("Ferdinand", 0))

export {dataStore}


//Usage. import { dataStore } from '/persistence/Datastore'. datastore.addNewGame(), datastore.addNewPlayer(game, player), dataStore.startGame()