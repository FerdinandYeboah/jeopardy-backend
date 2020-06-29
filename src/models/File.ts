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

    findQuestion(category: string, value: string): Question {
        let question: Question = null;

        /*Return the requested question. Simple search and return for now. TODO
        Could be optimized (i.e indexing, Genesis 400 = 1st row 2nd item) but interface is same*/
        this.questions.forEach(q => {
            if(q.category === category && q.value == value){
                question = q;
            }
        });

        return question;
    }
    
}

class Question {
    category: string;
    value: string;
    question: string;
    answers: Answer;
    correctAnswer: string;
    hasBeenAnswered: Boolean = false;
    playersAnswered: String[] = [];

    constructor(category: string, value: string, question: string, answers: Answer, correctAnswer: string){
        this.category = category;
        this.value = value;
        this.question = question;
        this.answers = answers;
        this.correctAnswer = correctAnswer;
    }

    isQuestionAnswerableByPlayer(playerId: string){
        if (!this.playersAnswered.includes(playerId) && !this.hasBeenAnswered){
            //If the player hasn't answered and if the question hasn't been answered
            return true;
        }
        else {
            return false;
        }
    }

    answerQuestion(playerId: string, answerChoice: string): boolean {
        // Mark the player as answered. Ideally should be a set, no duplicates
        this.playersAnswered.push(playerId);

        // Check if right or wrong
        if (answerChoice === this.correctAnswer){
            return true;
        }
        else {
            return false;
        }
    }
}

interface Answer {
    // This is syntax for when definining a hashmap type.
    [key: string] : string;
}

export {File, Question, Answer}