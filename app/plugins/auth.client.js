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
          // Existing user
          profile.value = {
            role:   null,
            teamId: null,
            teamName:null,
            ...docSnap.data(),
          }
        } else {
          // New user
          const newProfile = {
            name:      firebaseUser.displayName,
            email:     firebaseUser.email,
            role:      null,
            teamId:    null,
            teamName:  null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          await setDoc(docRef, newProfile)
          profile.value = newProfile
        }

        const currentPath = window.location.pathname
        const authPages   = ["/login", "/signup"]

        if (authPages.includes(currentPath)) {
          if (profile.value?.teamId) {
            navigateTo("/")           // has team 
          } else {
            navigateTo("/welcome") // no team 
          }
        }

      } else {
        profile.value = null
      }

      isLoaded.value = true
      resolve()
    })
  })
})