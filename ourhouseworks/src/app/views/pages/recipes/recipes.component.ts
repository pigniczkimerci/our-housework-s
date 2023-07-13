import { Time } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IGroup } from 'src/app/shared/models/i-group';
import { Ingredients } from 'src/app/shared/models/ingredients';
import { Recipes } from 'src/app/shared/models/recipes';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { NavbarService } from 'src/app/shared/services/navbar.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent {
  recipeName!: string;
  recipePicture!: string;
  description!: string;
  ingredients: { name: string, quantity: number, unit: string }[] = [];
  isContainerVisible: boolean = false;
  recipeSource!: (Recipes)[];
  recipe!: Observable<Recipes[]>;
  @ViewChild('fileInput') fileInput!: ElementRef;
  groupName!: string;
  temperature!: number;
  time!: Time;
  cookingTimeControl = new FormControl();
  ingredientGroups: { name: string; ingredient: Ingredients[] }[] = []; // Array to store ingredient groups

  constructor(private databaseService: DatabaseService, public nav: NavbarService, private firestore: AngularFirestore, private router: Router) { }
  ngOnInit(): void {
    this.recipe = this.firestore.collectionGroup('recipe').valueChanges() as Observable<Recipes[]>;
    this.recipe.subscribe((data) => {
      this.recipeSource = data;
    });
    setTimeout(() => {
      this.nav.show();
    });
  }
  toggleContainer() {
    this.isContainerVisible = !this.isContainerVisible;
  }
  async uploadAndSaveImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async (event) => {
        const result = event.target!.result as string;
        const base64String = result.split(',')[1];
        try {
          this.recipePicture = base64String;
          console.log('Image stored successfully in Firestore.');
        } catch (error) {
          console.error('Error storing image in Firestore:', error);
        }
      };
    }
  }


  /*addIngredient() {
    this.ingredients.push({ name: '', quantity: 0, unit: '' });
  }*/
  navigateToRecipeDetails(recipeName: string | undefined) {
    if (recipeName !== undefined) {
      this.router.navigate(['/recipe', recipeName]);
    }
  }
  deleteRecipe(recipe: Recipes) {
    this.databaseService.deleteRecipeFromFirestore(recipe)
      .then(() => {
        console.log("Person deleted successfully");
      })
      .catch(() => {
        console.log("Error deleting person");
      });
  }
  addGroup() {
    if (this.groupName) {
      this.ingredientGroups.push({ name: this.groupName, ingredient: [] });
      this.groupName = ''; // Reset input value
    }
  }
  addIngredient(group: IGroup) {
    group.ingredient.push({ name: '', quantity: 0, unit: '' });
  }
  createRecipe() {
    if (this.recipeName, this.recipePicture, this.description, this.ingredients, this.temperature, this.time) {
      this.databaseService.addRecipeToFirestore(this.recipeName, this.recipePicture, this.description, this.ingredientGroups,this.temperature, this.time)
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
