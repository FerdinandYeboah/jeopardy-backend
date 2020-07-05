import { UserCreated, RoomCreated, UserJoinedGame, PlayerClickedGameCell, PlayerGaveAnswer, PlayerAnsweredCorrectly, PlayerAnsweredIncorrectly, AllPlayerAnsweredIncorrectly, GameOver } from "../models/Events";
import { dataStore } from "../persistence/Datastore";
import { Game, Player, PlayerReadyStatus } from "../models/Game";
import { User } from "../models/User";
import { sanitizeCircular } from "../utils/SanitizeCircular";
import { Question } from "../models/File";

export class EventHandler {

    private socket: any;
    private io: any;

    constructor(socket: any, io: any){
        console.log("socket in constructor", socket.id)
        this.socket = socket;
        this.io = io;
    }

    // Handler functions
    userCreated(data: UserCreated) {
        console.log("UserCreated server data: ", data)

        //Add the user and their profile info to datastore.
        dataStore.addUser(this.socket.id, data.name);

        this.updateLobbyList();
    }

    roomListRequested() { // - DEPRECATED
        //Get list of rooms
        const games: Game[] = dataStore.games;

        //Optional - Convert to send relevant fields. I.e filter out player scores, file paths etc.


        //Return list of rooms //TODO: CHANGE TO ONLY RETURN RELEVANT INFO - NOT FILE & ANSWERS
        this.socket.emit("roomListResponse", sanitizeCircular(games))
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

        //Create the room (game). Don't auto add player, will be done via a transition to user joined.
        let game: Game = dataStore.addGame(data.roomName, data.fileId);

        /* IMPORTANT NOTE: The players in the game structure can be better.
           The player information in the game should somehow be a REFERENCE to the users store
           That way if a user disconnects, updates their name, they can simply be updated in the users store only and then everything propgoates
           Right now as I have it, data duplication by VALUE, it means if the user disconnects
            I have to remove then from the users store and all the game stores and w/e else they may have been copied in.
          -The "REFERENCE" way doesn't have to be actual memory references could be a method call
            to a service that returns the user, or links the user, then if its null you know they are gone. I suppose the function would be called every time you want a player.
        */

        //Notify list of rooms updated. Emit response with game id so creator can "auto join". Will deprecated roomListResponse //TODO: CHANGE TO ONLY RETURN RELEVANT INFO - NOT FILE & ANSWERS
        const games: Game[] = dataStore.games;
        this.socket.emit("createdRoomResponse", sanitizeCircular(game)); //Only need game id, but returning entire game since used that model in frontend
        this.updateLobbyList();
    }

    userJoinedGame(data: UserJoinedGame, callback: Function){
        console.log("UserJoinedGame server data: ", data)

        //Add player to the game
        let user: User = dataStore.findUserBySocketId(this.socket.id);

        dataStore.addPlayerToGame(data.gameId, user.name, user.id);

        //Execute callback with true if remove successful, false if not. Can I type the callback function? The params and expected response
        callback(true);

        let game: Game = dataStore.findGame(data.gameId);

        //Notify all players in this game. Easiest way - iterate over relevant sockets and emit. Better way - rooms.
        this.socket.join(game.socketRoom, (error: any) => {
            if(error){ 
                console.log("Error joining room: ", error); 
                throw error 
            }
            else {
                //Emit to all sockets in room that user joined. Including the user.
                this.io.in(game.socketRoom).emit('userListUpdated', sanitizeCircular(game.players));
                console.log("Sending players: ", game.players);
                this.updateLobbyList();
            }
        });
    }

    playerReadiedUp(){ //Doesn't take input

        //Find player that readied up
        let player: Player = dataStore.findPlayerBySocketId(this.socket.id);

        console.log("playerReadiedUp: ", player.name)

        //Set their status to ready. Note, if I created readyUp functions then I wouldn't have to import this internal class or know how its implemented
        player.status = PlayerReadyStatus.READY;

        //Update userlist. Ah need the game the user is in. Consider adding a reference to the game from the player.
        /*Can actually also implement user/player source of truth by placing a back reference to user on the player object. 
            When getting the player, check if the user reference is not null then return. Deleting a user would then have to be done by placing its pointer to null. 
            Not just removing from array (the reference will still likely exist)
        */
       let game: Game = player.game;
       this.io.in(game.socketRoom).emit('userListUpdated', sanitizeCircular(game.players));

        //If game ready (players ready and atleast 2 people) - then start game (change game state and emit startGame event) & update lobby list
        if (game.shouldStartGame()){
            game.startGame();
            this.io.in(game.socketRoom).emit('startGame', sanitizeCircular(game.players));

            this.updateLobbyList();
        }
    }

    playerLeftRoom(callback: Function){
        //Find player that left
        let player: Player = dataStore.findPlayerBySocketId(this.socket.id);

        //Remove them
        let game: Game = player.game;
        game.removePlayer(player.id);

        //Execute callback with true if remove successful, false if not. Can I type the callback function? The params and expected response
        callback(true);

        //Leave socket room and notify players in game
        this.socket.leave(game.socketRoom, (error: any) => {
            if(error){ 
                console.log("Error leaving room: ", error); 
                throw error 
            }
            else {
                //Emit to all sockets in room that user left, excluding user? Doesn't matter, they left
                this.io.in(game.socketRoom).emit('userListUpdated', sanitizeCircular(game.players));
                console.log("Sending players: ", game.players);
                this.updateLobbyList();

                //If zero players left, remove room
                if (game.players.length == 0){
                    dataStore.removeGame(game.id);
                    this.updateLobbyList();
                }

                //Optional future: If leaving results in all players being ready and players > 2 start game. 

            }
        })
    }

