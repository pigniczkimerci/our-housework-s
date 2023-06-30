import { Tasks } from "./task";

export interface Person {
    matchingPerson: never[];
    personName: string;
    tasks: Tasks[];
    doneTask: Tasks[];
}
