export type AccountType = 'PRIVATE' | 'BUSINESS';

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  fiscalCode: string;
  accountType: AccountType;
}

export interface CustomerSearchVM {
  results: Customer[];
  isLoading: boolean;
}
