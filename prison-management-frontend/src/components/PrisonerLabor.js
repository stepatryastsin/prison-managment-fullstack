import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Paper,
  Grid,
  Card,
  CardHeader,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Box,
  useMediaQuery,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Slide,
} from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';

const API = 'http://localhost:8080/api';

// Styled container
const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  maxWidth: 1200,
  margin: 'auto',
  marginTop: theme.spacing(4),
  boxShadow: theme.shadows[4],
}));

// Default headers & include cookies
const defaultHeaders = {
  'Content-Type': 'application/json',
};
const fetchOptions = overrides => ({
  headers: defaultHeaders,
  credentials: 'include',
  ...overrides,
});

export default function PrisonerLaborFrontend() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [prisoners, setPrisoners] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selection, setSelection] = useState({ prisonerId: '', staffId: '' });

  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' });
  const [confirmDel, setConfirmDel] = useState({ open: false, rec: null });
  const [viewRec, setViewRec] = useState(null);

  const openSnack = (msg, sev = 'success') => setSnack({ open: true, msg, sev });
  const closeSnack = () => setSnack(s => ({ ...s, open: false }));

  // Load existing records
  useEffect(() => {
    loadRecords();
  }, []);
  async function loadRecords() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/prisoner-labor`, fetchOptions());
      if (!res.ok) throw new Error('Ошибка загрузки');
      setRecords(await res.json());
    } catch (e) {
      openSnack(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  // Open add dialog and load lookups
  const openAdd = async () => {
    setSelection({ prisonerId: '', staffId: '' });
    setDialogOpen(true);
    try {
      const [prs, sts] = await Promise.all([
        fetch(`${API}/prisoners`, fetchOptions()).then(r => r.json()),
        fetch(`${API}/staff`, fetchOptions()).then(r => r.json()),
      ]);
      setPrisoners(prs);
      setStaff(sts);
    } catch {
      openSnack('Ошибка загрузки справочников', 'error');
    }
  };

  // Add new record
  const handleAdd = async () => {
    try {
      const payload = {
        id: { prisonerId: selection.prisonerId, staffId: selection.staffId },
        prisoner: { prisonerId: selection.prisonerId },
        staff: { staffId: selection.staffId },
      };
      const res = await fetch(
        `${API}/prisoner-labor`,
        fetchOptions({ method: 'POST', body: JSON.stringify(payload) })
      );
      if (!res.ok) throw new Error('Ошибка создания');
      openSnack('Запись добавлена');
      setDialogOpen(false);
      loadRecords();
    } catch (e) {
      openSnack(e.message, 'error');
    }
  };

  // Confirm deletion
  const confirmDelete = rec => setConfirmDel({ open: true, rec });

  // Delete record
  const handleDelete = async () => {
    const rec = confirmDel.rec;
    try {
      const res = await fetch(
        `${API}/prisoner-labor/${rec.id.prisonerId}/${rec.id.staffId}`,
        fetchOptions({ method: 'DELETE' })
      );
      if (!res.ok) throw new Error('Ошибка удаления');
      openSnack('Запись удалена');
      loadRecords();
    } catch (e) {
      openSnack(e.message, 'error');
    } finally {
      setConfirmDel({ open: false, rec: null });
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AppBar position="static" color="primary" sx={{ mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Трудоустройство заключённых
          </Typography>
          <Button color="inherit" startIcon={<AddIcon />} onClick={openAdd}>
            Добавить
          </Button>
        </Toolbar>
      </AppBar>

      <Grid container spacing={2}>
        <AnimatePresence>
          {records.map(rec => (
            <Grid
              key={`${rec.id.prisonerId}-${rec.id.staffId}`}
              item
              xs={12}
              sm={6}
              md={4}
            >
              <motion.div whileHover={{ scale: 1.02 }}>
                <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                  <CardHeader
                    avatar={<Avatar>{rec.id.prisonerId}</Avatar>}
                    title={`Закл. ID: ${rec.id.prisonerId}`}
                    subheader={
                      rec.prisoner
                        ? `${rec.prisoner.firstName} ${rec.prisoner.lastName}`
                        : '—'
                    }
                    action={
                      <Stack direction="row" spacing={1}>
                        <IconButton onClick={() => setViewRec(rec)}>
                          <InfoIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => confirmDelete(rec)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    }
                  />
                </Card>
              </motion.div>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      {/* Add Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Добавить запись</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Заключённый"
              select
              SelectProps={{ native: true }}
              value={selection.prisonerId}
              onChange={e =>
                setSelection(s => ({ ...s, prisonerId: e.target.value }))
              }
              fullWidth
            >
              <option value="" />
              {prisoners.map(p => (
                <option key={p.prisonerId} value={p.prisonerId}>
                  {p.prisonerId} — {p.firstName} {p.lastName}
                </option>
              ))}
            </TextField>
            <TextField
              label="Сотрудник"
              select
              SelectProps={{ native: true }}
              value={selection.staffId}
              onChange={e =>
                setSelection(s => ({ ...s, staffId: e.target.value }))
              }
              fullWidth
            >
              <option value="" />
              {staff.map(s => (
                <option key={s.staffId} value={s.staffId}>
                  {s.staffId} — {s.firstName} {s.lastName}
                </option>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleAdd}
            disabled={!selection.prisonerId || !selection.staffId}
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={!!viewRec}
        onClose={() => setViewRec(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Подробности</DialogTitle>
        <DialogContent dividers>
          {viewRec && (
            <Stack spacing={2}>
              <Typography>
                <strong>Заключённый:</strong>{' '}
                {viewRec.prisoner?.firstName}{' '}
                {viewRec.prisoner?.lastName} (ID:{' '}
                {viewRec.id.prisonerId})
              </Typography>
              <Typography>
                <strong>Сотрудник:</strong>{' '}
                {viewRec.staff?.firstName}{' '}
                {viewRec.staff?.lastName} (ID:{' '}
                {viewRec.id.staffId})
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewRec(null)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={confirmDel.open}
        onClose={() => setConfirmDel({ open: false, rec: null })}
      >
        <DialogTitle>Удалить запись?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDel({ open: false, rec: null })}>
            Нет
          </Button>
          <Button color="error" onClick={handleDelete}>
            Да
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={closeSnack}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnack} severity={snack.sev} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
