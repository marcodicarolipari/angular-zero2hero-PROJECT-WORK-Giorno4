// app/features/branches/services/branch.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, delay, of, throwError } from 'rxjs';
import { Branch } from '../models/branch.model';

@Injectable({ providedIn: 'root' })
export class BranchService {
  // inject() — no constructor (pattern moderno Angular 14+)
  private readonly http = inject(HttpClient);

  private readonly apiUrl = '/api/branches/search';

  searchBranches(term: string): Observable<Branch[]> {
    const query = term.trim();
    if (!query) return of([]);

    return this.http.get<Branch[]>(this.apiUrl, { params: { query } }).pipe(
      delay(400), // simula latenza HTTP per vedere il loading
      catchError((err) => {
        console.error('[BranchService] searchBranches failed', err);
        return throwError(() => err); // propaga — gestito nel componente con catchError
      }),
    );
  }
}
