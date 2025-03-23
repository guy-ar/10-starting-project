import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {

  places = signal<Place[] | undefined>(undefined);
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  ngOnInit(): void {
    const placesSub = this.httpClient.get<{places: Place[]}>('http://localhost:3000/places').subscribe(
      {
        next: (response) => {
          console.log(response.places);
        }
      }
    );
    this.destroyRef.onDestroy(() =>
      placesSub.unsubscribe()
    );
  }
}
