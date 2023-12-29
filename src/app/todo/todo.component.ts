import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { Todo, TodoRequest } from '../types';
import { TodoService } from '../todo.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFloppyDisk, faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Subscription, catchError, of } from 'rxjs';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
  ],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})

export class TodoComponent implements OnInit, OnDestroy {
  @Input() todo!: Todo;
  @Output() deleteEvent: EventEmitter<number> = new EventEmitter();
  @Output() editEvent: EventEmitter<Todo> = new EventEmitter();
  @Output() errorEvent: EventEmitter<void> = new EventEmitter();

  todoService = inject(TodoService);
  isEditing = false;
  subscriptions: Subscription[] = [];

  faPenToSquare = faPenToSquare;
  faTrash = faTrash;
  faSave = faFloppyDisk;

  todoForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    completed: new FormControl(false),
  });

  ngOnInit() {
    this.todoForm.setValue({
      name: this.todo.name,
      completed: this.todo.completed,
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onDelete() {
    const subscription = this.todoService.deleteTodo(this.todo.id)
      .pipe(catchError(() => {
        this.errorEvent.emit();
        return of(true);
      }))
      .subscribe((hasError) => {
        if (!hasError) {
          this.deleteEvent.emit(this.todo.id);
        }
      });

    this.subscriptions.push(subscription);
  }

  private save(id: number, todo: TodoRequest) {
    const subscription = this.todoService.editTodo(id, todo)
      .pipe(catchError(() => {
        this.errorEvent.emit();
        return of(null);
      }))
      .subscribe(updatedTodo => {
        if (!updatedTodo) {
          return;
        }

        this.todo = updatedTodo;
        this.editEvent.emit(this.todo);
      });

    this.subscriptions.push(subscription);
  }

  onComplete(event: any) {
    this.save(this.todo.id, {
      name: this.todo.name,
      completed: event.target.checked,
    });
  }

  onEdit() {
    this.save(this.todo.id, this.todoForm.value as TodoRequest)
    this.isEditing = false;
  }
}
