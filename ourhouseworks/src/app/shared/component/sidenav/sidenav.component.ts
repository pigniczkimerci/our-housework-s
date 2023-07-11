import { Component, Input, ViewChild     } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from '../../auth/auth.guard';
import { AuthService } from '../../auth/auth.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDrawerMode, MatSidenav } from '@angular/material/sidenav';
import { NavbarService } from '../../services/navbar.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent{
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isLoggedIn: boolean = false;
  isSidenavOpen: boolean= true;
  sidenavMode: MatDrawerMode = 'side';
  isExpanded = false;
  sidenavOpened = false; 

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
    this.sidenav.toggle();
  }
  constructor(public nav: NavbarService, private authService: AuthService, private breakpointObserver: BreakpointObserver) {
    this.observeScreenSizeChanges();

  }

  ngOnInit() {
    console.log(this.isLoggedIn);
    this.authService.isLoggedIn().subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });
  }
  private observeScreenSizeChanges(): void {
    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.Handset]).subscribe((result) => {
      if (result.matches) {
        this.isSidenavOpen = false;
        this.sidenavMode = 'over';
      } else {
        this.isSidenavOpen = true;
        this.sidenavMode = 'side';
      }
    });
  }


}