import { Time } from "@angular/common";
import { Group, Ingredients } from "./ingredients";

export interface Recipes {
    description: string,
    ingredients: Group[],
    recPicture: string,
    recipeName: string,
    temperature: number,
    time: Time
}
