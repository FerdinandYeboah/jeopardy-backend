import { File } from "./File";

// Game Model - Matches with RoomBackendModel on frontend - Basically Rooms are called Games on the backend.
class Game {
    id: number; //Keep a static variable that is already incremented?
    socketRoom: string; //socket io room
    name: string | undefined;
    topic: string | undefined;
    file: File;
    controllingPlayerId: string;
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

    removePlayer(playerId: String){
        //Use filter (keep) to return new array
        this.players = this.players.filter(function(player){
            return player.id != playerId;
        })
    }

    startGame(){
        //Start game and give first (or random) player control
        this.state = State.GAME;
        this.controllingPlayerId = this.players[0].id;
    }

    shouldStartGame(): Boolean {
        //If all players ready and atleast 2 players in game
        if (this.players.length >= 2 && this.areAllPlayersReady()){
            return true;
        }
        else {
            return false;
        }
    }

    areAllPlayersReady(): Boolean {
        let arePlayersReady: Boolean = true;

        this.players.forEach(player => {
            if(player.status == PlayerReadyStatus.WAITING){
                arePlayersReady = false;
            }
        });

        return arePlayersReady;
    }
    
}

class Player {
    name: string;
    id: string;
    score: number;
    game: Game;
    status: PlayerReadyStatus = PlayerReadyStatus.WAITING;

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