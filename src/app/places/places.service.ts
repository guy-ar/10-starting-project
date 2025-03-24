import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);
  httpClient = inject(HttpClient);
  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.retrievePlaces('http://localhost:3000/places', 'fetching available places');
  }

  loadUserPlaces() {
    return this.retrievePlaces('http://localhost:3000/user-places', 'fetching favorite places');

  }

  addPlaceToUserPlaces(userPlace: Place) {
    return this.httpClient.put('http://localhost:3000/user-places', {placeId: userPlace.id})
  }

  removeUserPlace(place: Place) {}

  retrievePlaces(url: string, errorMessage: string) {
    return this.httpClient.get<{places: Place[]}>(url)
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
            return new Error('An error occurred while ' + errorMessage);
          }
          if (error.status === 404) {
            return new Error('No places found for ' + errorMessage);
          }
          if (error.status === 401) {
            return new Error('An error occurred for unauthorized user, when fetching ' + errorMessage); 
          }
          if (error.status === 400) {
            return new Error('Bad Request error occurred for fetching ' + errorMessage);
          }
          return new Error('An error occurred');
        }
        );
      })
    )

  }
}
