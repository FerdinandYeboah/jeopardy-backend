// Game Model - Matches with RoomBackendModel on frontend
class File {
    id: number; //Keep a static variable that is already incremented?
    name: string | undefined;
    questions: Question[] = [];

    public static FILE_ID: number = 1;

    constructor(name: string){
        this.name = name;
        this.id = File.FILE_ID;

        File.FILE_ID++;
    }

    addQuestions(questions: Question[]){
        this.questions = this.questions.concat(questions);
    }
    
}

class Question {
    category: string;
    value: string;
    question: string;
    answers: Answer;
    correctAnswer: string;

    constructor(category: string, value: string, question: string, answers: Answer, correctAnswer: string){
        this.category = category;
        this.value = value;
        this.question = question;
        this.answers = answers;
        this.correctAnswer = correctAnswer;
    }
}

interface Answer {
    // This is syntax for when definining a hashmap type.
    [key: string] : string;
}

export {File, Question, Answer}