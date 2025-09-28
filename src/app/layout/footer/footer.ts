import { Component } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [NgIf],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class Footer {
  isDark = false;

  constructor() {
    try {
      // sync with existing DOM class or saved preference
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (saved === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) document.documentElement.classList.add('dark');
      }
      this.isDark = document.documentElement.classList.contains('dark');
    } catch (e) {
      // ignore
    }
  }

  enableDark(log = true) {
    const prev = document.documentElement.classList.contains('dark');
    if (!prev) {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem('theme', 'dark'); } catch (e) {}
    }
    this.isDark = true;
  }

  disableDark(log = true) {
    const prev = document.documentElement.classList.contains('dark');
    if (prev) {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('theme', 'light'); } catch (e) {}
    }
    this.isDark = false;
  }

  toggleTheme() {
    // read actual DOM state to avoid divergence with external scripts
    const currentlyDark = document.documentElement.classList.contains('dark');
    if (currentlyDark) {
      this.disableDark();
    } else {
      this.enableDark();
    }
  }
}
