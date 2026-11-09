import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonAvatar,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonLabel,
  IonProgressBar,
  IonRow,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  closeOutline,
  flameOutline,
  flashOutline,
  heartOutline,
  imagesOutline,
  playOutline,
  refreshOutline,
  shieldOutline,
  sparklesOutline,
  speedometerOutline,
  statsChartOutline,
  swapHorizontalOutline,
  trophyOutline,
  videocamOutline,
  volumeHigh,
} from 'ionicons/icons';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import type { GalleryItem } from '../services/pokemon';
import { Pokemon } from '../services/pokemon';

export interface PokemonStat {
  name: string;
  value: number;
  normalized: number;
}

export interface PokemonViewData {
  id: number;
  name: string;
  image: string;
  gallery: GalleryItem[];
  gif: string | null;
  webp: string | null;
  types: string[];
  stats: PokemonStat[];
  height: number;
  weight: number;
  cry?: string | null;
  description: string;
}

export interface FighterData {
  id: number;
  name: string;
  image: string;
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  totalStats: number;
  height: number;
  weight: number;
  cry?: string | null;
  types: string[];
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonAvatar,
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonChip,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonLabel,
    IonProgressBar,
    IonRow,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
    IonText,
    IonTitle,
    IonToolbar,
  ],
})
export class HomePage implements OnInit {
  private readonly pokemon = inject(Pokemon);

  seccionActiva = 'pokedex';

  pokemonList: { name: string; url: string }[] = [];
  thisPokemon: PokemonViewData | null = null;
  isLoading = false;
  errorMessage = '';
  selectedImage = '';
  showingGif = false;

  luchador1: FighterData | null = null;
  luchador2: FighterData | null = null;
  cargandoLuchador1 = false;
  cargandoLuchador2 = false;
  resultadoBatalla: string | null = null;
  ganador: FighterData | null = null;
  peleando = false;

  readonly sugerenciasPelea = [
    'pikachu',
    'charizard',
    'mewtwo',
    'gengar',
    'lucario',
    'blastoise',
    'eevee',
    'dragonite',
  ];

  constructor() {
    addIcons({
      closeOutline,
      alertCircleOutline,
      volumeHigh,
      trophyOutline,
      flameOutline,
      refreshOutline,
      imagesOutline,
      videocamOutline,
      flashOutline,
      shieldOutline,
      heartOutline,
      speedometerOutline,
      sparklesOutline,
      playOutline,
      swapHorizontalOutline,
      statsChartOutline,
    });
  }

  ngOnInit(): void {
    this.cargarListaInicial();
  }

