import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, first } from 'rxjs';
import { NavbarService } from 'src/app/shared/services/navbar.service';
import { DatePipe } from '@angular/common';
import { Person } from 'src/app/shared/models/person';
import { Tasks } from 'src/app/shared/models/task';
import { DatabaseService } from 'src/app/shared/services/database.service';
import Swal from 'sweetalert2';

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

  constructor(private databaseService: DatabaseService, private firestore: AngularFirestore, private auth: AngularFireAuth, public nav: NavbarService, private datePipe: DatePipe) { }

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
          Swal.fire({
            icon: 'success',
            title: 'Your task has been saved',
            showConfirmButton: false,
            timer: 1500
          });
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
    Swal.fire({
      title: 'Are you sure you want to delete this task?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#333',
    }).then((result) => {
      if (result.isConfirmed) {
        this.databaseService.deleteTaskFromFirestore(task)
          .then(() => {
            Swal.fire({
              title: 'Task has been deleted!',
              confirmButtonText: 'Ok',
              confirmButtonColor: '#00616D'
            })
          })
          .catch((error) => {
            Swal.fire({
              icon: 'error',
              text: 'Error deleting task!',
            })
          });
      }
    })
  }
  editTask(task: Tasks) {
    this.databaseService.editTask(task).catch((error) => {
      console.error('Error editing task: ', error);
    });
  }

  cancelEditTask(task: Tasks) {
    this.databaseService.cancelEditTask(task);
  }

  updateTask(task: Tasks) {
    this.databaseService.updateTask(task).catch((error) => {
      console.error('Error updating task: ', error);
    });
  }
}
