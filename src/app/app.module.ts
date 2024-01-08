import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoListComponent } from './todo-list/todo-list.component';
import { TodoComponent } from './todo/todo.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [],
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    TodoListComponent,
    TodoListComponent,
    CommonModule,
    AppComponent,
    TodoComponent
  ],
  exports: [
    AppComponent,
  ]
})
export class AppModule { }
