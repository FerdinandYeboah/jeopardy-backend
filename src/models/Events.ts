import { Game, Player } from "./Game"

export type UserCreated = {
    name: string
}

export type RoomCreated = {
    roomName: string
    fileId: number
}

export type UserJoinedGame = {
    gameId: number
}

export type PlayerClickedGameCell = {
    category: string
    value: string
}

export type PlayerGaveAnswer = {
    answer: string
}

export type PlayerAnsweredCorrectly = {
    playerId: string,
    playerName: string,
    correctAnswer: string,
    game: Game
}

export type PlayerAnsweredIncorrectly = {
    playerId: string,
    playerName: string,
    incorrectAnswer: string,
    game: Game
}

export type AllPlayerAnsweredIncorrectly = {
    correctAnswer: string,
    game: Game
}

export type GameOver = {
    winners: Player[],
    game: Game
}