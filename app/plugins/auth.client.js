import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "../../firebase/config"
import { doc, getDoc, setDoc } from "firebase/firestore"

export default defineNuxtPlugin(() => {
  const { user, profile, isLoaded } = useUser()

  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      user.value = firebaseUser

      if (firebaseUser) {
        const docRef  = doc(db, "profiles", firebaseUser.uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          profile.value = docSnap.data()
        } 
        else {
          const newProfile = {
            name:  firebaseUser.displayName || "User",
            email: firebaseUser.email,
          }
          await setDoc(docRef, newProfile)
          profile.value = newProfile
        }
      } 
      else 
      {
        profile.value = null
      }

      isLoaded.value = true  
      resolve()
    })
  })
})