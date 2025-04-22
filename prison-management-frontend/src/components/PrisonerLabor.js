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
const API_PRISONERS = 'http://localhost:8080/api/prisoners'
const API_STAFF = 'http://localhost:8080/api/staff'

const PrisonerLaborFrontend = () => {
  const [recordList, setRecordList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // States for editing record
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [currentRecord, setCurrentRecord] = useState({ id: { prisonerId: '', staffId: '' } })

  // States for integrated creation dialog
  const [integratedDialogOpen, setIntegratedDialogOpen] = useState(false)
  const [prisonersList, setPrisonersList] = useState([])
  const [staffList, setStaffList] = useState([])
  const [loadingPrisoners, setLoadingPrisoners] = useState(false)
  const [loadingStaff, setLoadingStaff] = useState(false)
  const [errorPrisoners, setErrorPrisoners] = useState(null)
  const [errorStaff, setErrorStaff] = useState(null)

  // Advanced search state for records
  const [recordsSearch, setRecordsSearch] = useState('')

  // Snackbar for notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const navigate = useNavigate()

  // Fetch records from API
  const fetchRecords = () => {
    setLoading(true)
    fetch(API_PRISONER_LABOR)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Ошибка при загрузке данных')
        }
        return res.json()
      })
      .then((data) => {
        setRecordList(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  // Snackbar controls
  const openSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity })
  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false })

  // -------- Edit Record Dialog Handlers --------
  const handleOpenEditDialog = (record) => {
    setCurrentRecord(record)
    setOpenEditDialog(true)
  }
  const handleCloseEditDialog = () => setOpenEditDialog(false)
  const handleEditChange = (e) => {
    const { name, value } = e.target
    setCurrentRecord((prev) => ({
      ...prev,
      id: { ...prev.id, [name]: value }
    }))
  }
  const handleSubmitEdit = () => {
    fetch(
      `${API_PRISONER_LABOR}/${currentRecord.id.prisonerId}/${currentRecord.id.staffId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentRecord)
      }
    )
      .then((response) => {
        if (response.ok) {
          fetchRecords()
          handleCloseEditDialog()
          openSnackbar('Запись успешно обновлена')
        } else openSnackbar('Ошибка обновления записи', 'error')
      })
      .catch(() => openSnackbar('Ошибка обновления записи', 'error'))
  }

  // -------- Delete Record --------
  const handleDelete = (record) => {
    fetch(
      `${API_PRISONER_LABOR}/${record.id.prisonerId}/${record.id.staffId}`,
      { method: 'DELETE' }
    )
      .then((response) => {
        if (response.ok) {
          fetchRecords()
          openSnackbar('Запись удалена')
        } else openSnackbar('Ошибка удаления записи', 'error')
      })
      .catch(() => openSnackbar('Ошибка удаления записи', 'error'))
  }

  // -------- Integrated Creation Dialog Handlers --------
  const handleOpenIntegratedDialog = () => {
    setCurrentRecord({ id: { prisonerId: '', staffId: '' } })

    setLoadingPrisoners(true)
    fetch(API_PRISONERS)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Ошибка при загрузке данных заключённых')
        }
        return res.json()
      })
      .then((data) => {
        setPrisonersList(data)
        setLoadingPrisoners(false)
      })
      .catch((err) => {
        setErrorPrisoners(err)
        setLoadingPrisoners(false)
      })

    setLoadingStaff(true)
    fetch(API_STAFF)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Ошибка при загрузке данных сотрудников')
        }
        return res.json()
      })
      .then((data) => {
        setStaffList(data)
        setLoadingStaff(false)
      })
      .catch((err) => {
        setErrorStaff(err)
        setLoadingStaff(false)
      })

    setIntegratedDialogOpen(true)
  }
  const handleCloseIntegratedDialog = () => setIntegratedDialogOpen(false)

  const handleSelectPrisoner = (prisoner) => {
    setCurrentRecord((prev) => ({
      ...prev,
      id: { ...prev.id, prisonerId: String(prisoner.prisonerId) }
    }))
  }
  const handleSelectStaff = (staff) => {
    setCurrentRecord((prev) => ({
      ...prev,
      id: { ...prev.id, staffId: String(staff.staffId) }
    }))
  }

  const handleCreatePrisoner = () => {
    setIntegratedDialogOpen(false)
    navigate('/prisoners')
  }
  const handleCreateStaff = () => {
    setIntegratedDialogOpen(false)
    navigate('/staff')
  }

  const handleConfirmSelection = () => {
    const payload = {
      id: {
        prisonerId: currentRecord.id.prisonerId,
        staffId: currentRecord.id.staffId
      },
      prisoner: { prisonerId: currentRecord.id.prisonerId },
      staff: { staffId: currentRecord.id.staffId }
    }
    fetch(API_PRISONER_LABOR, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((response) => {
        if (response.ok) {
          fetchRecords()
          setIntegratedDialogOpen(false)
          openSnackbar('Запись успешно создана')
        } else openSnackbar('Ошибка создания записи', 'error')
      })
      .catch(() => openSnackbar('Ошибка создания записи', 'error'))
  }

  // Group records by prisonerId for expandable accordion view
  const groupedRecords = useMemo(() => {
    return recordList.reduce((acc, record) => {
      const prisonerId = record.prisoner?.prisonerId || record.id?.prisonerId
      if (prisonerId) {
        if (!acc[prisonerId]) acc[prisonerId] = []
        acc[prisonerId].push(record)
      }
      return acc
    }, {})
  }, [recordList])

  // Advanced filtering based on search query (by prisoner or staff info)
  const filteredGroupKeys = useMemo(() => {
    if (!recordsSearch.trim()) return Object.keys(groupedRecords)
    return Object.keys(groupedRecords).filter((prisonerId) =>
      groupedRecords[prisonerId].some(
        (record) =>
          (record.prisoner &&
            `${record.prisoner.firstName} ${record.prisoner.lastName}`
              .toLowerCase()
              .includes(recordsSearch.toLowerCase())) ||
          (record.staff &&
            `${record.staff.firstName} ${record.staff.lastName}`
              .toLowerCase()
              .includes(recordsSearch.toLowerCase()))
      )
    )
  }, [groupedRecords, recordsSearch])

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Записи трудоустройства заключённых
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleOpenIntegratedDialog}>
          Добавить запись
        </Button>
        <TextField
          variant="outlined"
          placeholder="Поиск записей..."
          value={recordsSearch}
          onChange={(e) => setRecordsSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            )
          }}
          sx={{ width: '300px' }}
        />
      </Box>
      {loading ? (
        <Typography>Загрузка...</Typography>
      ) : error ? (
        <Typography color="error">Ошибка: {error.message}</Typography>
      ) : Object.keys(groupedRecords).length > 0 ? (
        filteredGroupKeys.map((prisonerId) => (
          <Accordion key={prisonerId} defaultExpanded sx={{ mb: 2, borderRadius: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Заключённый ID: {prisonerId}
                {groupedRecords[prisonerId][0]?.prisoner &&
                  ` - ${groupedRecords[prisonerId][0].prisoner.firstName} ${groupedRecords[prisonerId][0].prisoner.lastName}`}
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
                  {groupedRecords[prisonerId].map((record, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        {record.staff?.staffId || record.id?.staffId || 'не найдено'}
                      </TableCell>
                      <TableCell>
                        {record.staff?.firstName
                          ? `${record.staff.firstName} ${record.staff.lastName}`
                          : '---'}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Удалить запись">
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(record)}
                            sx={{ mr: 1 }}
                          >
                            Удалить
                          </Button>
                        </Tooltip>
                        <Tooltip title="Редактировать запись">
                          <Button
                            variant="outlined"
                            onClick={() => handleOpenEditDialog(record)}
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

      {/* Dialog для редактирования записи */}
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

      {/* Dialog для создания записи */}
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
          <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
            Заключённые:
          </Typography>
          {loadingPrisoners ? (
            <Typography>Загрузка заключённых...</Typography>
          ) : errorPrisoners ? (
            <Typography color="error">{errorPrisoners.message}</Typography>
          ) : prisonersList.length > 0 ? (
            <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ccc', mb: 2 }}>
              {prisonersList.map((prisoner) => (
                <ListItem key={prisoner.prisonerId} disablePadding>
                  <ListItemButton onClick={() => handleSelectPrisoner(prisoner)}>
                    {currentRecord.id.prisonerId === String(prisoner.prisonerId) && (
                      <CheckIcon color="primary" sx={{ mr: 1 }} />
                    )}
                    <ListItemText
                      primary={`ID: ${prisoner.prisonerId} - ${prisoner.firstName} ${prisoner.lastName}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Нет заключённых</Typography>
              <Button onClick={handleCreatePrisoner} color="primary">
                Создать нового
              </Button>
            </Box>
          )}

          <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
            Сотрудники:
          </Typography>
          {loadingStaff ? (
            <Typography>Загрузка сотрудников...</Typography>
          ) : errorStaff ? (
            <Typography color="error">{errorStaff.message}</Typography>
          ) : staffList.length > 0 ? (
            <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ccc' }}>
              {staffList.map((staff) => (
                <ListItem key={staff.staffId} disablePadding>
                  <ListItemButton onClick={() => handleSelectStaff(staff)}>
                    {currentRecord.id.staffId === String(staff.staffId) && (
                      <CheckIcon color="primary" sx={{ mr: 1 }} />
                    )}
                    <ListItemText
                      primary={`ID: ${staff.staffId} - ${staff.firstName} ${staff.lastName}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography>Нет сотрудников</Typography>
              <Button onClick={handleCreateStaff} color="primary">
                Создать нового
              </Button>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">
              Выбранный ID заключённого:{' '}
              <strong>{currentRecord.id.prisonerId || 'не выбран'}</strong>
            </Typography>
            <Typography variant="body1">
              Выбранный ID сотрудника:{' '}
              <strong>{currentRecord.id.staffId || 'не выбран'}</strong>
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
