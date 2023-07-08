import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { Person } from '../models/person';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Tasks } from '../models/task';
import { Recipes } from '../models/recipes';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  taskID: string | undefined;

  constructor(private firestore: AngularFirestore,private auth: AngularFireAuth) { }
  
  private getHouseCollectionRef(): Promise<any> {
    return this.auth.currentUser.then((user) => {
      return this.firestore.collection('house', (ref) => ref.where('email', '==', user!.email));
    });
  }

  private getHouseId(): Promise<string | null> {
    return this.getHouseCollectionRef().then((houseCollectionRef) => {
      return houseCollectionRef.get().toPromise().then((querySnapshot: { empty: any; docs: { id: any; }[]; }) => {
        if (!querySnapshot.empty) {
          return querySnapshot.docs[0].id;
        } else {
          return null;
        }
      });
    });
  }

  private getTaskCollectionRef(): Promise<any> {
    return this.getHouseId().then((houseId) => {
      if (houseId) {
        return this.firestore.collection('house').doc(houseId).collection('task').ref;
      } else {
        throw new Error('House not found for the user.');
      }
    });
  }

  private getPersonCollectionRef(): Promise<any> {
    return this.getHouseId().then((houseId) => {
      if (houseId) {
        return this.firestore.collection('house').doc(houseId).collection('people').ref;
      } else {
        throw new Error('House not found for the user.');
      }
    });
  }
  private getRecipeCollectionRef(): Promise<any> {
    return this.getHouseId().then((houseId) => {
      if (houseId) {
        return this.firestore.collection('house').doc(houseId).collection('recipe').ref;
      } else {
        throw new Error('House not found for the user.');
      }
    });
  }
  addDocumentToFirestore(collectionRef: any, data: any): Promise<void> {
    return collectionRef.add(data)
      .then(() => {
        console.log('Document added successfully to Firestore.');
      })
      .catch((error: Error) => {
        console.error('Error adding document to Firestore: ', error);
        throw error;
      });
  }
  addRecipeToFirestore(recipeName: string, recipePicture: any, description: string, ingredients: Array<any>): Promise<void> {
    const recipeCollectionRef = this.getRecipeCollectionRef();
    const recipe = { recipeName: recipeName, recPicture: recipePicture, description: description, ingredients: ingredients };
    return this.addDocumentToFirestore(recipeCollectionRef, recipe);
  }
  
  addPersonToFirestore(personName: string): Promise<void> {
    const personCollectionRef = this.getPersonCollectionRef();
    const person = { personName: personName };
    return this.addDocumentToFirestore(personCollectionRef, person);
  }
  
  addTaskToFirestore(taskName: string, date: any, selectedMember: Person): Promise<void> {
    const taskCollectionRef = this.getTaskCollectionRef();
    const task = { taskName: taskName, date: date, resperson: selectedMember };
    return this.addDocumentToFirestore(taskCollectionRef, task);
  }
  editTask(task: Tasks): Promise<void> {
    return this.getTaskCollectionRef().then((taskCollectionRef) => {
      const taskQuery = taskCollectionRef.where('taskName', '==', task.taskName)
        .where('resperson', '==', task.resperson)
        .where('date', '==', task.date);

      return taskQuery.get().then((taskQuerySnapshot: { empty: any; docs: { id: string | undefined; }[]; }) => {
        if (!taskQuerySnapshot.empty) {
          this.taskID = taskQuerySnapshot.docs[0].id;
          task.isEditing = true;
        } else {
          console.log('Task not found in Firestore.');
        }
      }).catch((error: any) => {
        console.error('Error retrieving task from Firestore: ', error);
        throw error;
      });
    }).catch((error) => {
      console.error('Error retrieving house from Firestore: ', error);
      throw error;
    });
  }

  cancelEditTask(task: Tasks) {
    task.isEditing = false;
  }

  updateTask(task: Tasks): Promise<void> {
    if (this.taskID) {
      return this.getTaskCollectionRef().then((taskCollectionRef) => {
        const taskDocRef = taskCollectionRef.doc(this.taskID);
        return taskDocRef.update({
          taskName: task.taskName,
          resperson: task.resperson,
          date: task.date
        }).then(() => {
          console.log('Task updated successfully in Firestore.');
          task.isEditing = false; // Exit edit mode
        }).catch((error: any) => {
          console.error('Error updating task in Firestore: ', error);
          throw error;
        });
      }).catch((error) => {
        console.error('Error retrieving task collection from Firestore: ', error);
        throw error;
      });
    } else {
      throw new Error('Task ID not set.');
    }
  }

  addTaskToPerson(personName: Person, doneTask: Tasks): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.auth.currentUser.then((user) => {
        if (user && personName && doneTask) {
          const task = { name: doneTask };
          this.firestore
            .collection('house', (ref) => ref.where('email', '==', user.email))
            .get()
            .toPromise()
            .then((querySnapshot) => {
              if (!querySnapshot!.empty) {
                const houseId = querySnapshot!.docs[0].id;
                const peopleCollectionRef = this.firestore
                  .collection('house')
                  .doc(houseId)
                  .collection('people');
                const personQuery = peopleCollectionRef.ref.where('personName', '==', personName);
                personQuery
                  .get()
                  .then((personQuerySnapshot) => {
                    if (!personQuerySnapshot.empty) {
                      const personDocId = personQuerySnapshot.docs[0].id;
                      const personDocRef = peopleCollectionRef.doc(personDocId);
                      personDocRef.get().toPromise().then((personDoc) => {
                        const existingDoneTasks = personDoc!.data()?.['doneTask'];
                        const updatedDoneTasks = Array.isArray(existingDoneTasks) ? [...existingDoneTasks, doneTask] : [doneTask];
                        personDocRef
                          .update({ doneTask: updatedDoneTasks })
                          .then(() => {
                            console.log('Task added to person successfully in Firestore.');
                            resolve();
                          })
                          .catch((error) => {
                            console.error('Error adding task to person in Firestore: ', error);
                            reject(error);
                          });
                      }).catch((error) => {
                        console.error('Error retrieving person from Firestore: ', error);
                        reject(error);
                      });
                    } else {
                      console.log('Person not found in Firestore.');
                      reject('Person not found in Firestore.');
                    }
                  })
                  .catch((error) => {
                    console.error('Error retrieving person from Firestore: ', error);
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
  //DELETE FORM DATABASE
  deletePersonFromFirestore(person: Person): Promise<void> {
    const personCollectionRef = this.getPersonCollectionRef();
    return this.deleteDocumentFromFirestore(personCollectionRef, 'personName', person.personName);
  }
  
  deleteTaskFromFirestore(task: Tasks): Promise<void> {
    const taskCollectionRef = this.getTaskCollectionRef();
    return this.deleteDocumentFromFirestore(taskCollectionRef, 'taskName', task.taskName);
  }
  
  deleteRecipeFromFirestore(recipe: Recipes): Promise<void> {
    const recipeCollectionRef = this.getRecipeCollectionRef();
    return this.deleteDocumentFromFirestore(recipeCollectionRef, 'recipeName', recipe.recipeName);
  }
  deleteDocumentFromFirestore(collectionRef: any, fieldName: string, fieldValue: any): Promise<void> {
    const query = collectionRef.where(fieldName, '==', fieldValue);
    return query.get()
      .then((querySnapshot: { empty: any; docs: { ref: any; }[]; }) => {
        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;
          return docRef.delete()
            .then(() => {
              console.log('Document deleted successfully from Firestore.');
            });
        } else {
          console.log('Document not found in Firestore.');
          throw new Error('Document not found in Firestore.');
        }
      })
      .catch((error: Error) => {
        console.error('Error deleting document from Firestore: ', error);
        throw error;
      });
  }  
}
