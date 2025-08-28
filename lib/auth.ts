// lib/auth.ts
import api from "./api";

// lib/auth.ts
export async function loginUser(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });
    const { accessToken, user } = res.data;
  
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
  
      // Handle different possible role structures
      const role = user.userRoles?.[0]?.role?.name || user.userRoles?.[0]?.name || 'PESERTA';
      localStorage.setItem("role", role);
    }
  
    return { user, accessToken };
  }
  

  export async function registerUser(data: {
    email: string
    username: string
    name?: string
    password: string
  }) {
    const res = await api.post("/auth/signup", data)
  
    const { user, message } = res.data
  
    // Optional: store role
    const role = user.userRoles?.[0]?.role?.name || user.userRoles?.[0]?.name || 'PESERTA'
    localStorage.setItem("role", role)
  
    return { user, message }
  }
  

export async function getProfile() {
  const res = await api.get("/auth/profile");
  return res.data.user // ✅ returns just the user
}

// lib/auth.ts
export function logoutUser() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
    }
  }
  
