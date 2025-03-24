import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesService } from '../places.service';

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

  private destroyRef = inject(DestroyRef);
  private placesService = inject(PlacesService);
  ngOnInit(): void {
    this.isLoading.set(true);
    const placesSub = this.placesService.loadAvailablePlaces().subscribe(
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

  onSelectPlace(place: Place) {
    console.log(place);
    const selectPlacesSub = this.placesService.addPlaceToUserPlaces(place).subscribe({
      next: (response) => {
        console.log(response);
      }
    });

    this.destroyRef.onDestroy(() =>
      selectPlacesSub.unsubscribe()
    );
  }
}
