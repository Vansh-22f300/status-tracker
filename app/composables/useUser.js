import { ref } from "vue";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
const user = ref(null);
const profile = ref(null);
const isLoaded = ref(false);

export function useUser() {
  return { user, profile, isLoaded };
}
