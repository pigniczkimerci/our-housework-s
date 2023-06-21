import { Component, Input, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { NavbarService } from '../../services/navbar.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  isLoggedIn: boolean = false;
  @ViewChild(SidenavComponent) sidenav!: SidenavComponent;
  constructor(private authService: AuthService,public nav: NavbarService,) { }
  toggleSidenav(): void {
    this.sidenav.toggleSidenav();
  }
  ngOnInit() {
    this.authService.isLoggedIn().subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });
  }
}
