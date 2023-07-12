import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference, DocumentReference } from '@angular/fire/compat/firestore';
import { Person } from '../models/person';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Tasks } from '../models/task';
import { Recipes } from '../models/recipes';
import { Ingredients } from '../models/ingredients';
import { Fridge } from '../models/fridge';

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
  private getFridgeCollectionRef(): Promise<any> {
    return this.getHouseId().then((houseId) => {
      if (houseId) {
        return this.firestore.collection('house').doc(houseId).collection('fridge').ref;
      } else {
        throw new Error('Fridge not found for the user.');
      }
    });
  }
  addToFirestore(collectionRef: any, data: any, successMessage: string) {
    return collectionRef
      .then((ref: any) => ref.add(data))
      .then(() => console.log(successMessage))
      .catch((error: any) => {
        console.error(`Error adding data to Firestore: ${error}`);
        throw error;
      });
  }
  
  addTaskToFirestore(taskName: string, date: any, selectedMember: Person): Promise<void> {
    const task = { taskName, date, resperson: selectedMember };
    return this.addToFirestore(
      this.getTaskCollectionRef(),
      task,
      'Task added successfully to Firestore.'
    );
  }
  
  addPersonToFirestore(personName: string): Promise<void> {
    const person = { personName };
    return this.addToFirestore(
      this.getPersonCollectionRef(),
      person,
      'Person added successfully to Firestore.'
    );
  }
  
  addRecipeToFirestore(recipeName: string, recipePicture: any, description: string, ingredients: Array<Ingredients>): Promise<void> {
    const recipe = { recipeName, recPicture: recipePicture, description, ingredients };
    return this.addToFirestore(
      this.getRecipeCollectionRef(),
      recipe,
      'Recipe added successfully to Firestore.'
    );
  }
  addFridgeToFirestore(recipeName: string, ingredients: Array<Ingredients>): Promise<void> {
    const fridge = { recipeName, ingredients };
    return this.addToFirestore(
      this.getFridgeCollectionRef(),
      fridge,
      'Fridge added successfully to Firestore.'
    );
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
  deleteDocumentFromFirestore(collectionRef: CollectionReference, field: string, value: string): Promise<void> {
    const query = collectionRef.where(field, '==', value);
  
    return query.get().then((querySnapshot: { empty: any; docs: { ref: any; }[]; }) => {
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        return docRef.delete().then(() => {
          console.log('Document deleted successfully from Firestore.');
        });
      } else {
        console.log('Document not found in Firestore.');
        throw new Error('Document not found in Firestore.');
      }
    }).catch((error: Error) => {
      console.error('Error deleting document from Firestore: ', error);
      throw error;
    });
  }
  
  async deletePersonFromFirestore(person: Person): Promise<void> {
    const personCollectionRef = this.getPersonCollectionRef();
    return this.deleteDocumentFromFirestore(await personCollectionRef, 'personName', person.personName);
  }
  
  async deleteTaskFromFirestore(task: Tasks): Promise<void> {
    const taskCollectionRef = this.getTaskCollectionRef();
    return this.deleteDocumentFromFirestore(await taskCollectionRef, 'taskName', task.taskName);
  }
  
  async deleteRecipeFromFirestore(recipe: Recipes): Promise<void> {
    const recipeCollectionRef = this.getRecipeCollectionRef();
    return this.deleteDocumentFromFirestore(await recipeCollectionRef, 'recipeName', recipe.recipeName);
  }
  async deleteFrigeFromFirestore(fridge: Fridge): Promise<void> {
    const fridgeCollectionRef = this.getFridgeCollectionRef();
    console.log(fridgeCollectionRef);
    return this.deleteDocumentFromFirestore(await fridgeCollectionRef, 'recipeName', fridge.recipeName);
  }
}
