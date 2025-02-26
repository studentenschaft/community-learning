import { createContext, useContext, useEffect, useState } from "react";
import { fetchGet } from "../api/fetch-utils"; // Import fetchGet for API calls

export interface User {
  loggedin: boolean;
  username: string;
  displayname: string;
  isAdmin: boolean;
  isCategoryAdmin: boolean;
  isExpert?: boolean;
}

export const notLoggedIn: User = {
  loggedin: false,
  isAdmin: false,
  isCategoryAdmin: false,
  username: "",
  displayname: "Not Authorized",
};

export const UserContext = createContext<User | undefined>(undefined);
export const SetUserContext = createContext<(user: User | undefined) => void>(() => {});

export const useUser = () => useContext(UserContext);
export const useSetUser = () => useContext(SetUserContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetchGet("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setUser({
            loggedin: true,
            username: userData.username,
            displayname: userData.displayname,
            isAdmin: userData.isAdmin,
            isCategoryAdmin: userData.isCategoryAdmin,
          });
        } else {
          setUser(notLoggedIn);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUser(notLoggedIn);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading state while fetching user data
  }

  return (
    <UserContext.Provider value={user}>
      <SetUserContext.Provider value={setUser}>{children}</SetUserContext.Provider>
    </UserContext.Provider>
  );
};
