import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);
  httpClient = inject(HttpClient);
  // readonly signal that will hold the user places and exposed outside to pther components 
  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.retrievePlaces('http://localhost:3000/places', 'fetching available places');
  }

  loadUserPlaces() {
    return this.retrievePlaces('http://localhost:3000/user-places', 'fetching favorite places')
    .pipe(
      // possible to use tap to perform side effect - even if we already have pipe in other place
      // tap will allow to perform side effect without changing the response
      // in the other components we will remove next, and instead use this copy of user places
      tap({
        next: (places) =>{
          this.userPlaces.set(places);
        }
      })
    );

  }

  addPlaceToUserPlaces(userPlace: Place) {
    // update the user places signal with the new place
    // this.userPlaces.update((prevPlaces) => 
    //   [...prevPlaces, userPlace]
    // );
    // improve - optimictic approach - in case of error revert back the changes
    //and prevent adding same place twice
    const prevPlaces = this.userPlaces();
    if (!prevPlaces.some((place) => place.id === userPlace.id)) {
      // only if not found add the place
      this.userPlaces.set([...prevPlaces, userPlace]);
    }
    
    return this.httpClient.put('http://localhost:3000/user-places', {placeId: userPlace.id})
    .pipe(
      catchError((error) => {
        // in case of error revert back the changes
        this.userPlaces.set(prevPlaces);
        return throwError(() =>{          
           new Error('An error occurred while adding place to user places');
        });
      })
    );
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
