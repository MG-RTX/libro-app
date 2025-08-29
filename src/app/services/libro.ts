import { Observable } from 'rxjs';
import { Libro } from '../model/libro.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LibroService {
  
  private baseUrl = "http://localhost:8080/api/libro";
  
  constructor(private http: HttpClient) {}

  findAll(): Observable<Libro[]> {
    return this.http.get<Libro[]>(this.baseUrl);
  }

  findOne(id: number): Observable<Libro> {
    return this.http.get<Libro>(`${this.baseUrl}/${id}`);
  }

  save(libro: Libro): Observable<Libro> {
    return this.http.post<Libro>(this.baseUrl, libro);
  }

  update(id: number, idCategoria: number, idAutor: number, libro: Libro): Observable<Libro> {
  // Use HttpParams for cleaner URL construction
  const params = new HttpParams()
    .set('idCategoria', idCategoria.toString())
    .set('idAutor', idAutor.toString());

  return this.http.put<Libro>(
    `${this.baseUrl}/${id}`,
    libro,
    { params }
  );
}

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}