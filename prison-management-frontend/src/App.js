import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import {
  AppBar, Toolbar, Typography, Button, Container,
  Tabs, Tab, Box, Menu, MenuItem, TextField, Alert
} from '@mui/material';

// Импорт компонентов страниц
import Prisoners from './components/Prisoners';
import Staff from './components/Staff';
import Job from './components/Job';
import Cells from './components/Cells';
import Visitors from './components/Visitors';
import Infirmary from './components/Infirmary';
import Library from './components/Library';
import Courses from './components/Courses';
import Work from './components/EnrollmentCertificates';
import Borrowed from './components/Borrowed';
import VisitedBy from './components/VisitedBy';
import Properties from './components/Properties';
import OwnCertificateFromFrontend from './components/OwnCertificateFromFrontend';
import PrisonerLaborFrontend from './components/PrisonerLabor';
import SecurityLevels from './components/SecurityLevels';

axios.defaults.withCredentials = true;

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Компонент для защиты маршрутов по ролям
const Protected = ({ allowed, children }) => {
  const { role } = useAuth();
  if (!allowed.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Страница авторизации
const AuthPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:8080/auth/login', { username, password });
      const role = res.data.role.replace('ROLE_', '').toLowerCase();
      onLogin(role);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка входа');
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

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [submenuAnchors, setSubmenuAnchors] = useState({});

  const isAdmin = role === 'admin';
  const isWarden = role === 'warden';
  const isViewer = role === 'viewer';
  const readOnly = isViewer;

  useEffect(() => {
    axios.get('http://localhost:8080/auth/check')
      .then(res => {
        setAuthenticated(true);
        setRole(res.data.role.replace('ROLE_', '').toLowerCase());
      })
      .catch(() => {
        setAuthenticated(false);
        setRole(null);
      });
  }, []);

  const handleLogout = async () => {
    await axios.post('http://localhost:8080/auth/logout');
    setAuthenticated(false);
    setRole(null);
  };

  // Обработчики для подменю
  const handleOpenSubmenu = (key) => (event) => {
    setSubmenuAnchors(prev => ({ ...prev, [key]: event.currentTarget }));
  };

  const handleCloseSubmenu = (key) => () => {
    setSubmenuAnchors(prev => ({ ...prev, [key]: null }));
  };

  const renderMenu = (key, items) => (
    <Menu
      anchorEl={submenuAnchors[key]}
      open={Boolean(submenuAnchors[key])}
      onClose={handleCloseSubmenu(key)}
    >
      {items.map(({ to, label }) => (
        <MenuItem
          key={to}
          component={Link}
          to={to}
          onClick={handleCloseSubmenu(key)}
        >
          {label}
        </MenuItem>
      ))}
    </Menu>
  );

  if (!authenticated) {
    return <AuthPage onLogin={(r) => { setAuthenticated(true); setRole(r); }} />;
  }

  return (
    <AuthContext.Provider value={{ role }}>
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Пенитенциарная система
            </Typography>
            <Button color="inherit" onClick={e => setMenuAnchor(e.currentTarget)}>Меню</Button>
            <Button color="inherit" onClick={handleLogout}>Выйти</Button>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
            >
              <MenuItem component={Link} to="/prisoners" onClick={() => setMenuAnchor(null)}>Заключённые</MenuItem>
              {isAdmin && <MenuItem component={Link} to="/staff" onClick={() => setMenuAnchor(null)}>Персонал</MenuItem>}
              {isAdmin && <MenuItem component={Link} to="/cells" onClick={() => setMenuAnchor(null)}>Камеры</MenuItem>}
              <MenuItem component={Link} to="/infirmary" onClick={() => setMenuAnchor(null)}>Лазарет</MenuItem>
              <MenuItem component={Link} to="/library" onClick={() => setMenuAnchor(null)}>Библиотека</MenuItem>
            </Menu>
          </Toolbar>

          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} centered>
            <Tab label="Главная" component={Link} to="/" />
            <Tab label="Заключённые" onClick={handleOpenSubmenu('prisoners')} />
            {!isViewer && <Tab label="Обучение" component={Link} to="/prisoners/courses" />}
            {isAdmin && <Tab label="Персонал" onClick={handleOpenSubmenu('staff')} />}
            {isAdmin && <Tab label="Камеры" onClick={handleOpenSubmenu('cells')} />}
            <Tab label="Посетители" onClick={handleOpenSubmenu('visitors')} />
            <Tab label="Лазарет" component={Link} to="/infirmary" />
            <Tab label="Библиотека" component={Link} to="/library" />
          </Tabs>

          {renderMenu('prisoners', [
            { to: '/prisoners', label: 'Все заключённые' },
            ...(!isViewer ? [
              { to: '/prisoners/prisoner-labor', label: 'Труд' },
              { to: '/prisoners/borrowed', label: 'Книги' },
              { to: '/enrollments-certs', label: 'Регистрации/Сертификаты' }
            ] : []),
            { to: '/prisoners/properties', label: 'Вещи' }
          ])}

          {isAdmin && renderMenu('staff', [
            { to: '/staff', label: 'Все сотрудники' },
            { to: '/staff/job', label: 'Должности' }
          ])}

          {isAdmin && renderMenu('cells', [
            { to: '/cells', label: 'Камеры' },
            { to: '/security-levels', label: 'Уровни защиты' }
          ])}

          {renderMenu('visitors', [
            { to: '/visitors', label: 'Регистрация посетителей' },
            { to: '/visited-by', label: 'Посещаемость' }
          ])}
        </AppBar>

        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<Box textAlign="center" mt={4}><Typography variant="h4">Добро пожаловать, {role}</Typography></Box>} />

            {/* Заключённые */}
            <Route path="/prisoners" element={
              <Protected allowed={['admin', 'warden', 'viewer']}>
                <Prisoners readOnly={readOnly} />
              </Protected>} />
            <Route path="/prisoners/properties" element={
              <Protected allowed={['admin', 'warden', 'viewer']}>
                <Properties readOnly={readOnly} />
              </Protected>} />
            <Route path="/prisoners/courses" element={
              <Protected allowed={['admin', 'warden']}>
                <Courses readOnly={readOnly} />
              </Protected>} />
            <Route path="/prisoners/prisoner-labor" element={
              <Protected allowed={['admin', 'warden']}>
                <PrisonerLaborFrontend readOnly={readOnly} />
              </Protected>} />
            <Route path="/prisoners/borrowed" element={
              <Protected allowed={['admin', 'warden']}>
                <Borrowed readOnly={readOnly} />
              </Protected>} />
            <Route path="/enrollments-certs" element={
              <Protected allowed={['admin', 'warden']}>
                <Work readOnly={readOnly} />
              </Protected>} />
            <Route path="/own-certificate-from" element={
              <Protected allowed={['admin', 'warden']}>
                <OwnCertificateFromFrontend readOnly={readOnly} />
              </Protected>} />

            {/* Персонал */}
            <Route path="/staff" element={
              <Protected allowed={['admin']}>
                <Staff />
              </Protected>} />
            <Route path="/staff/job" element={
              <Protected allowed={['admin']}>
                <Job />
              </Protected>} />

            {/* Камеры */}
            <Route path="/cells" element={
              <Protected allowed={['admin']}>
                <Cells />
              </Protected>} />
            <Route path="/security-levels" element={
              <Protected allowed={['admin']}>
                <SecurityLevels />
              </Protected>} />

            {/* Посетители */}
            <Route path="/visitors" element={
              <Protected allowed={['admin', 'warden', 'viewer']}>
                <Visitors readOnly={readOnly} />
              </Protected>} />
            <Route path="/visited-by" element={
              <Protected allowed={['admin', 'warden', 'viewer']}>
                <VisitedBy readOnly={readOnly} />
              </Protected>} />

            {/* Общие */}
            <Route path="/infirmary" element={
              <Protected allowed={['admin', 'warden', 'viewer']}>
                <Infirmary readOnly={readOnly} />
              </Protected>} />
            <Route path="/library" element={
              <Protected allowed={['admin', 'warden', 'viewer']}>
                <Library readOnly={readOnly} />
              </Protected>} />

            {/* Резерв */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;