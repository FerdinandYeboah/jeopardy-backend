import { File } from "./File";

// Game Model - Matches with RoomBackendModel on frontend
class Game {
    id: number; //Keep a static variable that is already incremented?
    name: string | undefined;
    topic: string | undefined;
    file: File;
    players: Player[] = [];
    state: State = State.LOBBY;

    public static GAME_ID: number = 1;

    constructor(name: string, topic: string, file: File){
        this.name = name;
        this.topic = topic;
        this.file = file;
        this.id = Game.GAME_ID;

        //Increment static game id counter
        Game.GAME_ID++;
    }

    addPlayer(player: Player){
        //Add the player
        this.players.push(player)
    }
    
}

class Player {
    name: string;
    id: string;
    score: number;

    constructor(name: string, id: any, score: number){
        this.name = name;
        this.id = id;
        this.score = score;
    }
}

enum State {
    LOBBY,
    GAME
}


export {Game, Player, State}