export const useSidebar = () => {

    const sidebarOpen =useState("sidebarOpen", () => false);
    const toggleSidebar = () => {
        sidebarOpen.value = !sidebarOpen.value;
    };
    const sidebarClose = () => {
        sidebarOpen.value = false;
    }
    return { sidebarOpen, toggleSidebar, sidebarClose };
};