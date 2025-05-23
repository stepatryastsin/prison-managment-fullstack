// src/App.js
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Menu,
  MenuItem,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';

// Страницы
import Prisoners from './components/Prisoners';
import Properties from './components/Properties';
import Courses from './components/Courses';
import PrisonerLaborFrontend from './components/PrisonerLabor';
import Borrowed from './components/Borrowed';
import Work from './components/EnrollmentCertificates';
import OwnCertificateFromFrontend from './components/OwnCertificateFromFrontend';
import Staff from './components/Staff';
import Job from './components/Job';
import Cells from './components/Cells';
import SecurityLevels from './components/SecurityLevels';
import Visitors from './components/Visitors';
import VisitedBy from './components/VisitedBy';
import Infirmary from './components/Infirmary';
import Library from './components/Library';
import Statistics from './components/Statistics';

axios.defaults.withCredentials = true;

// Матрица доступа по ролям
const rolePermissions = {

  // ========== ADMIN ==========
  admin: {
    navItems: [
      { to: '/prisoners',            label: 'Заключённые' },
      { to: '/prisoners/properties', label: 'Вещи' },
      { to: '/statistics',           label: 'Статистика' },

      // admin-only
      { to: '/staff',                label: 'Персонал' },
      { to: '/staff/job',            label: 'Должности' },

      // admin + guard
      { to: '/cells',                label: 'Камеры' },
      { to: '/security-levels',      label: 'Уровни защиты' },

      // admin + warden
      { to: '/prisoners/courses',        label: 'Обучение' },
      { to: '/prisoners/prisoner-labor', label: 'Труд' },
      { to: '/prisoners/borrowed',       label: 'Книги' },
      { to: '/enrollments-certs',        label: 'Сертификаты' },

      // admin + warden + guard
      { to: '/visitors',           label: 'Регистрация посетителей' },
      { to: '/visited-by',         label: 'Посещаемость' },

      // admin + medic
      { to: '/infirmary',          label: 'Лазарет' },

      // admin + librarian
      { to: '/library',            label: 'Библиотека' }
    ],
    routes: [
      { path: '/prisoners',            comp: 'Prisoners' },
      { path: '/prisoners/properties', comp: 'Properties' },
      { path: '/statistics',           comp: 'Statistics' },
      { path: '/staff',                comp: 'Staff' },
      { path: '/staff/job',            comp: 'Job' },
      { path: '/cells',                comp: 'Cells' },
      { path: '/security-levels',      comp: 'SecurityLevels' },
      { path: '/prisoners/courses',        comp: 'Courses' },
      { path: '/prisoners/prisoner-labor', comp: 'PrisonerLaborFrontend' },
      { path: '/prisoners/borrowed',       comp: 'Borrowed' },
      { path: '/enrollments-certs',        comp: 'Work' },
      { path: '/visitors',           comp: 'Visitors' },
      { path: '/visited-by',         comp: 'VisitedBy' },
      { path: '/infirmary',          comp: 'Infirmary' },
      { path: '/library',            comp: 'Library' }
    ]
  },

  // ========== WARDEN ==========
  warden: {
    navItems: [
      { to: '/prisoners',            label: 'Заключённые' },
      { to: '/prisoners/properties', label: 'Вещи' },
      { to: '/prisoners/courses',        label: 'Обучение' },
      { to: '/prisoners/prisoner-labor', label: 'Труд' },
      { to: '/enrollments-certs',        label: 'Сертификаты' }
    ],
    routes: [
      { path: '/prisoners',            comp: 'Prisoners' },
      { path: '/prisoners/properties', comp: 'Properties' },
      { path: '/prisoners/courses',        comp: 'Courses' },
      { path: '/prisoners/prisoner-labor', comp: 'PrisonerLaborFrontend' },
      { path: '/enrollments-certs',        comp: 'Work' }
    ]
  },

  // ========== GUARD ==========
  guard: {
    navItems: [
      { to: '/prisoners',            label: 'Заключённые' },
      { to: '/prisoners/properties', label: 'Вещи' },
      { to: '/cells',                label: 'Камеры' },
      { to: '/security-levels',      label: 'Уровни защиты' },
      { to: '/visitors',             label: 'Регистрация посетителей' },
      { to: '/visited-by',           label: 'Посещаемость' }
    ],
    routes: [
      { path: '/prisoners',            comp: 'Prisoners' },
      { path: '/prisoners/properties', comp: 'Properties' },
      { path: '/cells',                comp: 'Cells' },
      { path: '/security-levels',      comp: 'SecurityLevels' },
      { path: '/visitors',             comp: 'Visitors' },
      { path: '/visited-by',           comp: 'VisitedBy' }
    ]
  },

  // ========== LIBRARIAN ==========
  librarian: {
    navItems: [
      { to: '/prisoners',            label: 'Заключённые' },
      { to: '/statistics',           label: 'Статистика' },
      { to: '/prisoners/borrowed',       label: 'Книги' },
      { to: '/library',             label: 'Библиотека' }
    ],
    routes: [
      { path: '/prisoners',            comp: 'Prisoners' },
      { path: '/statistics',           comp: 'Statistics' },
      { path: '/prisoners/borrowed',       comp: 'Borrowed' },
      { path: '/library',             comp: 'Library' }
    ]
  },

  // ========== MEDIC ==========
  medic: {
    navItems: [
      { to: '/prisoners',            label: 'Заключённые' },
      { to: '/infirmary',           label: 'Лазарет' }
    ],
    routes: [
      { path: '/prisoners',            comp: 'Prisoners' },
      { path: '/infirmary',           comp: 'Infirmary' }
    ]
  }
};

