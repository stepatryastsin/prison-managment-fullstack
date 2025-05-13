import React, { useEffect, useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Snackbar,
  Alert,
  Slide,
  Tooltip
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckIcon from '@mui/icons-material/Check'
import SearchIcon from '@mui/icons-material/Search'
import { useNavigate } from 'react-router-dom'

const API_PRISONER_LABOR = 'http://localhost:8080/api/prisoner-labor'
const API_PRISONERS      = 'http://localhost:8080/api/prisoners'
const API_STAFF          = 'http://localhost:8080/api/staff'

const PrisonerLaborFrontend = () => {
  const [recordList, setRecordList]               = useState([])
  const [loading, setLoading]                     = useState(true)
  const [error, setError]                         = useState(null)
  const [openEditDialog, setOpenEditDialog]       = useState(false)
  const [currentRecord, setCurrentRecord]         = useState({ id: { prisonerId: '', staffId: '' } })
  const [integratedDialogOpen, setIntegratedDialogOpen] = useState(false)
  const [prisonersList, setPrisonersList]         = useState([])
  const [staffList, setStaffList]                 = useState([])
  const [loadingPrisoners, setLoadingPrisoners]   = useState(false)
  const [loadingStaff, setLoadingStaff]           = useState(false)
  const [errorPrisoners, setErrorPrisoners]       = useState(null)
  const [errorStaff, setErrorStaff]               = useState(null)
  const [recordsSearch, setRecordsSearch]         = useState('')
  const [snackbar, setSnackbar]                   = useState({ open: false, message: '', severity: 'success' })

  const navigate = useNavigate()

  // Fetch all records
  const fetchRecords = () => {
    setLoading(true)
    fetch(API_PRISONER_LABOR)
      .then(res => {
        if (!res.ok) throw new Error('Ошибка при загрузке данных')
        return res.json()
      })
      .then(data => {
        setRecordList(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }

  useEffect(fetchRecords, [])

  // Snackbar handlers
  const openSnackbar  = (msg, sev = 'success') => setSnackbar({ open: true, message: msg, severity: sev })
  const closeSnackbar = () => setSnackbar(snackbar => ({ ...snackbar, open: false }))

  // Edit dialog handlers
  const handleOpenEditDialog  = record => {
    setCurrentRecord(record)
    setOpenEditDialog(true)
  }
  const handleCloseEditDialog = () => setOpenEditDialog(false)
  const handleEditChange      = e => {
    const { name, value } = e.target
    setCurrentRecord(cr => ({
      ...cr,
      id: { ...cr.id, [name]: value }
    }))
  }
  const handleSubmitEdit     = () => {
    fetch(`${API_PRISONER_LABOR}/${currentRecord.id.prisonerId}/${currentRecord.id.staffId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentRecord)
    })
      .then(res => {
        if (res.ok) {
          fetchRecords()
          handleCloseEditDialog()
          openSnackbar('Запись успешно обновлена')
        } else {
          openSnackbar('Ошибка обновления записи', 'error')
        }
      })
      .catch(() => openSnackbar('Ошибка обновления записи', 'error'))
  }

  // Delete
  const handleDelete = record => {
    fetch(`${API_PRISONER_LABOR}/${record.id.prisonerId}/${record.id.staffId}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) {
          fetchRecords()
          openSnackbar('Запись удалена')
        } else {
          openSnackbar('Ошибка удаления записи', 'error')
        }
      })
      .catch(() => openSnackbar('Ошибка удаления записи', 'error'))
  }

  // Integrated creation dialog handlers
  const handleOpenIntegratedDialog = () => {
    setCurrentRecord({ id: { prisonerId: '', staffId: '' }})
    setLoadingPrisoners(true)
    fetch(API_PRISONERS)
      .then(res => {
        if (!res.ok) throw new Error('Ошибка при загрузке данных заключённых')
        return res.json()
      })
      .then(data => {
        setPrisonersList(data)
        setLoadingPrisoners(false)
      })
      .catch(err => {
        setErrorPrisoners(err)
        setLoadingPrisoners(false)
      })

    setLoadingStaff(true)
    fetch(API_STAFF)
      .then(res => {
        if (!res.ok) throw new Error('Ошибка при загрузке данных сотрудников')
        return res.json()
      })
      .then(data => {
        setStaffList(data)
        setLoadingStaff(false)
      })
      .catch(err => {
        setErrorStaff(err)
        setLoadingStaff(false)
      })

    setIntegratedDialogOpen(true)
  }
  const handleCloseIntegratedDialog = () => setIntegratedDialogOpen(false)
  const handleSelectPrisoner        = p => setCurrentRecord(cr => ({
    ...cr,
    id: { ...cr.id, prisonerId: String(p.prisonerId) }
  }))
  const handleSelectStaff           = s => setCurrentRecord(cr => ({
    ...cr,
    id: { ...cr.id, staffId: String(s.staffId) }
  }))
  const handleCreatePrisoner        = () => { setIntegratedDialogOpen(false); navigate('/prisoners') }
  const handleCreateStaff           = () => { setIntegratedDialogOpen(false); navigate('/staff') }
  const handleConfirmSelection      = () => {
    const payload = {
      id: { prisonerId: currentRecord.id.prisonerId, staffId: currentRecord.id.staffId },
      prisoner: { prisonerId: currentRecord.id.prisonerId },
      staff:    { staffId: currentRecord.id.staffId }
    }
    fetch(API_PRISONER_LABOR, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    })
      .then(res => {
        if (res.ok) {
          fetchRecords()
          setIntegratedDialogOpen(false)
          openSnackbar('Запись успешно создана')
        } else {
          openSnackbar('Ошибка создания записи', 'error')
        }
      })
      .catch(() => openSnackbar('Ошибка создания записи', 'error'))
  }

  // Group by prisonerId
  const groupedRecords = useMemo(() => {
    return recordList.reduce((acc, rec) => {
      const pid = rec.prisoner?.prisonerId || rec.id?.prisonerId
      if (!acc[pid]) acc[pid] = []
      acc[pid].push(rec)
      return acc
    }, {})
  }, [recordList])

  // Filter groups by search
  const filteredGroupKeys = useMemo(() => {
    if (!recordsSearch.trim()) return Object.keys(groupedRecords)
    return Object.keys(groupedRecords).filter(pid =>
      groupedRecords[pid].some(rec =>
        (rec.prisoner &&
         `${rec.prisoner.firstName} ${rec.prisoner.lastName}`
           .toLowerCase().includes(recordsSearch.toLowerCase())
        ) || (
         rec.staff &&
         `${rec.staff.firstName} ${rec.staff.lastName}`
           .toLowerCase().includes(recordsSearch.toLowerCase())
        )
      )
    )
  }, [groupedRecords, recordsSearch])

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Записи трудоустройства заключённых
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button variant="contained" onClick={handleOpenIntegratedDialog}>
          Добавить запись
        </Button>
        <TextField
          variant="outlined"
          placeholder="Поиск..."
          size="small"
          value={recordsSearch}
          onChange={e => setRecordsSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            )
          }}
          sx={{ width: 300 }}
        />
      </Box>

      {loading ? (
        <Typography>Загрузка...</Typography>
      ) : error ? (
        <Typography color="error">Ошибка: {error.message}</Typography>
      ) : Object.keys(groupedRecords).length ? (
        filteredGroupKeys.map(pid => (
          <Accordion key={pid} sx={{ mb: 2, borderRadius: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                Заключённый ID: {pid}
                {groupedRecords[pid][0]?.prisoner &&
                  ` — ${groupedRecords[pid][0].prisoner.firstName} ${groupedRecords[pid][0].prisoner.lastName}`}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>ID сотрудника</strong></TableCell>
                    <TableCell><strong>Имя сотрудника</strong></TableCell>
                    <TableCell align="center"><strong>Действия</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupedRecords[pid].map((rec, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{rec.staff?.staffId || rec.id.staffId}</TableCell>
                      <TableCell>
                        {rec.staff
                          ? `${rec.staff.firstName} ${rec.staff.lastName}`
                          : '—'}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Удалить">
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(rec)}
                            sx={{ mr: 1 }}
                          >
                            Удалить
                          </Button>
                        </Tooltip>
                        <Tooltip title="Редактировать">
                          <Button
                            variant="outlined"
                            onClick={() => handleOpenEditDialog(rec)}
                          >
                            Редактировать
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography>Записей не найдено</Typography>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle>Редактировать запись</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="prisonerId"
            label="ID заключённого"
            type="number"
            fullWidth
            variant="standard"
            value={currentRecord.id.prisonerId}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="staffId"
            label="ID сотрудника"
            type="number"
            fullWidth
            variant="standard"
            value={currentRecord.id.staffId}
            onChange={handleEditChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Отмена</Button>
          <Button onClick={handleSubmitEdit}>Обновить</Button>
        </DialogActions>
      </Dialog>

      {/* Integrated Create Dialog */}
      <Dialog
        open={integratedDialogOpen}
        onClose={handleCloseIntegratedDialog}
        fullWidth
        maxWidth="md"
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle>Выберите заключённого и сотрудника</DialogTitle>
        <DialogContent dividers>
          {/* Prisoner List */}
          <Typography variant="subtitle1" sx={{ mt: 1 }}>Заключённые:</Typography>
          {loadingPrisoners ? (
            <Typography>Загрузка заключённых...</Typography>
          ) : errorPrisoners ? (
            <Typography color="error">{errorPrisoners.message}</Typography>
          ) : prisonersList.length ? (
            <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ccc', mb: 2 }}>
              {prisonersList.map(p => (
                <ListItem key={p.prisonerId} disablePadding>
                  <ListItemButton onClick={() => handleSelectPrisoner(p)}>
                    {currentRecord.id.prisonerId === String(p.prisonerId) && (
                      <CheckIcon color="primary" sx={{ mr: 1 }} />
                    )}
                    <ListItemText
                      primary={`ID: ${p.prisonerId} — ${p.firstName} ${p.lastName}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Нет заключённых</Typography>
              <Button onClick={handleCreatePrisoner}>Создать нового</Button>
            </Box>
          )}

          {/* Staff List */}
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Сотрудники:</Typography>
          {loadingStaff ? (
            <Typography>Загрузка сотрудников...</Typography>
          ) : errorStaff ? (
            <Typography color="error">{errorStaff.message}</Typography>
          ) : staffList.length ? (
            <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ccc' }}>
              {staffList.map(s => (
                <ListItem key={s.staffId} disablePadding>
                  <ListItemButton onClick={() => handleSelectStaff(s)}>
                    {currentRecord.id.staffId === String(s.staffId) && (
                      <CheckIcon color="primary" sx={{ mr: 1 }} />
                    )}
                    <ListItemText
                      primary={`ID: ${s.staffId} — ${s.firstName} ${s.lastName}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Нет сотрудников</Typography>
              <Button onClick={handleCreateStaff}>Создать нового</Button>
            </Box>
          )}

          {/* Selected IDs */}
          <Box sx={{ mt: 2 }}>
            <Typography>
              Выбранный заключённый: <strong>{currentRecord.id.prisonerId || 'не выбран'}</strong>
            </Typography>
            <Typography>
              Выбранный сотрудник: <strong>{currentRecord.id.staffId || 'не выбран'}</strong>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseIntegratedDialog}>Отмена</Button>
          <Button
            onClick={handleConfirmSelection}
            color="primary"
            disabled={!currentRecord.id.prisonerId || !currentRecord.id.staffId}
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default PrisonerLaborFrontend
