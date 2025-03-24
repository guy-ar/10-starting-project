import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { catchError, map, pipe, throwError } from 'rxjs';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {

  places = signal<Place[] | undefined>(undefined);
  isLoading = signal<boolean>(false);
  error = signal<string | undefined>(undefined);
  
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  ngOnInit(): void {
    this.isLoading.set(true);
    const placesSub = this.httpClient.get<{places: Place[]}>('http://localhost:3000/places')
    .pipe(
      // for demo purpose use map to convert response to places[]
      map((responseDate) => {
        console.log(responseDate);
        return responseDate.places}
      ),
      catchError((error) => {
        // for demo purpose use catchError to catch error
        // and then throw new Error object with relevant message 
        // basaed on different status code  
        console.log(error);
        return throwError(() => {
          if (error.status === 500) {
            return new Error('An error occurred while fetching places');
          }
          if (error.status === 404) {
            return new Error('No places found');
          }
          if (error.status === 401) {
            return new Error('An error occurred for unauthorized user'); 
          }
          if (error.status === 400) {
            return new Error('Bad Requesterror occurred for');
          }
          return new Error('An error occurred');
        }
        );
      })
    )
    .subscribe(
      {
        next: (places) => {
          this.places.set(places);
        },
        complete: () => {
          // in complete - for sue no more data is received from observable
          this.isLoading.set(false);
        },
        error: (error: Error) => {
          //in error - get the response error
          console.log(error);
          this.isLoading.set(false);
          this.error.set(error.message);
        }
      }
    );
    this.destroyRef.onDestroy(() =>
      placesSub.unsubscribe()
    );
  }
}
