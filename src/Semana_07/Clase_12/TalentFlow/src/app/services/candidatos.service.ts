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

@Injectable({
  providedIn: 'root',
})
export class CandidatosService {
  private readonly app = getApps().length ? getApp() : initializeApp(environment.firebase);
  private readonly db = getFirestore(this.app);
  private readonly coleccionRef = collection(this.db, COLECCION);

  async guardarCandidato(candidato: CandidatoForm): Promise<string> {
    const docRef = await addDoc(this.coleccionRef, {
      ...candidato,
      creadoEn: serverTimestamp(),
    });
    return docRef.id;
  }

  async obtenerCandidatos(): Promise<Candidato[]> {
    const snapshot = await getDocs(query(this.coleccionRef, orderBy('creadoEn', 'desc')));
    return snapshot.docs.map(aCandidato);
  }

  async obtenerCandidatoPorId(id: string): Promise<Candidato | null> {
    const docSnap = await getDoc(doc(this.db, COLECCION, id));
    return docSnap.exists() ? aCandidato(docSnap) : null;
  }

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
