import { File, Question } from "./File";
import { fileService } from "../service/FileService";

// Game Model - Matches with RoomBackendModel on frontend - Basically Rooms are called Games on the backend.
class Game {
    id: number; //Keep a static variable that is already incremented?
    socketRoom: string; //socket io room
    name: string | undefined;
    topic: string | undefined;
    file: File;
    currentQuestion: Question;
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

    resetGame(){
        //Reset the game - back to lobby, randomize file (or same file), reset players, etc
        this.state = State.LOBBY;
        this.file = fileService.getRandomFile(); //for same file - fileService.getFileById(this.file.id);
        this.resetAllPlayers();
    }

    resetAllPlayers() {
        //Unready, set score to 0
        this.players.forEach((player) => {
            player.score = 0;
            player.status = PlayerReadyStatus.WAITING;
        })
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

    areAllQuestionsAnswered(): Boolean {
        let areAllQuestionsAnswered: Boolean = true;

        this.file.questions.forEach((question: Question) => {
            if (!question.hasBeenAnswered){
                areAllQuestionsAnswered = false;
            }
        })

        return areAllQuestionsAnswered; 
    }

    determineWinners(): Player[] | null {
        //Determine the winner, or winners if there is a tie
        let winners: Player[] = []
        let currentHighestScore = Number.MIN_SAFE_INTEGER

        //If game hasn't ended return null
        if (!this.areAllQuestionsAnswered()){
            //throw exception, or could return null, or empty list
            return null;
        }

        //Determine the list of winners
        this.players.forEach((player: Player) => {
            if (player.score > currentHighestScore){
                //Clear out winners array with new player
                winners = [player]
                currentHighestScore = player.score;
            }
            else if (player.score === currentHighestScore){
                //Add to winners array since currently a tie
                winners.push(player)
            }
        })

        return winners
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