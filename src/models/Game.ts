// Game Model Models
class Game {
    file: string | undefined;
    players: Player[] | undefined;
    state: State | undefined;

    constructor(){
        
    }
    
    

}

interface Player {
    name: string,
    score: number
}

enum State {
    LOBBY,
    GAME
}


export {Game, Player, State}