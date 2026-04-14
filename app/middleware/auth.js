export default defineNuxtRouteMiddleware((to) => {
  const { user, profile, isLoaded } = useUser();

  if (!isLoaded.value) return;

  const publicPaths = ["/login", "/signup", "/reset", "/welcome"];

  if (!user.value && !publicPaths.includes(to.path)) {
    return navigateTo("/login");
  }

  if (user.value && !profile.value?.teamId && to.path !== "/welcome") {
    return navigateTo("/welcome");
  }

  if (user.value && profile.value?.teamId && (to.path === "/login" || to.path === "/signup")) {
    return navigateTo("/");
  }
});