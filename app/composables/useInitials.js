export function useInitials() {
  return {
    getInitials,
  };
}
const getInitials = (name) => {
    return name.split(" ").map((word) => word[0])
      .join("").toUpperCase();
  };
