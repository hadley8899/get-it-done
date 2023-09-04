import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  showNavs = true;
  loading = true;

  // Add to this array to hide the nav for certain pages
  routesToHideNav: string[] = [
    '/login',
    '/register',
    '/user/forgot-password',
    '/user/reset-password',
    '/user/activate-account',
    'workspaces/accept-invite/',
  ];

  constructor(private router: Router) {
  }

  ngOnInit() {
    this.loading = true;
    // Stop the navigation showing on certain pages
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {

        let shouldShowNavs = true;
        for (const hiddenPart of this.routesToHideNav) {
          if (event.url.search(hiddenPart) !== -1) {
            shouldShowNavs = false;
          }
        }
        this.loading = false;
        this.showNavs = shouldShowNavs;
      }
    });
  }
}
