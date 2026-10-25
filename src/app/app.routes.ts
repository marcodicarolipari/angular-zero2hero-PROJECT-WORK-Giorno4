import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'branches', pathMatch: 'full' },
  {
    path: 'customers',
    loadComponent: () =>
      import(
        './features/customers/components/customer-search/customer-search.component'
      ).then((m) => m.CustomerSearchComponent),
  },
  {
    path: 'branches',
    loadComponent: () =>
      import(
        './features/branches/components/branch-search/branch-search.component'
      ).then((m) => m.BranchSearchComponent),
  },
];
