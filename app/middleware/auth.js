export default defineNuxtRouteMiddleware(async (to, from) => {
    const {user , isLoaded}= useUser();

    console.log("Current user in middleware:", user.value);

    console.log("data loaded?", isLoaded.value);    
    
    if(!isLoaded.value)return;
    // while (!isLoaded.value) {
    // await new Promise(resolve => setTimeout(resolve, 1))
  // }

    if (!user.value && to.path !== "/login") {
    return navigateTo("/login");
  }

  if (user.value && to.path === "/login") {
    return navigateTo("/");
  }
});
