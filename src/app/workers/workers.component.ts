import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { WorkerService } from '../service/worker.service';
import { BehaviorSubject, Observable, catchError, map, of, startWith, tap } from 'rxjs';
import { AppState } from '../interface/app-state';
import { CustomResponse } from '../interface/custom-response';
import { DataState } from '../enum/data-state.enum';
import { Job } from '../enum/job.enum';
import { Worker } from '../interface/worker';

@Component({
  selector: 'app-workers',
  templateUrl: './workers.component.html',
  styleUrls: ['./workers.component.css']
})
export class WorkersComponent implements OnInit {
  appState$: Observable<AppState<CustomResponse>>;
  readonly DataState = DataState;
  readonly Job = Job;
  private filterSubject = new BehaviorSubject<string>('');
  private dataSubject = new BehaviorSubject<CustomResponse>(null);
  filterStatus$ = this.filterSubject.asObservable();
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();

  constructor(private workerService: WorkerService) { }

  ngOnInit(): void {
    this.appState$ = this.workerService.workers$
      .pipe(
        tap(response => this.dataSubject.next(response)),
        map(response => {
          return { dataState: DataState.LOADED_STATE, appData: { ...response, data: { workers: response.data.workers.reverse() } } }
        }),
        startWith({ dataState: DataState.LOADING_STATE }),
        catchError((error: string) => {
          return of({ dataState: DataState.ERROR_STATE, error });
        })
      );
  }

  saveWorker(workerForm: NgForm): void {
    this.isLoading.next(true);
    this.appState$ = this.workerService.save$(workerForm.value as Worker)
      .pipe(
        map(response => {
          this.dataSubject.next(
            { ...response, data: { workers: [response.data.worker, ...this.dataSubject.value.data.workers] } }
          );
          document.getElementById('closeModal').click();
          this.isLoading.next(false);
          workerForm.resetForm({});
          return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
        }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
        catchError((error: string) => {
          this.isLoading.next(false);
          return of({ dataState: DataState.ERROR_STATE, error });
        })
      );
  }

  filterWorkers(job: Job): void {
    this.appState$ = this.workerService.filter$(job, this.dataSubject.value)
      .pipe(
        map(response => {
          return { dataState: DataState.LOADED_STATE, appData: response }
        }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
        catchError((error: string) => {
          return of({ dataState: DataState.ERROR_STATE, error });
        })
      );
  }

  deleteWorker(worker: Worker): void {
    this.appState$ = this.workerService.delete$(worker.id)
      .pipe(
        map(response => {
          this.dataSubject.next(
              {...response, data: 
                { workers: this.dataSubject.value.data.workers.filter(w => w.id !== worker.id) }}
          );
          return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
        }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
        catchError((error: string) => {
          return of({ dataState: DataState.ERROR_STATE, error });
        })
      );
  }

  printReport(): void {
    let dataType = 'application/vnd.ms-excel.sheet.macroEnabled.12';
    let tableSelect = document.getElementById('workers');
    let tableHtml = tableSelect.outerHTML.replace(/ /g, '%20');
    let downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);
    downloadLink.href = 'data:' + dataType + ', ' + tableHtml;
    downloadLink.download = 'worker-report.xls';
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}
