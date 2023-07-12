import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Fridge } from 'src/app/shared/models/fridge';
import { Ingredients } from 'src/app/shared/models/ingredients';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { NavbarService } from 'src/app/shared/services/navbar.service';

@Component({
  selector: 'app-fridge',
  templateUrl: './fridge.component.html',
  styleUrls: ['./fridge.component.scss']
})
export class FridgeComponent {
  fridge!: Observable<any[]>;
  fridgeSource!: any[];
  constructor(private databaseService: DatabaseService, public nav: NavbarService,private firestore: AngularFirestore) {  }
  
  ngOnInit(): void {
    this.fridge = this.firestore.collectionGroup('fridge').valueChanges() as Observable<any[]>;
    this.fridge.subscribe((data) => {
      this.fridgeSource = data;
    });
    setTimeout(() => {
      this.nav.show();
    });
  }
  fridgeToJSON() {
    const fridgeData = this.fridgeSource.map(fridge => {
      return {
        recipeName: fridge.recipeName,
        ingredients: fridge.ingredients.map((ingredient: { name: any; quantity: any; unit: any; }) => {
          return {
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit
          };
        })
      };
    });
  
    const jsonData = JSON.stringify(fridgeData, null, 2);
    console.log(jsonData); // Log the JSON data for testing purposes
  
    // Optionally, you can save the JSON data to a file or perform any other desired actions
  }
  
  cooked(fridge:Fridge){
    this.databaseService.deleteFrigeFromFirestore(fridge)
      .then(() => {
        console.log("Fridge element deleted successfully");
      })
      .catch((error) => {
        console.log("Error deleting fridge element");
      });
  }
  alreadyInFridge(ing:Ingredients){
    console.log(ing)
    this.databaseService.deleteIngredientsFromFridge(ing)
  
      .then(() => {
        console.log("Fridge element deleted successfully");
      })
      .catch((error) => {
        console.log("Error deleting fridge element");
      });
  }
}
