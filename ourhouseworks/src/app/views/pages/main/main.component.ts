import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, first } from 'rxjs';
import { NavbarService } from 'src/app/shared/services/navbar.service';
import { DatePipe } from '@angular/common';
import { Person } from 'src/app/shared/models/person';
import { Tasks } from 'src/app/shared/models/task';
import { DatabaseService } from 'src/app/shared/services/database.service';

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

  tableDataSource: Tasks[] = [];

  updatedTask!: Tasks;
  taskID!: any;

  constructor(private databaseService: DatabaseService,private firestore: AngularFirestore, private auth: AngularFireAuth, public nav: NavbarService, private datePipe: DatePipe) {  }
  
  ngOnInit(): void {
    this.tasks = this.firestore.collectionGroup('task').valueChanges() as Observable<Tasks[]>;
    this.tasks.subscribe((data) => {
      this.tableDataSource = data;
      this.tableDataSource.forEach((element) => {
        element.isEditing = false;
      });
    });
    this.responsibleMembers = this.firestore.collectionGroup('people').valueChanges() as Observable<Person[]>;
    setTimeout(() => {
      this.nav.show();
    });
  }
  createTask() {
    if (this.taskName && this.date && this.selectedMember && this.selectedMember) {
      this.databaseService.addTaskToFirestore(this.taskName, this.date, this.selectedMember)
        .then(() => {
          console.log('Task added successfully to Firestore.');
        })
        .catch((error) => {
          console.error('Error adding task to Firestore: ', error);
        });
    } else {
      console.error('Invalid task details.');
    }
  }
  
  checkFieldsFilled() {
    this.allFieldsFilled = !!this.taskName && !!this.date && !!this.selectedMember;
  }
  deleteTask(task: Tasks) {
    this.databaseService.deleteTaskFromFirestore(task)
      .then(() => {
        console.log("Task deleted successfully");
      })
      .catch((error) => {
        console.log("Error deleting task");
      });
  }

  editTask(task: Tasks) {
    this.auth.currentUser.then((user) => {
      if (user) {
        const houseCollectionRef = this.firestore.collection('house');
        const query = houseCollectionRef.ref.where('email', '==', user.email);
        query.get().then((querySnapshot) => {
          if (!querySnapshot.empty) {
            const houseId = querySnapshot.docs[0].id;
            const tasksCollectionRef = houseCollectionRef.doc(houseId).collection('task');
            const taskQuery = tasksCollectionRef.ref.where('taskName', '==', task.taskName)
                                            .where('resperson', '==', task.resperson)
                                            .where('date', '==', task.date);
              taskQuery.get().then((taskQuerySnapshot) => {
              if (!taskQuerySnapshot.empty) {
                const personDocId = taskQuerySnapshot.docs[0].id;
                const personDocRef = tasksCollectionRef.doc(personDocId);
                this.taskID = personDocRef;
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
    task.isEditing = true;
  }
  
  cancelEditTask(task: Tasks) {
    task.isEditing = false;
  }
  
  updateTask(task: Tasks) {
    this.taskID.update({  name: task.taskName, resperson: task.resperson, date: task.date }).then(() => {
        task.isEditing = false; // Exit edit mode
      }).catch((error:any) => {
      console.error('Error updating task name in Firestore: ', error);
    });      
  }
}
