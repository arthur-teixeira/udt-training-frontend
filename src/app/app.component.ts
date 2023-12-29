import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoComponent } from './todo/todo.component';
import { TodoService } from './todo.service';
import { Todo, TodoRequest } from './types';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, catchError, of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';

const filters = [
  "All",
  "Pending",
  "Completed",
] as const;
type Filter = typeof filters[number];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    TodoComponent,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  todoService = inject(TodoService);
  todos: Todo[] = [];
  filteredTodos: Todo[] = [];
  filters = filters;
  subscriptions: Subscription[] = [];
  hasError = false;

  currentFilter: Filter = 'All';

  todoForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    completed: new FormControl(false),
  });

  ngOnInit() {
    const subscription = this.todoService
      .getTodos()
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

    this.subscriptions.push(subscription);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  createTodo(): void {
    const subscription = this.todoService
      .saveTodo(this.todoForm.value as TodoRequest)
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
