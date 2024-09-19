
import { Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class HistoryService  {

    private history: string[] = [];
    private storageKey = 'history';

    constructor() {
      this.loadHistory();
    }

    private saveHistory(): void {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    }

    private loadHistory(): void {
      const storedHistory = localStorage.getItem(this.storageKey);
      if (storedHistory) {
        this.history = JSON.parse(storedHistory);
      }
    }

    push(entry: string): void {
      this.history.push(entry);
      this.saveHistory();
    }

    pop(): string | undefined {
      const entry = this.history.pop();
      this.saveHistory();
      return entry;
    }

    clear(): void {
      this.history = [];
      this.saveHistory();
    }

    getLastHistory(): string | undefined {
      return this.history.length > 0 ? this.history[this.history.length - 1] : undefined;
    }

    getHistory(): string[] {
      return this.history;
    }

}
