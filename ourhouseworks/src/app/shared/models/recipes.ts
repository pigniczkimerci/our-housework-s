import { Group, Ingredients } from "./ingredients";

export interface Recipes {
    description: string,
    groups: Group[],
    recPicture: string,
    recipeName: string,
}
