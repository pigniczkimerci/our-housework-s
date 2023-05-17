import { Component, Input, ViewChild } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from '../../auth/auth.guard';
import { AuthService } from '../../auth/auth.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDrawerMode, MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isLoggedIn: boolean = false;
  isSidenavOpen = true;
  sidenavMode: MatDrawerMode = 'side';

  toggleSidenav(): void {
    this.sidenav.toggle();
  }
  constructor(private authService: AuthService, private breakpointObserver: BreakpointObserver) {
    this.observeScreenSizeChanges();
  }

  ngOnInit() {
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