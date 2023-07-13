import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference, DocumentReference } from '@angular/fire/compat/firestore';
import { Person } from '../models/person';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Tasks } from '../models/task';
import { Recipes } from '../models/recipes';
import { Ingredients } from '../models/ingredients';
import { Fridge } from '../models/fridge';
import { Time } from '@angular/common';
import { IGroup } from '../models/i-group';

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
  
  addRecipeToFirestore(recipeName: string, recipePicture: any, description: string, ingredients: IGroup[], temperature: number, time: Time): Promise<void> {
    const recipe = { recipeName, recPicture: recipePicture, description, ingredients, temperature, time };
    return this.addToFirestore(
      this.getRecipeCollectionRef(),
      recipe,
      'Recipe added successfully to Firestore.'
    );
  }
  async addFridgeToFirestore(recipeName: string, ingredients: IGroup[]): Promise<void> {
    try {
      const fridgeCollectionRef = await this.getFridgeCollectionRef();
      // Check if a document with the same "name" already exists in the collection
      const querySnapshot = await fridgeCollectionRef.where('name', '==', recipeName).get();
      if (!querySnapshot.empty) {
        // Document with the same "name" exists, update its ingredients array
        const existingDoc = querySnapshot.docs[0];
        const existingIngredients = existingDoc.data().ingredients || [];
        // Merge the existing and new ingredients, handling duplicates
        const mergedIngredients = ingredients.reduce((merged, ing) => {
        const existingIngredientIndex = merged.findIndex((item) => item.name === ing.name);
        if (existingIngredientIndex !== -1) {
            // Ingredient already exists, add the quantities
            merged[existingIngredientIndex].ingredient.forEach((item: { quantity: number }) => {
            item.quantity = Number(item.quantity) + ing.ingredient.reduce((sum: number, ingredient) => sum + Number(ingredient.quantity), 0);
          });
        } else {
            // Ingredient doesn't exist, add it to the merged array
            merged.push({ ...ing });
          }
          return merged;
        }, [...existingIngredients]);
  
        await existingDoc.ref.update({ ingredients: mergedIngredients });
      } else {
        // No document with the same "name" exists, create a new document
        const newDoc = {
          name: recipeName,
          ingredients: ingredients
        };
        await fridgeCollectionRef.add(newDoc);
      }
  
      console.log('Fridge added successfully to Firestore.');
    } catch (error) {
      console.error('Error adding fridge to Firestore:', error);
      throw error;
    }
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
    return this.deleteDocumentFromFirestore(await fridgeCollectionRef, 'name', fridge.name);
  }
  async deleteIngredientsFromFridge(ing: Ingredients): Promise<void> {
    try {
      const fridgeCollectionRef = await this.getFridgeCollectionRef();
      const fridgeSnapshot = await fridgeCollectionRef.get();
      if (!fridgeSnapshot.empty) {
        fridgeSnapshot.forEach((doc: { data: () => any; ref: { update: (arg0: { ingredients: any }) => any } }) => {
          const fridgeData = doc.data();
          const ingredients = fridgeData.ingredients;
          if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
            const ingredientArray = ingredients[0].ingredient;
            // Find the index of the ingredient to be deleted
            const index = ingredientArray.findIndex((item: any) => item.name === ing.name);
            if (index !== -1) {
              // Remove the ingredient from the array
              ingredientArray.splice(index, 1);
      
              // Update the "ingredients" array in the Firestore document
              return doc.ref.update({ ingredients: [{ ingredient: ingredientArray }] });
            }
          }
        });
      }
       else {
        throw new Error('No documents found in the "Fridge" collection.');
      }
    } catch (error) {
      console.error('Error deleting ingredient from Fridge collection:', error);
      throw error;
    }
  }
}
