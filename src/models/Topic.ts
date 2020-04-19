import { File } from "./File";

//Model used for the retrieve call for topics on the create room
interface Topic {
    topic: string | undefined,
    filename: string | undefined,
    fileId: number
}

function convertFileToTopic(file: File): Topic {
    let topic: Topic = {
        topic: file.name != null ? file.name.split(".")[0] : file.name, //Topic = filename without extension
        filename: file.name,
        fileId: file.id
    }

    return topic;
}

function convertFileListToTopicList(files: File[]): Topic[] {
    let topics: Topic[] = [];

    files.forEach(file => {
        topics.push(convertFileToTopic(file));
    });

    return topics;
}

export {Topic, convertFileListToTopicList}