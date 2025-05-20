import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import {
  AppBar, Toolbar, Typography, Button, Container, Box, Menu, MenuItem, TextField, Alert
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

axios.defaults.withCredentials = true;

// Контекст аутентификации
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Защищённый роут по ролям
const Protected = ({ allowed, children }) => {
  const { role } = useAuth();
  return allowed.includes(role) ? children : <Navigate to="/" replace />;
};

// Страница логина
const AuthPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
  const [anchorEl, setAnchorEl] = useState(null);

  const isAdmin     = role === 'admin';
  const isWarden    = role === 'warden';
  const isGuard     = role === 'guard';
  const isLibrarian = role === 'librarian';
  const isMedic     = role === 'medic';

  const openMenu = e => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const NavItem = ({ to, label }) => (
    <MenuItem component={Link} to={to} onClick={closeMenu}>{label}</MenuItem>
  );

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Пенитенциарная система</Typography>
        <Button color="inherit" onClick={openMenu}>Меню</Button>
        <Button color="inherit" onClick={onLogout}>Выйти</Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
          {/* Доступно всем */}
          <NavItem to="/prisoners" label="Заключённые" />
          <NavItem to="/prisoners/properties" label="Вещи" />

          {/* Только админ */}
          {isAdmin && <>
            <NavItem to="/staff" label="Персонал" />
            <NavItem to="/staff/job" label="Должности" />
          </>}

          {/* Админ и охранник */}
          {(isAdmin || isGuard) && <>
            <NavItem to="/cells" label="Камеры" />
            <NavItem to="/security-levels" label="Уровни защиты" />
          </>}

          {/* Админ и начальник */}
          {(isAdmin || isWarden) && <>
            <NavItem to="/prisoners/courses" label="Обучение" />
            <NavItem to="/prisoners/prisoner-labor" label="Труд" />
            <NavItem to="/prisoners/borrowed" label="Книги" />
            <NavItem to="/enrollments-certs" label="Сертификаты" />
          </>}

          {/* Админ, начальник, охранник */}
          {(isAdmin || isWarden || isGuard) && <>
            <NavItem to="/visitors" label="Регистрация посетителей" />
            <NavItem to="/visited-by" label="Посещаемость" />
          </>}

          {/* Админ и медик */}
          {(isAdmin || isMedic) && <NavItem to="/infirmary" label="Лазарет" />}

          {/* Админ и библиотекарь */}
          {(isAdmin || isLibrarian) && <NavItem to="/library" label="Библиотека" />}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

// Основной компонент приложения
function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8080/auth/check')
      .then(res => {
        setAuthenticated(true);
        setRole(res.data.role.replace('ROLE_', '').toLowerCase());
      })
      .catch(() => setAuthenticated(false));
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

  if (!authenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <AuthContext.Provider value={{ role }}>
      <Router>
        <NavigationBar onLogout={handleLogout} />
        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={
              <Box textAlign="center">
                <Typography variant="h4">Добро пожаловать, {role}</Typography>
              </Box>
            } />

            <Route path="/prisoners" element={
              <Protected allowed={['admin','warden','guard','librarian','medic']}>
                <Prisoners />
              </Protected>
            }/>
            <Route path="/prisoners/properties" element={
              <Protected allowed={['admin','warden','guard','librarian','medic']}>
                <Properties />
              </Protected>
            }/>
            <Route path="/prisoners/courses" element={
              <Protected allowed={['admin','warden']}>
                <Courses />
              </Protected>
            }/>
            <Route path="/prisoners/prisoner-labor" element={
              <Protected allowed={['admin','warden']}>
                <PrisonerLaborFrontend />
              </Protected>
            }/>
            <Route path="/prisoners/borrowed" element={
              <Protected allowed={['admin','librarian']}>
                <Borrowed />
              </Protected>
            }/>
            <Route path="/enrollments-certs" element={
              <Protected allowed={['admin','warden']}>
                <Work />
              </Protected>
            }/>
            <Route path="/own-certificate-from" element={
              <Protected allowed={['admin','warden']}>
                <OwnCertificateFromFrontend />
              </Protected>
            }/>

            <Route path="/staff" element={
              <Protected allowed={['admin']}><Staff /></Protected>
            }/>
            <Route path="/staff/job" element={
              <Protected allowed={['admin']}><Job /></Protected>
            }/>

            <Route path="/cells" element={
              <Protected allowed={['admin','guard']}><Cells /></Protected>
            }/>
            <Route path="/security-levels" element={
              <Protected allowed={['admin','guard']}><SecurityLevels /></Protected>
            }/>

            <Route path="/visitors" element={
              <Protected allowed={['admin','warden','guard']}><Visitors /></Protected>
            }/>
            <Route path="/visited-by" element={
              <Protected allowed={['admin','warden','guard']}><VisitedBy /></Protected>
            }/>

            <Route path="/infirmary" element={
              <Protected allowed={['admin','medic']}><Infirmary /></Protected>
            }/>
            <Route path="/library" element={
              <Protected allowed={['admin','librarian']}><Library /></Protected>
            }/>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
