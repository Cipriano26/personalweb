import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  isDark = false;

  constructor() {
    // initialize from saved preference or system preference
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        this.enableDark();
      } else if (saved === 'light') {
        this.disableDark();
      } else {
        // fallback to prefers-color-scheme
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) this.enableDark();
      }
    } catch (e) {
      // ignore
    }
  }

  enableDark() {
    document.documentElement.classList.add('dark');
    this.isDark = true;
    try { localStorage.setItem('theme', 'dark'); } catch (e) {}
  }

  disableDark() {
    document.documentElement.classList.remove('dark');
    this.isDark = false;
    try { localStorage.setItem('theme', 'light'); } catch (e) {}
  }

  toggleTheme() {
    if (this.isDark) this.disableDark(); else this.enableDark();
  }
}
