import { Component, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from '../../auth/auth.guard';
import { AuthService } from '../../auth/auth.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDrawerMode, MatSidenav } from '@angular/material/sidenav';
import { NavbarService } from '../../services/navbar.service';
import { LocationStrategy } from '@angular/common';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isLoggedIn: boolean = false;
  isSidenavOpen: boolean = true;
  sidenavMode: MatDrawerMode = 'side';
  isExpanded = false;
  sidenavOpened = false;
  isLoginPage!: boolean;
  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
    this.sidenav.toggle();
  }
  constructor(public nav: NavbarService, private authService: AuthService, private breakpointObserver: BreakpointObserver, private router: Router, private locationStrategy: LocationStrategy) {
    this.observeScreenSizeChanges();
    this.isLoginPage = false;
  }

  ngOnInit() {
    this.authService.isLoggedIn().subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });
    const currentUrl = this.locationStrategy.path();
    if (currentUrl === '/login' || currentUrl === '/register') {
      this.isLoginPage = true;
    } else {
      this.isLoginPage = false;
    }

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isLoginPage = this.router.url === '/login' || this.router.url === '/register';
      }
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