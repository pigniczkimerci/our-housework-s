import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, first } from 'rxjs';
import { NavbarService } from 'src/app/shared/services/navbar.service';
import { DatePipe } from '@angular/common';
import { Person } from 'src/app/shared/models/person';
import { Tasks } from 'src/app/shared/models/task';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  providers: [DatePipe]
})
export class MainComponent implements OnInit {
  taskName!: string;
  tasks: Observable<Tasks[]> | undefined;
  date: Date | undefined;
  responsibleMembers!: Observable<Person[]>;
  selectedMember!: Person;
  
  allFieldsFilled: boolean = false;

  tableDataSource!: Tasks[];
  constructor( private firestore: AngularFirestore, private auth: AngularFireAuth, public nav: NavbarService, private datePipe: DatePipe) {  }
  
  ngOnInit(): void {
    this.tasks = this.firestore.collectionGroup('task').valueChanges() as Observable<Tasks[]>;
    this.tasks.subscribe((data) => {
      this.tableDataSource = data;
    });
    this.responsibleMembers = this.firestore.collectionGroup('people').valueChanges() as Observable<Person[]>;
    this.nav.show();
  }

  createTask() {
    this.auth.currentUser.then((user) => {
      if (user && this.taskName) {
        const task = {name: this.taskName, date: this.date, resperson: this.selectedMember };
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
  checkFieldsFilled() {
    this.allFieldsFilled = !!this.taskName && !!this.date && !!this.selectedMember;
  }
  deleteTask(task: Tasks) {
    console.log(task);
    this.auth.currentUser.then((user) => {
      if (user && task.name) {
        const houseCollectionRef = this.firestore.collection('house');
        const query = houseCollectionRef.ref.where('email', '==', user.email);
        query.get().then((querySnapshot) => {
          if (!querySnapshot.empty) {
            const houseId = querySnapshot.docs[0].id;
            const peopleCollectionRef = houseCollectionRef.doc(houseId).collection('task');
            const personQuery = peopleCollectionRef.ref.where('name', '==', task.name);
            
            personQuery.get().then((personQuerySnapshot) => {
              if (!personQuerySnapshot.empty) {
                const personDocId = personQuerySnapshot.docs[0].id;
                const personDocRef = peopleCollectionRef.doc(personDocId);
                
                personDocRef.delete().then(() => {
                  console.log('Task deleted successfully from Firestore.');
                }).catch((error) => {
                  console.error('Error deleting task from Firestore: ', error);
                });
              } else {
                console.log('Task not found in Firestore.');
              }
            }).catch((error) => {
              console.error('Error retrieving task from Firestore: ', error);
            });
          } else {
            console.log('House not found for the user.');
          }
        }).catch((error) => {
          console.error('Error retrieving house from Firestore: ', error);
        });
      }
    });
  }
}
