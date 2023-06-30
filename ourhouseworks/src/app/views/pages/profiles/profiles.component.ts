import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, combineLatest, concat, map, merge, take } from 'rxjs';
import { Person } from 'src/app/shared/models/person';
import { Tasks } from 'src/app/shared/models/task';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss']
})
export class ProfilesComponent {
  personName!: string;
  people!: Observable<(Person)[]>;
  peopleSource!: (Person)[];
  constructor(private firestore: AngularFirestore, private auth: AngularFireAuth) { }

  ngOnInit(): void {
    const peopleObservable = this.firestore.collectionGroup('people').valueChanges() as Observable<Person[]>;
    const tasksObservable = this.firestore.collectionGroup('task').valueChanges() as Observable<Task[]>;
    const combinedObservable = combineLatest([
      peopleObservable,
      tasksObservable
    ]).pipe(
      map(([people, tasks]) => {
        people.forEach(person => {
          //@ts-ignore
          const matchingTasks: Tasks[] = tasks.filter(task => task.resperson === person.personName);
          person.tasks = matchingTasks;
        });
        this.peopleSource = people;
      })
    );
    combinedObservable.subscribe();
  }
  createPerson() {
    this.auth.currentUser.then((user) => {
      if (user && this.personName) {
        const task = { personName: this.personName };
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
                .collection('people')
                .add(task)
                .then(() => {
                  console.log('Person added successfully to Firestore.');
                })
                .catch((error) => {
                  console.error('Error adding person to Firestore: ', error);
                });
            } else {
              console.log('House not found for the user.');
            }
          })
          .catch((error) => {
            console.error('Error retrieving person from Firestore: ', error);
          });
      }
    });
  }
  deletePerson(person: Person) {
    this.auth.currentUser.then((user) => {
      if (user && person.personName) {
        const houseCollectionRef = this.firestore.collection('house');
        const query = houseCollectionRef.ref.where('email', '==', user.email);

        query.get().then((querySnapshot) => {
          if (!querySnapshot.empty) {
            const houseId = querySnapshot.docs[0].id;
            const peopleCollectionRef = houseCollectionRef.doc(houseId).collection('people');
            const personQuery = peopleCollectionRef.ref.where('personName', '==', person.personName);

            personQuery.get().then((personQuerySnapshot) => {
              if (!personQuerySnapshot.empty) {
                const personDocId = personQuerySnapshot.docs[0].id;
                const personDocRef = peopleCollectionRef.doc(personDocId);

                personDocRef.delete().then(() => {
                  console.log('Person deleted successfully from Firestore.');
                }).catch((error) => {
                  console.error('Error deleting person from Firestore: ', error);
                });
              } else {
                console.log('Person not found in Firestore.');
              }
            }).catch((error) => {
              console.error('Error retrieving person from Firestore: ', error);
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
  convertTimestampToDate(timestamp: any): Date | null {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate();
    }
    return null;
  }
  doneTask(task:Tasks){
    //TODO
  }
}
