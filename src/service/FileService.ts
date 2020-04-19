import fs from "fs" // import { readFileSync } from "fs";
import { File, Question, Answer } from "../models/File";

class FileService {

    files: File[] = this.loadFiles();

    getFiles(){
        return this.files;
    }

    addFile(){//Add or upload file
        //Read in binary bytes array

        //Validate the file is valid format. csv. Convert file, i.e to json, if needed

        //Write file to filesystem, or some peristent storage like github or s3.
    }

    private loadFiles(): File[] {
        let files: File[] = []

        //Read files from local filesystem - Could be s3 or some other storage in future.
        let filenames: string[] = fs.readdirSync(`${__dirname}/../../assets/game-files/`);

        //Parse the files and return as a File[]
        filenames.forEach(filename => {
            let filepath: string = `${__dirname}/../../assets/game-files/${filename}`

            let fileBuffer: Buffer = fs.readFileSync(filepath); //If pass "utf-8" then returns as string

            let json = JSON.parse(fileBuffer.toString());

            //Populate File object and append 
            let file: File = new File(filename);
            file.addQuestions(this.parseJSONGameFileQuestions(json))

            files.push(file);
        });

        //Return list of files
        return files;
    }

    private parseJSONGameFileQuestions(json: any): Question[] {

        let questions: Question[] = [];

        //Loop through json category keys and add questions
        for (const category in json) {
            if (json.hasOwnProperty(category)) {
                const categoryQuestions: [] = json[category];

                //Parse questions
                categoryQuestions.forEach(qjson => {
                    //TODO: Construct an answer object and set it so can get code and type completion. 

                    let question: Question = new Question(category, qjson["value"], qjson["question"], qjson["answers"], qjson["correctAnswer"]);
                    questions.push(question)
                });
            }
        }

        return questions;
    }

}

//Global file service.
//Alternately, could create a constructor configures dependencies (constructor injection).
let fileService = new FileService();

export {fileService}