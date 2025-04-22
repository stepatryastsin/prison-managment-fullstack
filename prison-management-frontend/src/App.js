import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Tabs,
  Tab,
  Box,
  Menu,
  MenuItem,
} from '@mui/material';

// Импорт компонентов разделов
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

function App() {
  // Состояние для выбранной вкладки
  const [tabValue, setTabValue] = useState(0);
  // Состояние для главного меню
  const [menuAnchor, setMenuAnchor] = useState(null);
  // Состояния для подменю (объект с именами разделов)
  const [submenu, setSubmenu] = useState({ 
    prisoners: null,
    staff: null,
    cells: null,
    visitors: null,
  });

  // Обработчик смены вкладок
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Универсальные обработчики для главного меню
  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // Обработчики открытия/закрытия подменю по имени раздела
  const handleSubmenuOpen = (menuName, event) => {
    setSubmenu((prev) => ({ ...prev, [menuName]: event.currentTarget }));
  };
  const handleSubmenuClose = (menuName) => {
    setSubmenu((prev) => ({ ...prev, [menuName]: null }));
  };

  return (
    <Router>
      {/* Шапка приложения */}
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Система управления пенитенциарным учреждением
          </Typography>
          <Button color="inherit" onClick={handleMenuOpen}>
            Меню
          </Button>
          <Menu 
            anchorEl={menuAnchor} 
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            sx={{ mt: 1 }}
          >
            <MenuItem component={Link} to="/prisoners" onClick={handleMenuClose}>
              Заключённые
            </MenuItem>
            <MenuItem component={Link} to="/staff" onClick={handleMenuClose}>
              Персонал
            </MenuItem>
            <MenuItem component={Link} to="/cells" onClick={handleMenuClose}>
              Камеры
            </MenuItem>
            <MenuItem component={Link} to="/infirmary" onClick={handleMenuClose}>
              Лазарет
            </MenuItem>
            <MenuItem component={Link} to="/library" onClick={handleMenuClose}>
              Библиотека
            </MenuItem>
          </Menu>
        </Toolbar>

        {/* Вкладки навигации */}
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Главная" component={Link} to="/" />
          <Tab 
            label="Заключённые" 
            onClick={(event) => handleSubmenuOpen('prisoners', event)}
          />
          <Tab label="Обучение" component={Link} to="/prisoners/courses" />
          <Tab 
            label="Персонал" 
            onClick={(event) => handleSubmenuOpen('staff', event)}
          />
          <Tab 
            label="Камеры" 
            onClick={(event) => handleSubmenuOpen('cells', event)}
          />
          <Tab 
            label="Посетители" 
            onClick={(event) => handleSubmenuOpen('visitors', event)}
          />
          <Tab label="Лазарет" component={Link} to="/infirmary" />
          <Tab label="Библиотека" component={Link} to="/library" />
        </Tabs>

        {/* Подменю для Заключённых */}
        <Menu
          anchorEl={submenu.prisoners}
          open={Boolean(submenu.prisoners)}
          onClose={() => handleSubmenuClose('prisoners')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MenuItem 
            component={Link} 
            to="/prisoners" 
            onClick={() => handleSubmenuClose('prisoners')}
          >
            Все заключённые
          </MenuItem>
          <MenuItem 
            component={Link} 
            to="/prisoners/prisoner-labor" 
            onClick={() => handleSubmenuClose('prisoners')}
          >
            Работа заключённых
          </MenuItem>
          <MenuItem 
            component={Link} 
            to="/prisoners/borrowed" 
            onClick={() => handleSubmenuClose('prisoners')}
          >
            Книги из библиотеки
          </MenuItem>
          <MenuItem 
            component={Link} 
            to="/prisoners/properties" 
            onClick={() => handleSubmenuClose('prisoners')}
          >
            Вещи в камерах
          </MenuItem>
          <MenuItem 
            component={Link} 
            to="/enrollments-certs" 
            onClick={() => handleSubmenuClose('prisoners')}
          >
            Регистрация и сертификаты
          </MenuItem>
        </Menu>

        {/* Подменю для Персонала */}
        <Menu
          anchorEl={submenu.staff}
          open={Boolean(submenu.staff)}
          onClose={() => handleSubmenuClose('staff')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MenuItem 
            component={Link} 
            to="/staff" 
            onClick={() => handleSubmenuClose('staff')}
          >
            Все сотрудники
          </MenuItem>
          <MenuItem 
            component={Link} 
            to="/staff/job" 
            onClick={() => handleSubmenuClose('staff')}
          >
            Должности
          </MenuItem>
        </Menu>

        {/* Подменю для Камер */}
        <Menu
          anchorEl={submenu.cells}
          open={Boolean(submenu.cells)}
          onClose={() => handleSubmenuClose('cells')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MenuItem 
            component={Link} 
            to="/cells" 
            onClick={() => handleSubmenuClose('cells')}
          >
            Камеры
          </MenuItem>
          <MenuItem 
            component={Link} 
            to="/security-levels" 
            onClick={() => handleSubmenuClose('cells')}
          >
            Уровни безопасности
          </MenuItem>
        </Menu>

        {/* Подменю для Посетителей */}
        <Menu
          anchorEl={submenu.visitors}
          open={Boolean(submenu.visitors)}
          onClose={() => handleSubmenuClose('visitors')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MenuItem 
            component={Link} 
            to="/visitors" 
            onClick={() => handleSubmenuClose('visitors')}
          >
            Запись и просмотр посетителей
          </MenuItem>
          <MenuItem 
            component={Link} 
            to="/visited-by" 
            onClick={() => handleSubmenuClose('visitors')}
          >
            Проверка посещаемости
          </MenuItem>
        </Menu>
      </AppBar>

      {/* Контейнер для вывода контента */}
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route
            path="/"
            element={
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                  Добро пожаловать в систему управления пенитенциарным учреждением
                </Typography>
                <Typography variant="body1">
                  Используйте верхнее меню или вкладки для перехода в нужный раздел.
                </Typography>
              </Box>
            }
          />
          <Route path="/prisoners" element={<Prisoners />} />
          <Route path="/prisoners/courses" element={<Courses />} />
          {/* Изменённый маршрут для "Работа заключённых" */}
          <Route path="/prisoners/prisoner-labor" element={<PrisonerLaborFrontend />} />
          <Route path="/own-certificate-from" element={<OwnCertificateFromFrontend />} />
          <Route path="/prisoners/borrowed" element={<Borrowed />} />
          <Route path="/prisoners/properties" element={<Properties />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/staff/job" element={<Job />} />
          <Route path="/cells" element={<Cells />} />
          <Route path="/security-levels" element={<SecurityLevels />} />
          <Route path="/visitors" element={<Visitors />} />
          <Route path="/infirmary" element={<Infirmary />} />
          <Route path="/library" element={<Library />} />
          <Route path="/visited-by" element={<VisitedBy />} />
          <Route path="/enrollments-certs" element={<Work />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
