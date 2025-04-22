import React, { useEffect, useState, useMemo } from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Button,
  Stack,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  Slide,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import DeleteIcon from '@mui/icons-material/Delete'

const API_URL = 'http://localhost:8080/api/sl'

const SecurityLevels = () => {
  const [securityLevels, setSecurityLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingLevelNo, setEditingLevelNo] = useState(null)
  const [editingDescription, setEditingDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, levelNo: null })

  useEffect(() => {
    fetchSecurityLevels()
  }, [])

  const fetchSecurityLevels = async () => {
    setLoading(true)
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Сетевая ошибка')
      const data = await response.json()
      setSecurityLevels(data)
    } catch (error) {
      console.error('Ошибка загрузки уровней безопасности:', error)
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (level) => {
    setEditingLevelNo(level.securityLevelNo)
    setEditingDescription(level.description)
  }

  const handleCancel = () => {
    setEditingLevelNo(null)
    setEditingDescription('')
  }

  const handleSave = async (securityLevelNo) => {
    try {
      const response = await fetch(`${API_URL}/${securityLevelNo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ securityLevelNo, description: editingDescription }),
      })
      if (!response.ok) throw new Error('Ошибка обновления данных')
      openSnackbar('Уровень безопасности обновлён', 'success')
      fetchSecurityLevels()
      handleCancel()
    } catch (error) {
      console.error('Ошибка при обновлении уровня безопасности:', error)
      openSnackbar('Ошибка обновления', 'error')
    }
  }

  const handleDelete = async (levelNo) => {
    try {
      const response = await fetch(`${API_URL}/${levelNo}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Ошибка удаления')
      openSnackbar('Уровень безопасности удалён', 'success')
      fetchSecurityLevels()
    } catch (error) {
      console.error('Ошибка при удалении:', error)
      openSnackbar('Ошибка удаления', 'error')
    } finally {
      setDeleteConfirm({ open: false, levelNo: null })
    }
  }

  const filteredLevels = useMemo(() => {
    if (!searchQuery.trim()) return securityLevels
    return securityLevels.filter(level =>
      String(level.securityLevelNo).includes(searchQuery) ||
      level.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [securityLevels, searchQuery])

  const openSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false })

  return (
    <Paper sx={{ p: 3, maxWidth: 1000, mx: 'auto', my: 3, boxShadow: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Уровни безопасности
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Поиск по уровню или описанию"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
        {loading && <CircularProgress size={24} />}
      </Box>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error.message}
        </Typography>
      )}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Table>
          <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
            <TableRow>
              <TableCell><strong>Номер уровня</strong></TableCell>
              <TableCell><strong>Описание</strong></TableCell>
              <TableCell align="center"><strong>Действия</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLevels.map(level => (
              <TableRow key={level.securityLevelNo} hover>
                <TableCell>{level.securityLevelNo}</TableCell>
                <TableCell>
                  {editingLevelNo === level.securityLevelNo ? (
                    <TextField
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      variant="outlined"
                      size="small"
                      fullWidth
                    />
                  ) : (
                    level.description
                  )}
                </TableCell>
                <TableCell align="center">
                  {editingLevelNo === level.securityLevelNo ? (
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Сохранить">
                        <IconButton color="primary" onClick={() => handleSave(level.securityLevelNo)}>
                          <SaveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Отмена">
                        <IconButton color="secondary" onClick={handleCancel}>
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Редактировать">
                        <IconButton onClick={() => handleEdit(level)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton color="error" onClick={() => setDeleteConfirm({ open: true, levelNo: level.securityLevelNo })}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredLevels.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Нет данных
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={closeSnackbar} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, levelNo: null })}>
        <DialogTitle>Удаление уровня</DialogTitle>
        <DialogContent>
          Вы уверены, что хотите удалить уровень безопасности №{deleteConfirm.levelNo}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, levelNo: null })}>Отмена</Button>
          <Button onClick={() => handleDelete(deleteConfirm.levelNo)} color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default SecurityLevels
