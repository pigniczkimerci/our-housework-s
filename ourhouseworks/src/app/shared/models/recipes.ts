import { Ingredients } from "./ingredients";

export interface Recipes {
    description: string,
    ingredients: Array<Ingredients>,
    recPicture: string,
    recipeName: string
}
