import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { Firestore, addDoc, collection, deleteDoc, doc, getDocs, getFirestore, query } from 'firebase/firestore';
import { BehaviorSubject, Observable, from, map } from 'rxjs';
import { Profile, Role } from './types';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private db: Firestore;

  public currentProfileId = new BehaviorSubject<string>('');

  constructor() {
    const firebaseConfig = {
      apiKey: "AIzaSyCnX2I9F6eWnuRlHFQzqGdKXJGs5ZvPQCs",
      authDomain: "udt-training.firebaseapp.com",
      projectId: "udt-training",
      storageBucket: "udt-training.appspot.com",
      messagingSenderId: "188276554672",
      appId: "1:188276554672:web:a14142447d9918aa117475"
    };

    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
  }

  getProfiles(roleId: string): Observable<Profile[]> {
    const profileCollection = collection(this.db, `roles/${roleId}/profiles`);

    const q = query(profileCollection);

    return from(getDocs(q))
      .pipe(map(snapshot => snapshot.docs.map(d => {
        return { id: d.id, ...d.data() } as Profile;
      })));
  }

  getRoles(): Observable<Role[]> {
    const rolesCollection = collection(this.db, "roles");
    const q = query(rolesCollection);

    return from(getDocs(q))
      .pipe(map(snapshot => snapshot.docs.map(d => {
        return { id: d.id, ...d.data() } as Role;
      })));
  }

  createRole(name: string): Observable<Role> {
    const rolesCollection = collection(this.db, "roles");
    return from(addDoc(rolesCollection, {
      name,
    })).pipe(map(doc => {
      return {
        id: doc.id,
        name,
        profiles: []
      };
    }));
  }

  createProfile(name: string, roleId: string): Observable<Profile> {
    const profileCollection = collection(this.db, `roles/${roleId}/profiles`);
    return from(addDoc(profileCollection, {
      name,
    })).pipe(map(doc => {
      return {
        id: doc.id,
        name,
      };
    }));
  }

  deleteProfile(roleId: string, id: string): Observable<void> {
    return from(deleteDoc(doc(this.db, `roles/${roleId}/profiles`, id)));
  }

  deleteRole(id: string): Observable<void> {
    return from(deleteDoc(doc(this.db, "roles", id)));
  }
}
