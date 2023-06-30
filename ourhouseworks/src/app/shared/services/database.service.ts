import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { Person } from '../models/person';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Tasks } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private firestore: AngularFirestore,private auth: AngularFireAuth) { }
//CREATE
  addTaskToFirestore(taskName: string, date: any, selectedMember: Person): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.auth.currentUser.then((user) => {
        if (user && taskName) {
          const task = { taskName: taskName, date: date, resperson: selectedMember };
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
                    resolve();
                  })
                  .catch((error) => {
                    console.error('Error adding task to Firestore: ', error);
                    reject(error);
                  });
              } else {
                console.log('House not found for the user.');
                reject('House not found for the user.');
              }
            })
            .catch((error) => {
              console.error('Error retrieving house from Firestore: ', error);
              reject(error);
            });
        }
      });
    });
  }

  addPersonToFirestore(personName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.auth.currentUser.then((user) => {
        if (user && personName) {
          const person = { personName: personName };
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
                  .add(person)
                  .then(() => {
                    console.log('Person added successfully to Firestore.');
                    resolve();
                  })
                  .catch((error) => {
                    console.error('Error adding person to Firestore: ', error);
                    reject(error);
                  });
              } else {
                console.log('House not found for the user.');
                reject('House not found for the user.');
              }
            })
            .catch((error) => {
              console.error('Error retrieving person from Firestore: ', error);
              reject(error);
            });
        }
      });
    });
  }
  //DELETE
  deletePersonFromFirestore(person: Person): Promise<void> {
    return new Promise<void>((resolve, reject) => {
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
                    resolve();
                  }).catch((error) => {
                    console.error('Error deleting person from Firestore: ', error);
                    reject(error);
                  });
                } else {
                  console.log('Person not found in Firestore.');
                  reject('Person not found in Firestore.');
                }
              }).catch((error) => {
                console.error('Error retrieving person from Firestore: ', error);
                reject(error);
              });
            } else {
              console.log('House not found for the user.');
              reject('House not found for the user.');
            }
          }).catch((error) => {
            console.error('Error retrieving house from Firestore: ', error);
            reject(error);
          });
        }
      });
    });
  }
  deleteTaskFromFirestore(task: Tasks): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.auth.currentUser.then((user) => {
        if (user && task.taskName) {
          const houseCollectionRef = this.firestore.collection('house');
          const query = houseCollectionRef.ref.where('email', '==', user.email);
          query.get().then((querySnapshot) => {
            if (!querySnapshot.empty) {
              const houseId = querySnapshot.docs[0].id;
              const taskCollectionRef = houseCollectionRef.doc(houseId).collection('task');
              const taskQuery = taskCollectionRef.ref.where('taskName', '==', task.taskName);

              taskQuery.get().then((taskQuerySnapshot) => {
                if (!taskQuerySnapshot.empty) {
                  const taskDocId = taskQuerySnapshot.docs[0].id;
                  const taskDocRef = taskCollectionRef.doc(taskDocId);

                  taskDocRef.delete().then(() => {
                    console.log('Task deleted successfully from Firestore.');
                    resolve();
                  }).catch((error) => {
                    console.error('Error deleting task from Firestore: ', error);
                    reject(error);
                  });
                } else {
                  console.log('Task not found in Firestore.');
                  reject('Task not found in Firestore.');
                }
              }).catch((error) => {
                console.error('Error retrieving task from Firestore: ', error);
                reject(error);
              });
            } else {
              console.log('House not found for the user.');
              reject('House not found for the user.');
            }
          }).catch((error) => {
            console.error('Error retrieving house from Firestore: ', error);
            reject(error);
          });
        }
      });
    });
  }
}
