import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
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
  cooked(fridge:any){
    this.databaseService.deleteFrigeFromFirestore(fridge)
      .then(() => {
        console.log("Fridge element deleted successfully");
      })
      .catch((error) => {
        console.log("Error deleting fridge element");
      });
  }
}
