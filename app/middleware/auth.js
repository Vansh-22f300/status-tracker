export default defineNuxtRouteMiddleware(async (to, from) => {
    const {user , isLoaded}= useUser();

    console.log("Current user in middleware:", user.value);

    console.log("data loaded?", isLoaded.value);    
    
    if(isLoaded.value)return;

    if (!user.value && to.path !== "/login") {
    return navigateTo("/login");
  }

  if (user.value && to.path === "/login") {
    return navigateTo("/");
  }
});
