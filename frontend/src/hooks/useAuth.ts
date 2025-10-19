import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { login, register, logout, clearError, fetchCurrentUser } from '../store/slices/authSlice';
import { LoginRequest, UserCreate } from '../types/user';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) => useSelector(selector);

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const handleLogin = async (credentials: LoginRequest) => {
    const result = await dispatch(login(credentials));
    return result;
  };

  const handleRegister = async (userData: UserCreate) => {
    const result = await dispatch(register(userData));
    return result;
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const handleFetchCurrentUser = async () => {
    const result = await dispatch(fetchCurrentUser());
    return result;
  };

  return {
    ...auth,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError: handleClearError,
    fetchCurrentUser: handleFetchCurrentUser,
  };
};

