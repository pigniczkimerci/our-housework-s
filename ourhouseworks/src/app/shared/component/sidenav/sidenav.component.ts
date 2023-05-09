import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  @Input() isLoggedIn!: boolean;
  private session = sessionStorage.getItem('token');

  constructor() {
    console.log(this.session);
    if (!this.session) {
      this.isLoggedIn = false;
    } else {
      this.isLoggedIn = true;
    }
  }
}