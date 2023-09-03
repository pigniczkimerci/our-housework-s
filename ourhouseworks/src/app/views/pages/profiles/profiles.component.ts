import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, combineLatest, concat, map, merge, take } from 'rxjs';
import { Person } from 'src/app/shared/models/person';
import { Tasks } from 'src/app/shared/models/task';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { NavbarService } from 'src/app/shared/services/navbar.service';
import Swal from 'sweetalert2';
import { Chart } from 'chart.js/auto';
@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss']
})
export class ProfilesComponent {
  personName!: string;
  personEmail!: string;
  people!: Observable<(Person)[]>;
  peopleSource!: (Person)[];
  chart: any;
  completedTasks: Map<string, number> | undefined;
  constructor(private databaseService: DatabaseService,private firestore: AngularFirestore, public nav: NavbarService,) { }

  ngOnInit(): void {
    
    const peopleObservable = this.firestore.collectionGroup('people').valueChanges() as Observable<Person[]>;
    const tasksObservable = this.firestore.collectionGroup('task').valueChanges() as Observable<Tasks[]>;
    const combinedObservable = combineLatest([
      peopleObservable,
      tasksObservable
    ]).pipe(
      map(([people, tasks]) => {
        people.forEach((person:any) => {
          const matchingTasks: Tasks[] = tasks.filter((task:any) => task.resperson === person.personName);
          if(person.doneTask != undefined){
            person.doneTask = Object.values(person.doneTask);
            const matchingTasks2 = person.doneTask
              .filter((task: any) => typeof task === 'object')
              .map((task: any) => {
                const matchingStringTasks = person.doneTask.filter((t: any) => typeof t === 'string' && t !== person.personName);
                const matchingStringTask = matchingStringTasks.length > 0 ? matchingStringTasks[0] : null;
                return {
                  taskName: task.taskName || matchingStringTask,
                  date: { seconds: task.seconds, nanoseconds: task.nanoseconds },
                  resperson: person.personName,
                };
              });
            person.doneTask = matchingTasks2 as Tasks[];
          }
          person.tasks = matchingTasks as Tasks[];
        });
        this.peopleSource = people;
      })
    );
    
    combinedObservable.subscribe();
    setTimeout(() => {
      this.nav.show();
    });
    this.createChart();
  }
  createPerson() {
    this.databaseService.addPersonToFirestore(this.personName, this.personEmail)
      .then(() => {
        console.log("Person added successfully");
        Swal.fire({
          icon: 'success',
          title: 'Person has been saved',
          showConfirmButton: false,
          timer: 1500
        });
      })
      .catch((error) => {
        console.log("Error adding person");
      });
  }
  deletePerson(person: Person) {
    Swal.fire({
      title: 'Are you sure you want to delete this person?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#333',
    }).then((result) => {
      if (result.isConfirmed) {
      this.databaseService.deletePersonFromFirestore(person)
        .then(() => {
          Swal.fire({
            title: 'Person has been deleted!',
            confirmButtonText: 'Ok',
            confirmButtonColor: '#00616D'
          })
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error',
            text: 'Error deleting person!',
          })
        });
      }   
    })
  }
  convertTimestampToDate(timestamp: any): Date | null {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate();
    }
    return null;
  }
  completedTask(task:Tasks){
    this.databaseService.addTaskToPerson(task.resperson, task)
    .then(() => {
      this.databaseService.deleteTaskFromFirestore(task);
      Swal.fire({
        icon: 'success',
        title: 'Task completed',
        showConfirmButton: false,
        timer: 1500
      });
    }).catch((error) => {
      Swal.fire({
        icon: 'error',
        text: 'Error complete task!',
      })
    });
  }
  createChart(){
    console.log(this.peopleSource)
    this.chart = new Chart("TaskChart", {
      type: 'bar', //this denotes tha type of chart

      data: {// values on X-Axis
        labels: ['2022-05-10', '2022-05-11', '2022-05-12','2022-05-13',
								 '2022-05-14', '2022-05-15', '2022-05-16','2022-05-17', ], 
	       datasets: [
          {
            label: "Profit",
            data: ['542', '542', '536', '327', '17',
									 '0.00', '538', '541'],
            backgroundColor: 'limegreen'
          }  
        ]
      },
      options: {
        aspectRatio:2.5
      }
      
    });
  }
}
