import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, first } from 'rxjs';
import { NavbarService } from 'src/app/shared/services/navbar.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  taskName!: string;
  //TODO any
  tasks: Observable<any[]> | undefined;
  date: any;
  responsibleMembers!: Observable<any[]>;
  constructor( private firestore: AngularFirestore, private auth: AngularFireAuth, public nav: NavbarService) {  }
  
  ngOnInit(): void {
    this.tasks = this.firestore.collectionGroup('task').valueChanges();
    this.responsibleMembers = this.firestore.collection('people').valueChanges();
    this.nav.show();
  }

  createTask() {
    this.auth.currentUser.then((user) => {
      if (user && this.taskName) {
        const task = {name: this.taskName};
        this.firestore
          .collection('house', (ref) => ref.where('email', '==', user.email))
          .get()
          .toPromise()
          .then((querySnapshot) => {
            if (!querySnapshot!.empty) {
              const houseId = querySnapshot!.docs[0].id;
              this.firestore
                .collection('house')
                .doc(houseId)
                .collection('task')
                .add(task)
                .then(() => {
                  console.log('Task added successfully to Firestore.');
                })
                .catch((error) => {
                  console.error('Error adding task to Firestore: ', error);
                });
            } else {
              console.log('House not found for the user.');
            }
          })
          .catch((error) => {
            console.error('Error retrieving house from Firestore: ', error);
          });
      }
    });
  }
}
