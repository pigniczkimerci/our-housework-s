import { Component } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { NavbarService } from 'src/app/shared/services/navbar.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  calendarOptions: any;
  constructor(public nav: NavbarService) {  }
  ngOnInit(): void {
    this.calendarOptions = {
      plugins: [dayGridPlugin], // Import and include the dayGridPlugin
      initialView: 'dayGridMonth',
      // Your event data
      events: [
        { title: 'Event 1', date: '2023-07-15' },
        { title: 'Event 2', date: '2023-07-16' }
      ]
    };
    setTimeout(() => {
      this.nav.show();
    });
  }
}
