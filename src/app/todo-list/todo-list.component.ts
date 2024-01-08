import { Component, inject } from '@angular/core';
import { TodoService } from '../todo.service';
import { ProfileService } from '../profile.service';
import { Todo, TodoRequest } from '../types';
import { Subscription, catchError, of } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TodoComponent } from '../todo/todo.component';

const filters = [
  "All",
  "Pending",
  "Completed",
] as const;
type Filter = typeof filters[number];


@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [
    CommonModule,
    TodoComponent,
    ReactiveFormsModule
  ],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.css'
})
export class TodoListComponent {
  private todoService = inject(TodoService);

  private profileService = inject(ProfileService);

  private todos: Todo[] = [];

  private subscriptions: Subscription[] = [];

  private profileId = "";

  filteredTodos: Todo[] = [];

  filters = filters;

  hasError = false;

  currentFilter: Filter = 'All';

  todoForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    completed: new FormControl(false),
  });

  ngOnInit() {
    let idSub = this.profileService.currentProfileId.subscribe(id => {
      console.log("changed id", id);
      if (!id) {
        return;
      }

      this.profileId = id;
      const todoSub = this.todoService
        .getTodos(id)
        .pipe(catchError(() => {
          this.hasError = true;
          return of(null);
        }))
        .subscribe(todos => {
          if (!todos) {
            return;
          }

          this.todos = todos;
          this.filteredTodos = this.todos;
        });

      this.subscriptions.push(todoSub);
    });

    this.subscriptions.push(idSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  createTodo(): void {
    const payload = {
      ...this.todoForm.value,
      profile_id: this.profileId,
    } as TodoRequest;

    const subscription = this.todoService
      .saveTodo(payload)
      .pipe(catchError(() => {
        this.hasError = true;
        return of(null);
      }))
      .subscribe(newTodo => {
        if (newTodo) {
          this.todos.push(newTodo);
        }
        this.todoForm.reset({
          name: '',
          completed: false,
        });
      });

    this.subscriptions.push(subscription);
  }

  onTodoDeleted(id: number) {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.setFilter(this.currentFilter);
  }

  onTodoEdited(newTodo: Todo) {
    this.todos = this.todos.map(todo => {
      if (todo.id === newTodo.id) {
        return newTodo;
      }

      return todo;
    });

    this.setFilter(this.currentFilter);
  }

  setFilter(filter: Filter) {
    this.currentFilter = filter;
    this.filteredTodos = this.todos.filter(todo => {
      if (this.currentFilter === 'All') {
        return true;
      }

      return this.currentFilter === 'Completed'
        ? todo.completed
        : !todo.completed;
    });
  }

  onError() {
    this.hasError = true;
  }
}
