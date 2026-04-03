export default defineNuxtRouteMiddleware(async (to, from) => {
    const {user , isLoaded}= useUser();
    console.log("Current user in middleware:", user.value);

    if(!isLoaded.value)return;

    if(!user.value){
        return navigateTo('/login');
    }
});
