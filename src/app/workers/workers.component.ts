import { Component, OnInit } from '@angular/core';
import { WorkerService } from '../service/worker.service';
import { BehaviorSubject, Observable, catchError, map, of, startWith } from 'rxjs';
import { AppState } from '../interface/app-state';
import { CustomResponse } from '../interface/custom-response';
import { DataState } from '../enum/data-state.enum';
import { Job } from '../enum/job.enum';

@Component({
  selector: 'app-workers',
  templateUrl: './workers.component.html',
  styleUrls: ['./workers.component.css']
})
export class WorkersComponent {
  appState$: Observable<AppState<CustomResponse>>;
  readonly DataState = DataState;
  readonly Job = Job;
  private filterSubject = new BehaviorSubject<string>('');
  filterStatus$ = this.filterSubject.asObservable();

  constructor(private workerService: WorkerService) { }

  ngOnInit(): void {
    this.appState$ = this.workerService.workers$
      .pipe(
        map(response => {
          return { dataState: DataState.LOADED_STATE, appData: response }
        }),
        startWith({ dataState: DataState.LOADING_STATE }),
        catchError((error: string) => {
          return of({ dataState: DataState.ERROR_STATE, error })
        })
      );
  }
}
