class User {
    id: any; //Will be socket id
    name: string;

    constructor(id: any, name: string){
        this.id = id;
        this.name = name;
    }
}

export { User }