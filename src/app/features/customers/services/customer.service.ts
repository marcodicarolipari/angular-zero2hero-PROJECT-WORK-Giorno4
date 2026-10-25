import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Customer } from '../models/customer.model';

const MOCK_CUSTOMERS: Customer[] = [
  { id: 1, firstName: 'Marco', lastName: 'Rossi', fiscalCode: 'RSSMRC85M01H501Z', accountType: 'PRIVATE' },
  { id: 2, firstName: 'Giulia', lastName: 'Bianchi', fiscalCode: 'BNCGLI90A41F205X', accountType: 'PRIVATE' },
  { id: 3, firstName: 'Luca', lastName: 'Esposito', fiscalCode: 'SPSLCU78C15F839K', accountType: 'BUSINESS' },
  { id: 4, firstName: 'Francesca', lastName: 'Romano', fiscalCode: 'RMNFNC92D50H501T', accountType: 'PRIVATE' },
  { id: 5, firstName: 'Alessandro', lastName: 'Colombo', fiscalCode: 'CLMLSN80E10F205W', accountType: 'BUSINESS' },
  { id: 6, firstName: 'Sara', lastName: 'Ricci', fiscalCode: 'RCCSRA95H55L219P', accountType: 'PRIVATE' },
  { id: 7, firstName: 'Davide', lastName: 'Marino', fiscalCode: 'MRNDVD88L20G273B', accountType: 'BUSINESS' },
  { id: 8, firstName: 'Chiara', lastName: 'Greco', fiscalCode: 'GRCCHR91P60D612N', accountType: 'PRIVATE' },
  { id: 9, firstName: 'Matteo', lastName: 'Conti', fiscalCode: 'CNTMTT83S12A662H', accountType: 'PRIVATE' },
  { id: 10, firstName: 'Elena', lastName: 'De Luca', fiscalCode: 'DLCLNE87T48F839Y', accountType: 'BUSINESS' },
];

@Injectable({ providedIn: 'root' })
export class CustomerService {
  search(term: string): Observable<Customer[]> {
    const q = term.trim().toLowerCase();
    const results = q
      ? MOCK_CUSTOMERS.filter((c) =>
          `${c.firstName} ${c.lastName} ${c.fiscalCode}`.toLowerCase().includes(q),
        )
      : MOCK_CUSTOMERS;
    return of(results).pipe(delay(500));
  }
}
