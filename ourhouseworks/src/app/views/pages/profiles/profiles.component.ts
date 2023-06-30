import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, combineLatest, concat, map, merge, take } from 'rxjs';
import { Person } from 'src/app/shared/models/person';
import { Tasks } from 'src/app/shared/models/task';
import { DatabaseService } from 'src/app/shared/services/database.service';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss']
})
export class ProfilesComponent {
  personName!: string;
  people!: Observable<(Person)[]>;
  peopleSource!: (Person)[];
  constructor(private databaseService: DatabaseService,private firestore: AngularFirestore, private auth: AngularFireAuth) { }

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
    this.databaseService.addPersonToFirestore(this.personName)
      .then(() => {
        console.log("Person added successfully");
      })
      .catch((error) => {
        console.log("Error adding person");
      });
  }
  deletePerson(person: Person) {
    this.databaseService.deletePersonFromFirestore(person)
      .then(() => {
        console.log("Person deleted successfully");
      })
      .catch((error) => {
        console.log("Error deleting person");
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
