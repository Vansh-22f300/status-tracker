import { ref } from "vue";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
const user = ref(null);
const profile = ref(null);
const isLoaded = ref(false);

export function useUser() {
  // if (!isLoaded.value) {
  //   onAuthStateChanged(auth, async (u) => {
  //     user.value = u;
  //     if (u) {
  //       const docRef = doc(db, "profiles", u.uid);
  //       const docSnap = await getDoc(docRef);

  //       if (docSnap.exists()) {
  //         profile.value = docSnap.data();
  //       } else {
  //         const newProfile = {
  //           name: u.displayName || "User",
  //           email: u.email,
  //         };

  //         await setDoc(docRef, newProfile);

  //         profile.value = newProfile;
  //       }
  //     } else {
  //       profile.value = null;
  //     }

  //     isLoaded.value = true;
  //   });
  // }
  return { user, profile, isLoaded };
}
