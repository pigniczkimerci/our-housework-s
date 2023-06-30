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

  addTaskToFirestore(taskName: string, date: any, selectedMember: Person): Promise<void> {
    return this.getTaskCollectionRef().then((taskCollectionRef) => {
      const task = { taskName: taskName, date: date, resperson: selectedMember };
      return taskCollectionRef.add(task);
    }).then(() => {
      console.log('Task added successfully to Firestore.');
    }).catch((error) => {
      console.error('Error adding task to Firestore: ', error);
      throw error;
    });
  }

  addPersonToFirestore(personName: string): Promise<void> {
    return this.getPersonCollectionRef().then((personCollectionRef) => {
      const person = { personName: personName };
      return personCollectionRef.add(person);
    }).then(() => {
      console.log('Person added successfully to Firestore.');
    }).catch((error) => {
      console.error('Error adding person to Firestore: ', error);
      throw error;
    });
  }

  deletePersonFromFirestore(person: Person): Promise<void> {
    return this.getPersonCollectionRef().then((personCollectionRef) => {
      const personQuery = personCollectionRef.where('personName', '==', person.personName);
      return personQuery.get().then((personQuerySnapshot: { empty: any; docs: { ref: any; }[]; }) => {
        if (!personQuerySnapshot.empty) {
          const personDocRef = personQuerySnapshot.docs[0].ref;
          return personDocRef.delete().then(() => {
            console.log('Person deleted successfully from Firestore.');
          });
        } else {
          console.log('Person not found in Firestore.');
          throw new Error('Person not found in Firestore.');
        }
      });
    }).catch((error) => {
      console.error('Error deleting person from Firestore: ', error);
      throw error;
    });
  }

  deleteTaskFromFirestore(task: Tasks): Promise<void> {
    return this.getTaskCollectionRef().then((taskCollectionRef) => {
      const taskQuery = taskCollectionRef.where('taskName', '==', task.taskName);
      return taskQuery.get().then((taskQuerySnapshot: { empty: any; docs: { ref: any; }[]; }) => {
        if (!taskQuerySnapshot.empty) {
          const taskDocRef = taskQuerySnapshot.docs[0].ref;
          return taskDocRef.delete().then(() => {
            console.log('Task deleted successfully from Firestore.');
          });
        } else {
          console.log('Task not found in Firestore.');
          throw new Error('Task not found in Firestore.');
        }
      });
    }).catch((error) => {
      console.error('Error deleting task from Firestore: ', error);
      throw error;
    });
  }
}
