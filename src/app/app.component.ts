import { Component } from '@angular/core';
import { TodoListComponent } from './todo-list/todo-list.component';
import { ProfileManagerComponent } from './profile-manager/profile-manager.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TodoListComponent, ProfileManagerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
