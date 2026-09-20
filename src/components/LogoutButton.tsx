"use client";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="text-sm text-[#6D5E52]"
      onClick={async () => {
        await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "logout" }),
        });
        window.location.href = "/";
      }}
    >
      Salir
    </button>
  );
}
