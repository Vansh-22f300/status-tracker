import {ref} from 'vue';
import { auth } from '../../firebase/config'
import { onAuthStateChanged } from "firebase/auth";

const user=ref(null);
const isLoaded=ref(false)
export function useUser() {

    if(!isLoaded.value){
        onAuthStateChanged(auth, (u) => {
            user.value = u;
            isLoaded.value = true;
        });
    }
        return {user, isLoaded};

}