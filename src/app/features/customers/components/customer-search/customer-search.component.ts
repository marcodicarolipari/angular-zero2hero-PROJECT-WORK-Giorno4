import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  Observable,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  startWith,
  switchMap,
} from 'rxjs';
import { CustomerSearchVM } from '../../models/customer.model';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-customer-search',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './customer-search.component.html',
  styleUrl: './customer-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerSearchComponent {
  private readonly customerService = inject(CustomerService);

  readonly searchControl = new FormControl<string>('', { nonNullable: true });

  private readonly vm$ = this.searchControl.valueChanges.pipe(
    startWith(''),
    debounceTime(300),
    distinctUntilChanged(),
    filter((term) => term.length >= 2 || term === ''),
    switchMap(
      (term): Observable<CustomerSearchVM> =>
        this.customerService.search(term).pipe(
          map((results) => ({ results, isLoading: false })),
          startWith({ results: [], isLoading: true }),
        ),
    ),
  );

  readonly vm = toSignal(this.vm$, {
    initialValue: { results: [], isLoading: true } as CustomerSearchVM,
  });
}
