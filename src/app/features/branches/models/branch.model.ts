// app/features/branches/models/branch.model.ts
export interface Branch {
  id:          string;
  name:        string;
  city:        string;
  address:     string;
  zipCode:     string;
  distanceKm?: number;
}

export interface BranchSearchVM {
  term:      string;
  results:   Branch[];
  isLoading: boolean;
  error:     string | null;
}

export const INITIAL_BRANCH_VM: BranchSearchVM = {
  term:      '',
  results:   [],
  isLoading: false,
  error:     null,
};