import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Input() isLoggedIn!: boolean;
  private session = sessionStorage.getItem('token');

  constructor() {
    console.log(this.session);
    if (!this.session) {
      console.log("false");
      this.isLoggedIn = false;
    } else {
      console.log("true");
      this.isLoggedIn = true;
    }
  }
}
