// Data layer
import { Game } from "../models/Game";

class DataStore {
    // In memory datastore
    private games: Game[] = []

    // Exposed function operations
    // addNewGame, addNewPlayer, startGame
}

// Global datastore variable
const dataStore = new DataStore();

export {dataStore}


//Usage. import { dataStore } from '/persistence/Datastore'. datastore.addNewGame(), datastore.addNewPlayer(game, player), dataStore.startGame()