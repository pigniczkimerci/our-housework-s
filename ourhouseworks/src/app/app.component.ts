import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})



export class AppComponent {
  title = 'ourhouseworks';
  isLoggedin: boolean = sessionStorage.getItem('isLoggedIn') === 'true';
}