  cargarListaInicial(): void {
    this.isLoading = true;
    this.pokemon.getPokemons(20, 0).subscribe({
      next: (res) => {
        this.pokemonList = res.results || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  cambiarSeccion(event: CustomEvent): void {
    const valor = event.detail?.value;
    if (typeof valor === 'string') {
      this.seccionActiva = valor;
    }
  }

  buscarPokemon(event: CustomEvent | { target: { value: string } }): void {
    const target = event.target as HTMLInputElement | null;
    const texto = target?.value ? target.value.toLowerCase().trim() : '';
    this.errorMessage = '';

    if (!texto) {
      this.thisPokemon = null;
      return;
    }

    this.isLoading = true;

    forkJoin({
      details: this.pokemon.pokemonDetails(texto).pipe(catchError(() => of(null))),
      species: this.pokemon.pokemonSpecies(texto).pipe(catchError(() => of(null))),
      spritesData: this.pokemon.pokemonSprites(texto).pipe(catchError(() => of(null))),
    }).subscribe(({ details, species, spritesData }) => {
      this.isLoading = false;

      if (!details) {
        this.thisPokemon = null;
        this.errorMessage = 'Pokémon no encontrado. Intenta con otro nombre o ID.';
        return;
      }

      let description = 'Descripción no disponible.';
      if (species) {
        const entry =
          species.flavor_text_entries?.find((f: any) => f.language.name === 'es') ||
          species.flavor_text_entries?.find((f: any) => f.language.name === 'en');
        if (entry) {
          description = entry.flavor_text.replace(/[\n\f]/g, ' ');
        }
      }

      const gallery = spritesData?.gallery || [];
      const gifUrl = spritesData?.gif || null;
      const webpUrl = spritesData?.webp || null;
      const mainImage =
        spritesData?.main ||
        details.sprites?.other?.['official-artwork']?.front_default ||
        details.sprites?.front_default ||
        '';

      this.thisPokemon = {
        id: details.id,
        name: details.name,
        image: mainImage,
        gallery,
        gif: gifUrl,
        webp: webpUrl,
        types: (details.types || []).map((t: any) => t.type.name),
        stats: (details.stats || []).map((s: any) => ({
          name: s.stat.name,
          value: s.base_stat,
          normalized: Math.min(1, s.base_stat / 255),
        })),
        height: (details.height || 0) / 10,
        weight: (details.weight || 0) / 10,
        cry: details.cries?.latest || details.cries?.legacy || null,
        description,
      };

      this.selectedImage = mainImage;
      this.showingGif = false;
    });
  }

  verDetalleDeLista(name: string): void {
    this.buscarPokemon({ target: { value: name } });
  }

  seleccionarImagenGaleria(url: string): void {
    this.selectedImage = url;
    this.showingGif = false;
  }

  alternarGif(): void {
    this.showingGif = !this.showingGif;
  }

  reproducirSonido(audioUrl?: string | null): void {
    const sonido = audioUrl || this.thisPokemon?.cry;
    if (sonido) {
      this.pokemon.pokemonSound(sonido);
    }
  }

  cerrarDetalle(): void {
    this.thisPokemon = null;
  }

  cargarLuchador(posicion: 1 | 2, nombreOId: string): void {
    const texto = nombreOId.toLowerCase().trim();
    if (!texto) return;

    if (posicion === 1) this.cargandoLuchador1 = true;
    else this.cargandoLuchador2 = true;

    this.resultadoBatalla = null;
    this.ganador = null;

    this.pokemon
      .pokemonDetails(texto)
      .pipe(catchError(() => of(null)))
      .subscribe((details) => {
        if (posicion === 1) this.cargandoLuchador1 = false;
        else this.cargandoLuchador2 = false;

        if (!details) return;

        const getStat = (statName: string): number =>
          details.stats?.find((s: any) => s.stat.name === statName)?.base_stat || 50;

        const hp = getStat('hp');
        const attack = getStat('attack');
        const defense = getStat('defense');
        const specialAttack = getStat('special-attack');
        const specialDefense = getStat('special-defense');
        const speed = getStat('speed');
        const totalStats = hp + attack + defense + specialAttack + specialDefense + speed;

        const luchador: FighterData = {
          id: details.id,
          name: details.name,
          image:
            details.sprites?.other?.showdown?.front_default ||
            details.sprites?.other?.['official-artwork']?.front_default ||
            details.sprites?.front_default ||
            '',
          hp,
          attack,
          defense,
          specialAttack,
          specialDefense,
          speed,
          totalStats,
          height: (details.height || 0) / 10,
          weight: (details.weight || 0) / 10,
          cry: details.cries?.latest || details.cries?.legacy || null,
          types: (details.types || []).map((t: any) => t.type.name),
        };

        if (posicion === 1) {
          this.luchador1 = luchador;
        } else {
          this.luchador2 = luchador;
        }
      });
  }

  iniciarPelea(): void {
    if (!this.luchador1 || !this.luchador2) return;

    this.peleando = true;
    this.resultadoBatalla = null;
    this.ganador = null;

    setTimeout(() => {
      this.peleando = false;
      if (!this.luchador1 || !this.luchador2) return;

      const poder1 =
        this.luchador1.hp * 1.0 +
        this.luchador1.attack * 1.3 +
        this.luchador1.specialAttack * 1.3 +
        this.luchador1.defense * 1.1 +
        this.luchador1.specialDefense * 1.1 +
        this.luchador1.speed * 1.2;

      const poder2 =
        this.luchador2.hp * 1.0 +
        this.luchador2.attack * 1.3 +
        this.luchador2.specialAttack * 1.3 +
        this.luchador2.defense * 1.1 +
        this.luchador2.specialDefense * 1.1 +
        this.luchador2.speed * 1.2;

      if (poder1 > poder2) {
        this.ganador = this.luchador1;
        this.resultadoBatalla = `¡${this.luchador1.name.toUpperCase()} es el vencedor! Su ofensiva combinada superó a ${this.luchador2.name.toUpperCase()}.`;
        this.reproducirSonido(this.luchador1.cry);
      } else if (poder2 > poder1) {
        this.ganador = this.luchador2;
        this.resultadoBatalla = `¡${this.luchador2.name.toUpperCase()} es el vencedor! Su potencia superior venció a ${this.luchador1.name.toUpperCase()}.`;
        this.reproducirSonido(this.luchador2.cry);
      } else {
        this.ganador = null;
        this.resultadoBatalla = '¡INCREÍBLE! Ha sido un empate total entre ambos luchadores.';
      }
    }, 1200);
  }

  reiniciarPelea(): void {
    this.luchador1 = null;
    this.luchador2 = null;
    this.resultadoBatalla = null;
    this.ganador = null;
  }
}
