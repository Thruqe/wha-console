export function showToast(message: string, variant: "error" | "success" = "error") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${variant}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("visible"));

    setTimeout(() => {
        toast.classList.remove("visible");
        setTimeout(() => toast.remove(), 200);
    }, 3500);
}