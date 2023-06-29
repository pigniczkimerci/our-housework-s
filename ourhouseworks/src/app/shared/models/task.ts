import { Person } from "./person";

export interface Tasks {
    id: string;
    isEditing: boolean;
    date: Date;
    name: string;
    resperson: Person;
}
