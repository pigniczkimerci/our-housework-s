import { Time } from "@angular/common";
import { Ingredients } from "./ingredients";
import { IGroup } from "./i-group";

export interface Recipes {
    description: string,
    ingredients: IGroup[],
    recPicture: string,
    recipeName: string,
    temperature: number,
    time: Time
}
