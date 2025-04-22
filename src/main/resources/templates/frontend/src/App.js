import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import Prisoners from './components/Prisoners';
import Staff from './components/Staff';
import Cells from './components/Cells';

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Система управления тюрьмой
          </Typography>
          <Button color="inherit" component={Link} to="/prisoners">
            Заключённые
          </Button>
          <Button color="inherit" component={Link} to="/staff">
            Персонал
          </Button>
          <Button color="inherit" component={Link} to="/cells">
            Камеры
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ marginTop: 4 }}>
        <Routes>
          <Route path="/" element={<Prisoners />} />
          <Route path="/prisoners" element={<Prisoners />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/cells" element={<Cells />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;