import { Component } from '@angular/core';
import { DatabaseService } from 'src/app/shared/services/database.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent {
  recipeName!: string;
  constructor(private databaseService: DatabaseService) {  }
  createRecipe() {
    if (this.recipeName) {
      this.databaseService.addRecipeToFirestore(this.recipeName)
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

}
