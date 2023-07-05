import { Component } from '@angular/core';
import { DatabaseService } from 'src/app/shared/services/database.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent {
  recipeName!: string;
  description!: string;
  ingredients: { name: string, quantity: number, unit: string }[] = [];

  constructor(private databaseService: DatabaseService) {  }
  createRecipe() {
    if (this.recipeName, this.description, this.ingredients) {
      this.databaseService.addRecipeToFirestore(this.recipeName, this.description, this.ingredients)
        .then(() => {
          console.log('Recipe added successfully to Firestore.');
        })
        .catch((error: any) => {
          console.error('Error adding recipe to Firestore: ', error);
        });
    } else {
      console.error('Invalid recipe details.');
    }
  }
  addIngredient() {
    this.ingredients.push({ name: '', quantity: 0, unit: '' });
  }
}
