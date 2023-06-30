import { Person } from "./person";

export interface Tasks {
    id: string;
    isEditing: boolean;
    date: Date;
    taskName: string;
    resperson: Person;
}