    currentRoomRequested(callback: Function){
        //Find player
        let player: Player = dataStore.findPlayerBySocketId(this.socket.id);

        //Get game
        let game: Game = player.game;

        //Send back game details via callback. NOTE: (in future exclude answers)
        callback(sanitizeCircular(game));
    }

    playerClickedGameCell(data: PlayerClickedGameCell){

        //Find player
        let player: Player = dataStore.findPlayerBySocketId(this.socket.id);
        console.log("playerClickedGameCell: ", player.name)

        //Find question that was clicked
        let game: Game = player.game;
        let question: Question = game.file.findQuestion(data.category, data.value)

        //If they have control, and question has not been answered yet then emit showing question. Else ignore. Set question to answered when it is actually answered.
        if(player.id === game.controllingPlayerId && !question.hasBeenAnswered){
            //Set current question
            game.currentQuestion = question;

            //Show there is an upcoming question
            this.io.in(game.socketRoom).emit('showUpcomingQuestion', sanitizeCircular(question));
            
            //After 3 seconds, ask the question - Needs to be an arrow function to maintain this in closure (alternatives: reference external function, use IIFE )
            setTimeout(() => {
                this.io.in(game.socketRoom).emit('askQuestion', sanitizeCircular(question));
            }, 3000)
        }
        else {
            console.log(`${player.name} is not board controller or question has been answered`)
        }
    }

    playerGaveAnswer(data: PlayerGaveAnswer){
        /* Refer to 1.0 implementation to quickly understand checks need to be made
            Will have playersAnswered on question object, and answer response will either be
            correct or incorrect*/


        //Find the current question
        let player: Player = dataStore.findPlayerBySocketId(this.socket.id);
        let game: Game = player.game;
        let question: Question = game.currentQuestion;
        let showBoardTimer: NodeJS.Timeout;

        if (question.isQuestionAnswerableByPlayer(player.id)){

            //Answer the question
            let isAnswerCorrect = question.answerQuestion(player.id, data.answer);

            if (isAnswerCorrect){
                //Mark question answered, increase player's score, emit person who got it right and answer, give them control, show game board
                question.hasBeenAnswered = true;
                player.score = player.score + parseInt(question.value); //TODO: update value to number
                game.controllingPlayerId = player.id;

                let correctResponse: PlayerAnsweredCorrectly = {
                    playerId: player.id,
                    playerName: player.name,
                    correctAnswer: data.answer,
                    game: game
                }

                this.io.in(game.socketRoom).emit('playerAnsweredCorrectly', sanitizeCircular(correctResponse));

                //5 second timeout to show game board. Also send new game board data to be shown?
                showBoardTimer = setTimeout(() => {
                    this.io.in(game.socketRoom).emit('showGameBoard', sanitizeCircular(game));
                }, 5000)
            
            }
            else {
                //Emit person who got it wrong, subtract score
                player.score = player.score - parseInt(question.value);

                let incorrectResponse: PlayerAnsweredIncorrectly = {
                    playerId: player.id,
                    playerName: player.name,
                    incorrectAnswer: data.answer,
                    game: game
                }

                this.io.in(game.socketRoom).emit('playerAnsweredIncorrectly', sanitizeCircular(incorrectResponse));

            }

            //If all get wrong, mark has been answered, show correct answer and show game board
            if (question.playersAnswered.length === game.players.length && !question.hasBeenAnswered){
                question.hasBeenAnswered = true;

                let allIncorrectResponse: AllPlayerAnsweredIncorrectly = {
                    correctAnswer: question.correctAnswer,
                    game: game
                }

                this.io.in(game.socketRoom).emit('allPlayersAnsweredIncorrectly', sanitizeCircular(allIncorrectResponse));

                //5 second timeout to show game board. Also send new game board data to be shown?
                showBoardTimer = setTimeout(() => {
                    this.io.in(game.socketRoom).emit('showGameBoard', sanitizeCircular(game));
                }, 5000)
            }

            //TODO: Eventually there should be a 30sec timeout to answer. Maybe not here, probably in the click cell handler, then cleared when all give answer.

            /* TODO: Check if all questions have been answered, and if so determine winner. If tie, then send all highest players tied. Then go back to waiting room?
            Clear the previous timeout set to do something else if necessary */
            let winners: Player[] = game.determineWinners();

            if(winners != null){
                //Reset the game - unready all players, randomize game file, etc.
                game.resetGame();
                clearTimeout(showBoardTimer)

                //Send game over and winners
                let gameOverResponse: GameOver = {
                    winners: winners.map((winner) => {
                        return sanitizeCircular(winner);
                    }),
                    game: sanitizeCircular(game)
                }

                //Emit the game over
                this.io.in(game.socketRoom).emit('gameOver', gameOverResponse)
            }

        }
        else {
            console.log(`${player.name} has already answered or the question has already been answered`)
        }

    }


    //Helper functions
    updateLobbyList(){
        this.io.emit("roomListUpdated", sanitizeCircular(dataStore.games));
    }
    
}


// //Need a way to instantiate socket in handlers, or could make socket a global variable with require?

// export function configureSocket(socket: any) {
//     socket.on("roomListRequested", roomListRequested)
// }

