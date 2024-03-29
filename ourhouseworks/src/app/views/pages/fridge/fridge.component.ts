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
  fridge!: Observable<Fridge[]>;
  fridgeSource!: Fridge[];
  isContainerVisible: boolean = false;
  name!: string;
  quantity!: number;
  unit!: string;
  constructor(private databaseService: DatabaseService, public nav: NavbarService,private firestore: AngularFirestore) {  }
  
  ngOnInit(): void {
    this.fridge = this.firestore.collectionGroup('fridge').valueChanges() as Observable<Fridge[]>;
    this.fridge.subscribe((data) => {
      this.fridgeSource = data;
    });
    setTimeout(() => {
      this.nav.show();
    });
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
  toggleContainer() {
    this.isContainerVisible = !this.isContainerVisible;
  }
  addIngredient(name:string, quantity:number, unit: string){
    const rName = "General";
    const ingredient = {name, quantity, unit};
    const group = { name: "general", ingredient: [ingredient] };
    console.log(rName);
    this.databaseService.addFridgeToFirestore(rName, [group] )
        .then(() => {
          console.log('Recipe added successfully to Firestore.');
        })
        .catch((error: any) => {
          console.error('Error adding recipe to Firestore: ', error);
        });
    } 
}
