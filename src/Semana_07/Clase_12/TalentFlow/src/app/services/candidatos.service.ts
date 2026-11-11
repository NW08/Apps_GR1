import { Injectable } from '@angular/core';
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { Candidato } from '../models/candidato.model';

@Injectable({
  providedIn: 'root'
})
export class CandidatosService {
  private app = getApps().length ? getApp() : initializeApp(environment.firebase);
  private db = getFirestore(this.app);
  private coleccionRef = collection(this.db, 'candidatos');

  /**
   * Guarda un nuevo candidato en Firestore con timestamp del servidor
   */
  async guardarCandidato(candidato: Omit<Candidato, 'id' | 'creadoEn'>): Promise<string> {
    const docRef = await addDoc(this.coleccionRef, {
      ...candidato,
      creadoEn: serverTimestamp()
    });
    return docRef.id;
  }

  /**
   * Obtiene la lista completa de candidatos desde Firestore
   */
  async obtenerCandidatos(): Promise<Candidato[]> {
    try {
      const q = query(this.coleccionRef, orderBy('creadoEn', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Candidato, 'id'>)
      }));
    } catch {
      // Fallback si los documentos iniciales no tienen creadoEn o mientras se propaga el índice
      const snapshot = await getDocs(this.coleccionRef);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Candidato, 'id'>)
      }));
    }
  }

  /**
   * Obtiene un candidato por su ID de documento en Firestore
   */
  async obtenerCandidatoPorId(id: string): Promise<Candidato | null> {
    const docRef = doc(this.db, 'candidatos', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }
    return {
      id: docSnap.id,
      ...(docSnap.data() as Omit<Candidato, 'id'>)
    };
  }
}

