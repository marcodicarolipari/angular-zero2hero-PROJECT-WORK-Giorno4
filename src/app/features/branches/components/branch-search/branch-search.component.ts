// app/features/branches/components/branch-search/branch-search.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  Observable,
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  merge,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { BranchService } from '../../services/branch.service';
import {
  Branch,
  BranchSearchVM,
  INITIAL_BRANCH_VM,
} from '../../models/branch.model';

@Component({
  selector: 'app-branch-search',
  standalone: true,
  imports: [ReactiveFormsModule],
  // Con toSignal() non serve AsyncPipe nel template — il Signal si legge con vm()
  // Con @if/@for non serve NgIf/NgFor/CommonModule
  templateUrl: './branch-search.component.html',
  styleUrl: './branch-search.component.scss', // singolare (Angular 17+)
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchSearchComponent {
  // === DEPENDENCY INJECTION con inject() ===
  private readonly branchService = inject(BranchService);
  private readonly destroyRef = inject(DestroyRef); // per takeUntilDestroyed

  // === INPUT UTENTE ===
  readonly searchControl = new FormControl<string>('', { nonNullable: true });

  // Subject per ricerche manuali (Enter / click lente)
  // merge() combina i due stream in uno solo — entrambi scatenano una ricerca
  private readonly manualSearch$ = new Subject<string>();

  // === STREAM DI INPUT UNIFICATO ===
  // merge(): unisce valueChanges (ogni tasto) con manualSearch$ (Enter/click)
  // startWith(''): emette subito il valore corrente (gestisce il primo render)
  private readonly searchTerm$ = merge(
    this.searchControl.valueChanges,
    this.manualSearch$,
  ).pipe(
    startWith(this.searchControl.value), // emissione iniziale
    debounceTime(300), // aspetta 300ms di silenzio
    map((term) => term.trim()), // rimuove spazi iniziali/finali
    distinctUntilChanged(), // ignora se il valore non è cambiato
    filter((term) => term.length === 0 || term.length >= 2), // min 2 char o reset
    // takeUntilDestroyed: completa lo stream quando il componente viene distrutto
    // SENZA bisogno di ngOnDestroy — Angular 16+
    takeUntilDestroyed(this.destroyRef),
  );

  // === VIEWMODEL OBSERVABLE ===
  // switchMap: per ogni nuovo termine, CANCELLA lo stream precedente e avvia uno nuovo
  // Questo previene race condition: se "Mi" risponde dopo "Milano",
  // la risposta di "Mi" è già stata cancellata da switchMap
  private readonly vm$ = this.searchTerm$.pipe(
    switchMap((term): Observable<BranchSearchVM> => {
      // Termine vuoto → stato "reset" senza chiamate HTTP
      if (!term) {
        return of(INITIAL_BRANCH_VM);
      }

      // startWith emette SUBITO lo stato di loading, prima che la HTTP risponda
      // Questo fa apparire lo spinner istantaneamente, senza aspettare la risposta
      const loadingState: BranchSearchVM = {
        term,
        results: [],
        isLoading: true,
        error: null,
      };

      return this.branchService.searchBranches(term).pipe(
        map(
          (results): BranchSearchVM => ({
            term,
            results,
            isLoading: false,
            error: null,
          }),
        ),
        startWith(loadingState), // ← emette loading, poi sovrascrive con i risultati
        // catchError: intercetta errori HTTP e li trasforma in stato di errore
        // IMPORTANTE: non propaga l'errore — il vm$ rimane attivo per la prossima ricerca
        catchError(
          (): Observable<BranchSearchVM> =>
            of({
              term,
              results: [],
              isLoading: false,
              error: 'Impossibile recuperare le filiali. Riprova più tardi.',
            }),
        ),
      );
    }),
  );

  // === toSignal(): converte vm$ Observable in Signal ===
  // - initialValue: il valore prima che vm$ emetta (evita undefined)
  // - cleanup automatico tramite DestroyRef — nessun takeUntilDestroyed su vm$ necessario
  // - Il Signal si usa nel template come: vm().results, vm().isLoading, ecc.
  readonly vm = toSignal(this.vm$, { initialValue: INITIAL_BRANCH_VM });

  // === HANDLER per ricerca manuale ===
  onManualSearch(): void {
    const term = this.searchControl.value;
    this.manualSearch$.next(term);
  }
}
