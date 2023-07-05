import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { NavbarService } from 'src/app/shared/services/navbar.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent {
  recipeName!: string;
  description!: string;
  ingredients: { name: string, quantity: number, unit: string }[] = [];
  isContainerVisible: boolean = false;
  recipeSource!: (any)[];
  recipe!: Observable<any[]>;
  constructor(private databaseService: DatabaseService, public nav: NavbarService,private firestore: AngularFirestore, private router: Router) {  }
  ngOnInit(): void {
    this.recipe = this.firestore.collectionGroup('recipe').valueChanges() as Observable<any[]>;
    this.recipe.subscribe((data) => {
      this.recipeSource = data;
      console.log(this.recipeSource)
    });
    setTimeout(() => {
      this.nav.show();
    });
  }
  toggleContainer() {
    this.isContainerVisible = !this.isContainerVisible;
  }
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
  navigateToRecipeDetails(recipeName: string | undefined) {
    if (recipeName !== undefined) {
      this.router.navigate(['/recipe', recipeName]);
    }
  }
}