export const ROLES = Object.keys(rolePermissions);

// --- Аутентификация и контекст ---
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Protected-обёртка
const Protected = ({ allowed, children }) => {
  const { role } = useAuth();
  return allowed.includes(role)
    ? children
    : <Navigate to="/" replace />;
};

// Страница логина
const AuthPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:8080/auth/login', { username, password });
      onLogin(res.data.role.replace('ROLE_', '').toLowerCase());
    } catch (e) {
      setError(e.response?.data?.message || 'Ошибка входа');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 10 }}>
      <Typography variant="h5" gutterBottom>Авторизация</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        label="Логин"
        fullWidth
        sx={{ mb: 2 }}
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <TextField
        label="Пароль"
        type="password"
        fullWidth
        sx={{ mb: 2 }}
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <Button variant="contained" fullWidth onClick={handleLogin}>Войти</Button>
    </Box>
  );
};

// Навигационный бар
const NavigationBar = ({ onLogout }) => {
  const { role } = useAuth();
  const perms = rolePermissions[role] || { navItems: [] };
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Пенитенциарная система</Typography>
        <Button color="inherit" onClick={e => setAnchorEl(e.currentTarget)}>Меню</Button>
        <Button color="inherit" onClick={onLogout}>Выйти</Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          {perms.navItems.map(({ to, label }) => (
            <MenuItem
              key={to}
              component={Link}
              to={to}
              onClick={() => setAnchorEl(null)}
            >
              {label}
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole]                   = useState(null);
  const [loading, setLoading]             = useState(true);

  // Проверяем сессию
  useEffect(() => {
    axios.get('http://localhost:8080/auth/check')
      .then(res => {
        setAuthenticated(true);
        setRole(res.data.role.replace('ROLE_', '').toLowerCase());
      })
      .catch(() => {
        setAuthenticated(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = (r) => {
    setAuthenticated(true);
    setRole(r);
  };

  const handleLogout = async () => {
    await axios.post('http://localhost:8080/auth/logout');
    setAuthenticated(false);
    setRole(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!authenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const perms = rolePermissions[role] || { routes: [] };

  // Для динамической подстановки компонентов по имени
  const componentMap = {
    Prisoners,
    Properties,
    Courses,
    PrisonerLaborFrontend,
    Borrowed,
    Work,
    OwnCertificateFromFrontend,
    Staff,
    Job,
    Cells,
    SecurityLevels,
    Visitors,
    VisitedBy,
    Infirmary,
    Library,
    Statistics
  };

  return (
    <AuthContext.Provider value={{ role }}>
      <Router>
        <NavigationBar onLogout={handleLogout} />
        <Container sx={{ mt: 4 }}>
          <Routes>
            {/* Главная */}
            <Route
              path="/"
              element={
                <Box textAlign="center">
                  <Typography variant="h4">Добро пожаловать, {role}</Typography>
                </Box>
              }
            />

            {/* Динамические защищённые маршруты */}
            {perms.routes.map(({ path, comp }) => {
              const Component = componentMap[comp];
              return (
                <Route
                  key={path}
                  path={path}
                  element={
                    <Protected allowed={rolePermissions[role].routes.map(r => r.path).includes(path) ? [role] : []}>
                      <Component />
                    </Protected>
                  }
                />
              );
            })}

            {/* Фолбэк */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;

