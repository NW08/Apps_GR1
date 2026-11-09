import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface GalleryItem {
  label: string;
  url: string;
}

export interface PokemonSpritesResult {
  main: string;
  gif: string | null;
  webp: string | null;
  gallery: GalleryItem[];
  raw: any;
}

@Injectable({
  providedIn: 'root',
})
export class Pokemon {
  private readonly http = inject(HttpClient);
  private readonly url = 'https://pokeapi.co/api/v2';

  getPokemons(limit: number = 20, offset: number = 0): Observable<any> {
    return this.http.get(`${this.url}/pokemon?limit=${limit}&offset=${offset}`);
  }

  pokemonDetails(nameOrId: string): Observable<any> {
    return this.http.get(`${this.url}/pokemon/${nameOrId}`);
  }

  pokemonAbilities(nameOrId: string): Observable<any> {
    return this.http.get(`${this.url}/ability/${nameOrId}`);
  }

  pokemonSpecies(nameOrId: string): Observable<any> {
    return this.http.get(`${this.url}/pokemon-species/${nameOrId}`);
  }

  pokemonSprites(nameOrId: string): Observable<PokemonSpritesResult> {
    return this.pokemonDetails(nameOrId).pipe(
      map((details) => {
        const sprites = details.sprites || {};
        const other = sprites.other || {};
        const official = other['official-artwork'] || {};
        const showdown = other.showdown || {};
        const home = other.home || {};
        const gen5 = sprites.versions?.['generation-v']?.['black-white']?.animated || {};

        const candidates: { label: string; url?: string | null }[] = [
          { label: 'Oficial', url: official.front_default },
          { label: 'Oficial Shiny', url: official.front_shiny },
          { label: '3D Home', url: home.front_default },
          { label: '3D Home Shiny', url: home.front_shiny },
          { label: 'Frente', url: sprites.front_default },
          { label: 'Espalda', url: sprites.back_default },
          { label: 'Shiny Frente', url: sprites.front_shiny },
          { label: 'Shiny Espalda', url: sprites.back_shiny },
          { label: 'Showdown', url: showdown.front_default },
          { label: 'Showdown Shiny', url: showdown.front_shiny },
          { label: 'Dream World', url: other.dream_world?.front_default },
          { label: 'Gen 5 Animado', url: gen5.front_default },
          { label: 'Femenino', url: sprites.front_female },
          { label: 'Femenino Shiny', url: sprites.front_shiny_female },
        ];

        const gallery: GalleryItem[] = candidates
          .filter((item): item is { label: string; url: string } => Boolean(item.url))
          .map((item) => ({ label: item.label, url: item.url }));

        const gif = showdown.front_default || gen5.front_default || null;
        const webp = showdown.front_default || official.front_default || null;

        const main = official.front_default || sprites.front_default || home.front_default || '';

        return {
          main,
          gif,
          webp,
          gallery,
          raw: sprites,
        };
      }),
    );
  }

  pokemonType(nameOrId: string): Observable<any> {
    return this.http.get(`${this.url}/type/${nameOrId}`);
  }

  pokemonEvolutionChain(nameOrId: string): Observable<any> {
    return this.http.get(`${this.url}/evolution-chain/${nameOrId}`);
  }

  pokemonItems(nameOrId: string): Observable<any> {
    return this.http.get(`${this.url}/item/${nameOrId}`);
  }

  pokemonSound(audioUrl?: string | null): void {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch((err) => console.warn('Error al reproducir audio:', err));
    }
  }
}
