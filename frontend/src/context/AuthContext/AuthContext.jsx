import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const USERS_STORAGE_KEY = "enterprise_portal_users";
const CURRENT_USER_STORAGE_KEY = "enterprise_portal_current_user";

const getStoredUsers = () => {
  try {
    const storedUsers = localStorage.getItem(
      USERS_STORAGE_KEY
    );

    return storedUsers
      ? JSON.parse(storedUsers)
      : [];
  } catch (error) {
    console.error(
      "Unable to read stored users:",
      error
    );

    return [];
  }
};

const getStoredCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem(
      CURRENT_USER_STORAGE_KEY
    );

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error(
      "Unable to read current user:",
      error
    );

    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    getStoredCurrentUser
  );

  const [isAuthLoading, setIsAuthLoading] =
    useState(true);

  useEffect(() => {
    setIsAuthLoading(false);
  }, []);

  const signup = ({
    name,
    email,
    password,
    department = "Employee",
  }) => {
    const cleanName = name.trim();
    const cleanEmail = email
      .trim()
      .toLowerCase();

    if (
      !cleanName ||
      !cleanEmail ||
      !password
    ) {
      return {
        success: false,
        message:
          "Name, email and password are required.",
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message:
          "Password must contain at least 6 characters.",
      };
    }

    const storedUsers = getStoredUsers();

    const existingUser = storedUsers.find(
      (storedUser) =>
        storedUser.email === cleanEmail
    );

    if (existingUser) {
      return {
        success: false,
        message:
          "An account with this email already exists.",
      };
    }

    const newUser = {
      id: `EMP-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password,
      department,
      role: "Employee",
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [
      ...storedUsers,
      newUser,
    ];

    localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify(updatedUsers)
    );

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      department: newUser.department,
      role: newUser.role,
    };

    localStorage.setItem(
      CURRENT_USER_STORAGE_KEY,
      JSON.stringify(safeUser)
    );

    setUser(safeUser);

    return {
      success: true,
      message:
        "Account created successfully.",
      user: safeUser,
    };
  };

  const login = ({
    email,
    password,
  }) => {
    const cleanEmail = email
      .trim()
      .toLowerCase();

    if (!cleanEmail || !password) {
      return {
        success: false,
        message:
          "Email and password are required.",
      };
    }

    const storedUsers = getStoredUsers();

    const matchedUser = storedUsers.find(
      (storedUser) =>
        storedUser.email === cleanEmail &&
        storedUser.password === password
    );

    if (!matchedUser) {
      return {
        success: false,
        message:
          "Invalid email or password.",
      };
    }

    const safeUser = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      department:
        matchedUser.department,
      role: matchedUser.role,
    };

    localStorage.setItem(
      CURRENT_USER_STORAGE_KEY,
      JSON.stringify(safeUser)
    );

    setUser(safeUser);

    return {
      success: true,
      message: "Login successful.",
      user: safeUser,
    };
  };

  const logout = () => {
    localStorage.removeItem(
      CURRENT_USER_STORAGE_KEY
    );

    setUser(null);
  };

  const updateProfile = ({
    name,
    department,
  }) => {
    if (!user) {
      return {
        success: false,
        message:
          "No authenticated user found.",
      };
    }

    const storedUsers = getStoredUsers();

    const updatedUsers = storedUsers.map(
      (storedUser) => {
        if (storedUser.id !== user.id) {
          return storedUser;
        }

        return {
          ...storedUser,
          name:
            name?.trim() ||
            storedUser.name,
          department:
            department?.trim() ||
            storedUser.department,
        };
      }
    );

    const updatedCurrentUser = {
      ...user,
      name:
        name?.trim() || user.name,
      department:
        department?.trim() ||
        user.department,
    };

    localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify(updatedUsers)
    );

    localStorage.setItem(
      CURRENT_USER_STORAGE_KEY,
      JSON.stringify(
        updatedCurrentUser
      )
    );

    setUser(updatedCurrentUser);

    return {
      success: true,
      message:
        "Profile updated successfully.",
    };
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAuthLoading,
      login,
      signup,
      logout,
      updateProfile,
    }),
    [user, isAuthLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}