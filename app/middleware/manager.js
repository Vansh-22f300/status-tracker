export default defineNuxtRouteMiddleware((to) => {
  const { user, profile, isLoaded } = useUser();

  if (!isLoaded.value) return;


  if (user.value && profile.value?.role !== "Manager" ) {
    return navigateTo("/");
  }
});