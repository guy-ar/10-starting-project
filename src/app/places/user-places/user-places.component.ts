import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError } from 'rxjs';
import { Place } from '../place.model';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit{
  places = signal<Place[] | undefined>(undefined);
    isLoading = signal<boolean>(false);
    error = signal<string | undefined>(undefined);
    
    private httpClient = inject(HttpClient);
    private destroyRef = inject(DestroyRef);
    ngOnInit(): void {
      this.isLoading.set(true);
      const placesSub = this.httpClient.get<{places: Place[]}>('http://localhost:3000/user-places')
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
              return new Error('An error occurred while fetching your favorite places');
            }
            if (error.status === 404) {
              return new Error('No places found');
            }
            if (error.status === 401) {
              return new Error('An error occurred for unauthorized user'); 
            }
            if (error.status === 400) {
              return new Error('Bad Request error occurred for fetching your favorite places');
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
