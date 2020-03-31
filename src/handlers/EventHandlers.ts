// Import models
import { UserCreated } from "../models/Events";

// Import datastore

// Handler functions
export function userCreated(data: UserCreated){
    console.log("UserCreated server data: ", data)

    //Add the user. I don't think I have to add them to anything until they join a room.
}

