import { Tasks } from "./task";

export interface Person {
    matchingPerson: never[];
    personName: string;
    personEmail: string;
    tasks: Tasks[];
    doneTask: Tasks[];
}
