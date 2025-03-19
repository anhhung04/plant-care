  import React, { createContext, useState, useEffect, useContext } from 'react';
  import axios from 'axios';
  import * as SecureStore from 'expo-secure-store';

  interface AuthProps {
    authState?: {token: string| null; authenticated: boolean | null};
    onRegister?: (email: string, password: string) => Promise<any>;
    onLogin?: (email: string, password: string) => Promise<any>;
    onLogout?: () => Promise<any>;
    completeOnboarding?: () => Promise<any>;
    isFirstTimeUser?: boolean;
    loading?: boolean;
  }

  const TOKEN_KEY = 'my-jwt';
  export const API_URL = 'http://localhost:3000';
  const AuthContext = createContext<AuthProps | undefined>(undefined);

  
  export const useAuth = () => {
    return useContext(AuthContext);
  }
  

  export const AuthProvider = ({children} : any) => {
    const [authState, setAuthState] = useState<{token: string | null; authenticated: boolean | null}>
    ({token: null, authenticated: null});

    const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
    const [loading, setLoading] = useState(true);

    const register = async (email: string, password: string) => {
      try {
        return await axios.post(`${API_URL}/register`, {email, password});
      } catch (error) {
        console.log(error);
        return {error:true, msg: (error as any).response.data.message};
      }
    }

    const login = async (email: string, password: string) => {
      try {
        // const response = await axios.post(`${API_URL}/login`, {email, password});
        // const {token} = response.data.token;
        const response = {error: false,data: {token: '123456789'}}
        const token = response.data.token;
        setAuthState({token, authenticated: true});

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        await SecureStore.setItemAsync(TOKEN_KEY, token);

        return response

      } catch (error) {
        console.log("Login error: ",error);
        return {error:true, msg: (error as any).response.data.message};
      }
    }

    const logout = async () => {
      await SecureStore.deleteItemAsync(TOKEN_KEY);

      axios.defaults.headers.common['Authorization'] = '';

      setAuthState({token: null, authenticated: false});
      console.log(authState.token);
    }

    const completeOnboarding = async () => {
      setIsFirstTimeUser(false);
      await SecureStore.setItemAsync('isFirstTimeUser', JSON.stringify(false));
    };


    const value = {
      onRegister: register,
      onLogin: login,
      onLogout: logout,
      completeOnboarding,
      isFirstTimeUser,
      authState,
      loading
    };

    useEffect(() => {
      const loadToken = async () => {
        try {
          const token = await SecureStore.getItemAsync(TOKEN_KEY);
          const firstTimeUser = await SecureStore.getItemAsync('isFirstTimeUser');

          if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setAuthState({token, authenticated: true});
          } else {
            setAuthState({token: null, authenticated: false});
          }

          if (firstTimeUser !== null) {
            setIsFirstTimeUser(JSON.parse(firstTimeUser));
          }
        } catch (error) {
          console.log(error);
          setAuthState({token: null, authenticated: false});
        } finally {
          setLoading(false);
        }
      }; loadToken();
    }, []);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  }