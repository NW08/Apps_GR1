import { Injectable } from '@angular/core';
import { getApp, getApps, initializeApp } from 'firebase/app';
import type { DocumentSnapshot } from 'firebase/firestore';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { environment } from '../../environments/environment';
import type { Candidato, CandidatoForm } from '../models/candidato.model';

const COLECCION = 'candidatos';

/** Encapsula todas las operaciones de Cloud Firestore sobre la colección `candidatos`. */
@Injectable({
  providedIn: 'root',
})
export class CandidatosService {
  private readonly app = getApps().length ? getApp() : initializeApp(environment.firebase);
  private readonly db = getFirestore(this.app);
  private readonly coleccionRef = collection(this.db, COLECCION);

  /** Crea un documento nuevo con la marca de creación del servidor. Devuelve el id generado. */
  async guardarCandidato(candidato: CandidatoForm): Promise<string> {
    const docRef = await addDoc(this.coleccionRef, {
      ...candidato,
      creadoEn: serverTimestamp(),
    });
    return docRef.id;
  }

  /** Lista los candidatos ordenados por fecha de registro, del más reciente al más antiguo. */
  async obtenerCandidatos(): Promise<Candidato[]> {
    const snapshot = await getDocs(query(this.coleccionRef, orderBy('creadoEn', 'desc')));
    return snapshot.docs.map(aCandidato);
  }

  /** Obtiene un candidato por el id de su documento; `null` si no existe. */
  async obtenerCandidatoPorId(id: string): Promise<Candidato | null> {
    const docSnap = await getDoc(doc(this.db, COLECCION, id));
    return docSnap.exists() ? aCandidato(docSnap) : null;
  }

  /** Reemplaza los datos del formulario, conserva `creadoEn` y registra `actualizadoEn`. */
  async actualizarCandidato(id: string, candidato: CandidatoForm): Promise<void> {
    await updateDoc(doc(this.db, COLECCION, id), {
      ...candidato,
      actualizadoEn: serverTimestamp(),
    });
  }
}

function aCandidato(docSnap: DocumentSnapshot): Candidato {
  const data = docSnap.data() as Omit<Candidato, 'id'>;
  return { ...data, id: docSnap.id, creadoEn: data.creadoEn ?? null };
}
