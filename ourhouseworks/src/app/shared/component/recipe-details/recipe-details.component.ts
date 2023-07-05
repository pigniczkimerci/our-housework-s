import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { NavbarService } from '../../services/navbar.service';

@Component({
  selector: 'app-recipe-details',
  templateUrl: './recipe-details.component.html',
  styleUrls: ['./recipe-details.component.scss']
})
export class RecipeDetailsComponent {
  recipeName!: string;
  recipe!: Observable<any>;
  recipeSource!: any[];
  
  constructor(private route: ActivatedRoute,private firestore: AngularFirestore, public nav: NavbarService) { }
  
  ngOnInit(): void {
    const recipeNameParam = this.route.snapshot.paramMap.get('name');
    if (recipeNameParam) {
      this.recipeName = recipeNameParam;
      this.recipe = this.firestore.collectionGroup('recipe', ref => ref.where('recipeName', '==', this.recipeName)).valueChanges();
      this.recipe.subscribe((values) => {
        this.recipeSource = values;
      });
    } else {
      console.log('Recipe name parameter is missing.');
    }
    setTimeout(() => {
      this.nav.show();
    });
  }
}
