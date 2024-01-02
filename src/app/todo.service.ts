import { Injectable } from '@angular/core';
import { Todo, TodoRequest } from './types';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private baseUrl = "https://udt-training.azurewebsites.net/api";

  constructor(
    private httpClient: HttpClient,
  ) { }

  defaultHeaders = {
    'Content-Type': 'application/json',
  };

  public getTodos(): Observable<Todo[]> {
    return this.httpClient.get<Todo[]>(`${this.baseUrl}/todos`);
  }

  public saveTodo(todo: TodoRequest): Observable<Todo> {
    return this.httpClient.post<Todo>(`${this.baseUrl}/todos`, JSON.stringify(todo), {
      headers: this.defaultHeaders,
    });
  }

  public deleteTodo(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/todos/${id}`);
  }

  public editTodo(id: number, todo: TodoRequest): Observable<Todo> {
    return this.httpClient.put<Todo>(`${this.baseUrl}/todos/${id}`, JSON.stringify(todo), {
      headers: this.defaultHeaders,
    });
  }
}
