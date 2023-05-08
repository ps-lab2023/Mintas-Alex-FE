import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subscriber, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { CustomResponse } from '../interface/custom-response';
import { Job } from '../enum/job.enum';
import { Worker } from '../interface/worker';

@Injectable({ providedIn: 'root' })
export class WorkerService {
  private readonly apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  workers$ = <Observable<CustomResponse>>
    this.http.get<CustomResponse>(`${this.apiUrl}/worker/getWorkers`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  save$ = (worker: Worker) => <Observable<CustomResponse>>
    this.http.post<CustomResponse>(`${this.apiUrl}/worker/saveWorker`, worker)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  filter$ = (job: Job, response: CustomResponse) => <Observable<CustomResponse>>
    new Observable<CustomResponse>(
      subscriber => {
        console.log(response);
        subscriber.next(
          job === Job.ALL ? { ...response, message: `Workers filtered by ${job} job` } :
            {
              ...response,
              message: response.data.workers
                .filter(worker => worker.job === job).length > 0 ? `Workers filtered by ${job} job` : `No workers of ${job} found`,
              data: {
                workers: response.data.workers
                  .filter(worker => worker.job === job)
              }
            }
        );
        subscriber.complete();
      }
    )
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  delete$ = (workerId: number) => <Observable<CustomResponse>>
    this.http.delete<CustomResponse>(`${this.apiUrl}/worker/deleteWorker/${workerId}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError(() => new Error(`An error occurred - Error code: ${error.status}`));
  }
}
