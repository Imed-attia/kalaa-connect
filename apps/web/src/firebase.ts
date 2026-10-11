import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';

export { onAuthStateChanged, type FirebaseUser };
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { Report, ReportCategory, MunicipalService, UserRole, ReportStatus } from '@kalaa-connect/shared';

export const firebaseConfig = {
  apiKey: "AIzaSyBncAOexatu8KrRAy27NhfSbVCqdoo35Cw",
  authDomain: "kalaa-sghira.firebaseapp.com",
  projectId: "kalaa-sghira",
  storageBucket: "kalaa-sghira.firebasestorage.app",
  messagingSenderId: "461889343315",
  appId: "1:461889343315:web:7a981f5be33044df381ba6",
  measurementId: "G-W15NVXGP87"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export interface UserProfile {
  id: string;
  nom: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  telephone?: string;
  service_id?: string;
  titre_poste?: string;
}

/**
 * Supprime récursivement les clés ayant la valeur undefined
 * pour éviter l'erreur Firestore: "Unsupported field value: undefined"
 */
export function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        clean[key] = removeUndefined(val);
      } else {
        clean[key] = val;
      }
    }
  }
  return clean as Partial<T>;
}

// ----------------- AUTHENTICATION HELPERS -----------------

export async function loginWithGoogle(): Promise<UserProfile> {
  const cred = await signInWithPopup(auth, googleProvider);
  const fbUser = cred.user;
  
  // Check if profile exists in Firestore, otherwise create
  const userRef = doc(db, 'users', fbUser.uid);
  let profile: UserProfile;

  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      profile = userSnap.data() as UserProfile;
      return profile;
    }
  } catch (err) {
    console.warn('Erreur lecture Firestore profil utilisateur Google:', err);
  }

  // Nouveau profil utilisateur : aucun champ undefined
  const cleanData: Record<string, any> = {
    id: fbUser.uid,
    nom: fbUser.displayName || 'Citoyen Kalâa',
    email: fbUser.email || '',
    role: UserRole.CITOYEN,
  };

  if (fbUser.photoURL) {
    cleanData.avatar_url = fbUser.photoURL;
  }
  if (fbUser.phoneNumber) {
    cleanData.telephone = fbUser.phoneNumber;
  }

  try {
    await setDoc(userRef, cleanData);
  } catch (err) {
    console.error('Erreur enregistrement profil Google dans Firestore:', err);
  }

  profile = {
    id: fbUser.uid,
    nom: cleanData.nom,
    email: cleanData.email,
    role: UserRole.CITOYEN,
    ...(cleanData.avatar_url ? { avatar_url: cleanData.avatar_url } : {}),
    ...(cleanData.telephone ? { telephone: cleanData.telephone } : {}),
  };

  return profile;
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  const fbUser = cred.user;
  
  try {
    const userRef = doc(db, 'users', fbUser.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Erreur lecture profil Firestore:', err);
  }

  return {
    id: fbUser.uid,
    nom: fbUser.displayName || email.split('@')[0],
    email: fbUser.email || email,
    role: UserRole.CITOYEN,
  };
}

export async function registerWithEmail(
  email: string,
  pass: string,
  nom: string,
  role: UserRole = UserRole.CITOYEN,
  telephone?: string,
): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  const fbUser = cred.user;
  
  try {
    await updateProfile(fbUser, { displayName: nom });
  } catch (err) {
    console.warn('Erreur mise à jour displayName:', err);
  }
  
  const cleanData: Record<string, any> = {
    id: fbUser.uid,
    nom,
    email,
    role,
  };
  if (telephone && telephone.trim()) {
    cleanData.telephone = telephone.trim();
  }
  
  try {
    await setDoc(doc(db, 'users', fbUser.uid), cleanData);
  } catch (err) {
    console.error('Erreur setDoc profil Email dans Firestore:', err);
  }

  return {
    id: fbUser.uid,
    nom,
    email,
    role,
    ...(cleanData.telephone ? { telephone: cleanData.telephone } : {}),
  };
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// ----------------- FIRESTORE DATA HELPERS -----------------

export async function fetchFirestoreReports(): Promise<Report[]> {
  try {
    const q = query(collection(db, 'reports'));
    const snap = await getDocs(q);
    const reports: Report[] = [];
    snap.forEach((docSnap) => {
      reports.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });
    return reports;
  } catch (err) {
    console.warn('Erreur lecture Firestore reports, repli local:', err);
    return [];
  }
}

export async function createFirestoreReport(reportData: Partial<Report>): Promise<Report> {
  const id = `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const numero_ticket = `KC-2026-${Math.floor(Math.random() * 9000 + 1000)}`;
  const now = new Date().toISOString();
  
  const newReport: Report = {
    id,
    numero_ticket,
    titre: reportData.titre || '',
    description: reportData.description || '',
    categorie_id: reportData.categorie_id || 'cat-nid-de-poule',
    latitude: reportData.latitude ?? 35.8285,
    longitude: reportData.longitude ?? 10.5640,
    adresse_approximative: reportData.adresse_approximative || 'Kalâa Seghira',
    quartier: reportData.quartier || 'Centre-Ville',
    photo_url: reportData.photo_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
    statut: reportData.statut || ReportStatus.NOUVEAU,
    priorite: reportData.priorite || ('normale' as any),
    auteur_id: reportData.auteur_id || 'usr-citoyen-nada',
    cree_le: now,
    mis_a_jour_le: now,
  };
  
  const cleanDoc = removeUndefined(newReport);
  await setDoc(doc(db, 'reports', id), cleanDoc);
  return newReport;
}

export async function updateFirestoreReport(id: string, updateData: Partial<Report>): Promise<void> {
  const docRef = doc(db, 'reports', id);
  const cleanUpdate = removeUndefined({
    ...updateData,
    mis_a_jour_le: new Date().toISOString(),
  });
  await updateDoc(docRef, cleanUpdate);
}

export async function deleteFirestoreReport(id: string): Promise<void> {
  await deleteDoc(doc(db, 'reports', id));
}

export async function fetchFirestoreCategories(): Promise<ReportCategory[]> {
  const snap = await getDocs(collection(db, 'categories'));
  const cats: ReportCategory[] = [];
  snap.forEach((d) => cats.push({ id: d.id, ...(d.data() as any) }));
  return cats;
}

export async function fetchFirestoreServices(): Promise<MunicipalService[]> {
  const snap = await getDocs(collection(db, 'services'));
  const srvs: MunicipalService[] = [];
  snap.forEach((d) => srvs.push({ id: d.id, ...(d.data() as any) }));
  return srvs;
}
