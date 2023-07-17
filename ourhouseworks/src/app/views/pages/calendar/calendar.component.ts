import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Observable } from 'rxjs';
import { Tasks } from 'src/app/shared/models/task';
import { NavbarService } from 'src/app/shared/services/navbar.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  calendarOptions!: CalendarOptions;
  calendarData: Tasks[] = [];
  calendar!: Observable<Tasks[]>;
  calendarSource!: Tasks[];
  constructor(public nav: NavbarService, private firestore: AngularFirestore,) {  }
  ngOnInit(): void {
    this.firestore.collectionGroup('task').valueChanges().subscribe((data: any[]) => {
      this.calendarData = data;
      this.calendarOptions = {
        events: data.map(task => ({
          title: task.taskName + " - " + task.resperson,
          date: task.date.toDate().toISOString().substring(0, 10)
        }))
      };
    });
    this.calendarOptions = {
      plugins: [dayGridPlugin],
      initialView: 'dayGridMonth'
    };
    setTimeout(() => {
      this.nav.show();
    });
  }
}
