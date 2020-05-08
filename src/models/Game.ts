import { File } from "./File";

// Game Model - Matches with RoomBackendModel on frontend - Basically Rooms are called Games on the backend.
class Game {
    id: number; //Keep a static variable that is already incremented?
    socketRoom: string; //socket io room
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
        this.socketRoom = this.id.toString();

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
    game: Game;
    status: PlayerReadyStatus = PlayerReadyStatus.WAITING

    constructor(name: string, id: any, score: number, game: Game){
        this.name = name;
        this.id = id;
        this.score = score;
        this.game = game;
    }
}

enum State {
    LOBBY,
    GAME
}

enum PlayerReadyStatus {
    READY,
    WAITING
}

export {Game, Player, PlayerReadyStatus, State}