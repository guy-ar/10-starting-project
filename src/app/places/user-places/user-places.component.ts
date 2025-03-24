import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit{
  private placesService = inject(PlacesService);
  private destroyRef = inject(DestroyRef);
  // instead of using the signal directly from the service
  // we will use the signal here and update it with the data from the service
  //places = signal<Place[] | undefined>(undefined);
  places = this.placesService.loadedUserPlaces;
  isLoading = signal<boolean>(false);
  error = signal<string | undefined>(undefined);
  
  ngOnInit(): void {
    this.isLoading.set(true);
    const placesSub = this.placesService.loadUserPlaces()
    .subscribe(
      {
        // no need to continue fetch the data, but handle only error and complete
        // while data will be retreived directly from the service
        // next: (places) => {
        //   this.places.set(places);
        // },
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
