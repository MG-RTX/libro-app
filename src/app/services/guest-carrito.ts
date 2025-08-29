import { Injectable } from '@angular/core';
import { enviroment } from '../../enviroments.ts/enviroments';
import { HttpClient, HttpParams } from '@angular/common/http';
import { getCartToken } from '../core/cart-token';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Carrito } from '../model/carrito.model';

@Injectable({
  providedIn: 'root',
})
export class GuestCarritoService {
  private base = `${enviroment.baseURL}/guest/cart`;

  constructor(private http: HttpClient) {}

  private paramsWithToken(): { params: HttpParams } {
    const token = getCartToken();
    return { params: new HttpParams().set('token', token) };
  }

  createOrGet(): Observable<Carrito> {
    return this.http.post<Carrito>(this.base, {}, this.paramsWithToken()).pipe(
      catchError((error) => {
        if (this.isDuplicateTokenError(error)) {
          // Si hay error de token duplicado, obtener el carrito existente
          return this.getExistingCart();
        }
        return throwError(error);
      })
    );
  }

  private getExistingCart(): Observable<Carrito> {
    return this.http.get<Carrito>(this.base, this.paramsWithToken()).pipe(
      catchError((error) => {
        console.error('Error obteniendo carrito existente:', error);
        return throwError(error);
      })
    );
  }

  private isDuplicateTokenError(error: any): boolean {
    return error.status === 500 && 
           error.error?.message?.includes('Duplicate entry') &&
           error.error?.message?.includes('uk_carrito_token');
  }

  get(): Observable<Carrito> {
    return this.http.get<Carrito>(this.base, this.paramsWithToken());
  }

  addItem(libroId: number, cantidad: number): Observable<Carrito> {
    const body = { libroId, cantidad };
    return this.http.post<Carrito>(
      `${this.base}/items`,
      body,
      this.paramsWithToken()
    );
  }

  updateItem(carritoItemId: number, cantidad: number): Observable<Carrito> {
    const body = { cantidad };
    return this.http.put<Carrito>(
      `${this.base}/items/${carritoItemId}`,
      body,
      this.paramsWithToken()
    );
  }

  removeItem(carritoItemId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/items/${carritoItemId}`,
      this.paramsWithToken()
    );
  }

  clear(): Observable<void> {
    return this.http.delete<void>(`${this.base}/clear`, this.paramsWithToken());
  }
}