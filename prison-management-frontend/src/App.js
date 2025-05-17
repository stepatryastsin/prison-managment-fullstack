import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import {
  AppBar, Toolbar, Typography, Button, Container,
  Box, Menu, MenuItem, TextField, Alert
} from '@mui/material';

// Компоненты страниц
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

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const Protected = ({ allowed, children }) => {
  const { role } = useAuth();
  return allowed.includes(role) ? children : <Navigate to="/" replace />;
};

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

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const isAdmin     = role === 'admin';
  const isWarden    = role === 'warden';
  const isGuard     = role === 'guard';
  const isLibrarian = role === 'librarian';
  const isMedic     = role === 'medic';
  const isViewer    = role === 'viewer';

  useEffect(() => {
    axios.get('http://localhost:8080/auth/check')
      .then(res => {
        setAuthenticated(true);
        setRole(res.data.role.replace('ROLE_', '').toLowerCase());
      })
      .catch(() => setAuthenticated(false));
  }, []);

  const handleLogout = async () => {
    await axios.post('http://localhost:8080/auth/logout');
    setAuthenticated(false);
    setRole(null);
  };

  if (!authenticated) {
    return <AuthPage onLogin={r => setAuthenticated(true) & setRole(r)} />;
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
              {/* Всегда доступно */}
              <MenuItem component={Link} to="/prisoners" onClick={() => setMenuAnchor(null)}>
                Заключённые
              </MenuItem>
              <MenuItem component={Link} to="/prisoners/properties" onClick={() => setMenuAnchor(null)}>
                Вещи
              </MenuItem>

              {/* Admin */}
              {isAdmin && (
                <>
                  <MenuItem component={Link} to="/staff" onClick={() => setMenuAnchor(null)}>
                    Персонал
                  </MenuItem>
                  <MenuItem component={Link} to="/staff/job" onClick={() => setMenuAnchor(null)}>
                    Должности
                  </MenuItem>
                </>
              )}
              {/* Admin & Guard */}
              {(isAdmin || isGuard) && (
                <>
                  <MenuItem component={Link} to="/cells" onClick={() => setMenuAnchor(null)}>
                    Камеры
                  </MenuItem>
                  <MenuItem component={Link} to="/security-levels" onClick={() => setMenuAnchor(null)}>
                    Уровни защиты
                  </MenuItem>
                </>
              )}
              {/* Admin & Warden */}
              {(isAdmin || isWarden) && (
                <>
                  <MenuItem component={Link} to="/prisoners/courses" onClick={() => setMenuAnchor(null)}>
                    Обучение
                  </MenuItem>
                  <MenuItem component={Link} to="/prisoners/prisoner-labor" onClick={() => setMenuAnchor(null)}>
                    Труд
                  </MenuItem>
                  <MenuItem component={Link} to="/prisoners/borrowed" onClick={() => setMenuAnchor(null)}>
                    Книги
                  </MenuItem>
                  <MenuItem component={Link} to="/enrollments-certs" onClick={() => setMenuAnchor(null)}>
                    Сертификаты
                  </MenuItem>
                </>
              )}
              {/* Admin, Warden, Guard */}
              {(isAdmin || isWarden || isGuard) && (
                <>
                  <MenuItem component={Link} to="/visitors" onClick={() => setMenuAnchor(null)}>
                    Регистрация посетителей
                  </MenuItem>
                  <MenuItem component={Link} to="/visited-by" onClick={() => setMenuAnchor(null)}>
                    Посещаемость
                  </MenuItem>
                </>
              )}
              {/* Admin, Medic, Viewer */}
              {(isAdmin || isMedic || isViewer) && (
                <MenuItem component={Link} to="/infirmary" onClick={() => setMenuAnchor(null)}>
                Лазарет
                </MenuItem>
              )}
              {/* Admin, Librarian, Viewer */}
              {(isAdmin || isLibrarian || isViewer) && (
                <MenuItem component={Link} to="/library" onClick={() => setMenuAnchor(null)}>
                Библиотека
                </MenuItem>
              )}
            </Menu>
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={
              <Box textAlign="center">
                <Typography variant="h4">Добро пожаловать, {role}</Typography>
              </Box>
            } />

            <Route path="/prisoners" element={
              <Protected allowed={['admin','warden','viewer','guard','librarian','medic']}><Prisoners readOnly={isViewer} /></Protected>
            } />
            <Route path="/prisoners/properties" element={
              <Protected allowed={['admin','warden','viewer','guard','librarian','medic']}><Properties readOnly={isViewer} /></Protected>
            } />
            <Route path="/prisoners/courses" element={
              <Protected allowed={['admin','warden']}><Courses readOnly={isViewer} /></Protected>
            } />
            <Route path="/prisoners/prisoner-labor" element={
              <Protected allowed={['admin','warden']}><PrisonerLaborFrontend readOnly={isViewer} /></Protected>
            } />
            <Route path="/prisoners/borrowed" element={
              <Protected allowed={['admin','librarian']}><Borrowed readOnly={isViewer} /></Protected>
            } />
            <Route path="/enrollments-certs" element={
              <Protected allowed={['admin','warden']}><Work readOnly={isViewer} /></Protected>
            } />
            <Route path="/own-certificate-from" element={
              <Protected allowed={['admin','warden']}><OwnCertificateFromFrontend readOnly={isViewer} /></Protected>
            } />

            <Route path="/staff" element={
              <Protected allowed={['admin']}><Staff /></Protected>
            } />
            <Route path="/staff/job" element={
              <Protected allowed={['admin']}><Job /></Protected>
            } />

            <Route path="/cells" element={
              <Protected allowed={['admin','guard']}><Cells /></Protected>
            } />
            <Route path="/security-levels" element={
              <Protected allowed={['admin','guard']}><SecurityLevels /></Protected>
            } />

            <Route path="/visitors" element={
              <Protected allowed={['admin','warden','guard']}><Visitors readOnly={isViewer} /></Protected>
            } />
            <Route path="/visited-by" element={
              <Protected allowed={['admin','warden','guard']}><VisitedBy readOnly={isViewer} /></Protected>
            } />

            <Route path="/infirmary" element={
              <Protected allowed={['admin','medic','viewer']}><Infirmary readOnly={isViewer} /></Protected>
            } />
            <Route path="/library" element={
              <Protected allowed={['admin','librarian','viewer']}><Library readOnly={isViewer} /></Protected>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;