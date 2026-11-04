import { Component, inject, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonCol,
  IonRow,
  IonGrid,
  IonImg,
  ActionSheetController,
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import { camera, trash, close, cameraOutline } from 'ionicons/icons';
import { PhotoService, userPhoto } from '../services/photo.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonCol,
    IonRow,
    IonGrid,
    IonImg,
  ],
})
export class Tab2Page implements OnInit {
  public photoService = inject(PhotoService);
  private actionSheetController = inject(ActionSheetController);

  constructor() {
    addIcons({ camera, trash, close, cameraOutline });
  }

  async ngOnInit() {
    await this.photoService.loadSaved();
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  public async showActionSheet(photo: userPhoto, position: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Opciones de la foto',
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.photoService.deletePicture(photo, position);
          },
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }
}
