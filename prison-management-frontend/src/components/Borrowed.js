import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8080/api/borrowed';
const PRISONERS_URL = 'http://localhost:8080/api/prisoners';
const BOOKS_URL = 'http://localhost:8080/api/libraries';

const BorrowedFrontend = () => {
  const [borrowedList, setBorrowedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [integratedDialogOpen, setIntegratedDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecord, setCurrentRecord] = useState({ id: { prisonerId: '', isbn: '' } });

  const [prisonersList, setPrisonersList] = useState([]);
  const [booksList, setBooksList] = useState([]);
  const [loadingPrisoners, setLoadingPrisoners] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [errorPrisoners, setErrorPrisoners] = useState(null);
  const [errorBooks, setErrorBooks] = useState(null);

  const [openPrisonerDetailDialog, setOpenPrisonerDetailDialog] = useState(false);
  const [prisonerDetail, setPrisonerDetail] = useState(null);
  const [openBookDetailDialog, setOpenBookDetailDialog] = useState(false);
  const [bookDetail, setBookDetail] = useState(null);

  const navigate = useNavigate();

  const fetchBorrowed = () => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Ошибка при загрузке записей Borrowed');
        }
        return res.json();
      })
      .then((data) => {
        setBorrowedList(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBorrowed();
  }, []);

  const handleDelete = (record) => {
    fetch(`${API_URL}/${record.id.prisonerId}/${record.id.isbn}`, {
      method: 'DELETE',
    }).then((response) => {
      if (response.ok) {
        fetchBorrowed();
      }
    });
  };

  const handleOpenIntegratedDialogForCreate = () => {
    setIsEditing(false);
    setCurrentRecord({ id: { prisonerId: '', isbn: '' } });
    openIntegratedDialog();
  };

  const handleOpenIntegratedDialogForEdit = (record) => {
    setIsEditing(true);
    setCurrentRecord(record);
    openIntegratedDialog();
  };

  const openIntegratedDialog = () => {
    // Загрузка заключённых
    setLoadingPrisoners(true);
    fetch(PRISONERS_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Ошибка при загрузке данных заключённых');
        }
        return res.json();
      })
      .then((data) => {
        setPrisonersList(data);
        setLoadingPrisoners(false);
      })
      .catch((err) => {
        setErrorPrisoners(err);
        setLoadingPrisoners(false);
      });

    setLoadingBooks(true);
    fetch(BOOKS_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Ошибка при загрузке данных книг');
        }
        return res.json();
      })
      .then((data) => {
        setBooksList(data);
        setLoadingBooks(false);
      })
      .catch((err) => {
        setErrorBooks(err);
        setLoadingBooks(false);
      });

    setIntegratedDialogOpen(true);
  };

  const handleCloseIntegratedDialog = () => setIntegratedDialogOpen(false);

  const handleSelectPrisoner = (prisoner) => {
    setCurrentRecord((prev) => ({
      ...prev,
      id: { ...prev.id, prisonerId: prisoner.prisonerId },
    }));
  };

  const handleSelectBook = (book) => {
    setCurrentRecord((prev) => ({
      ...prev,
      id: { ...prev.id, isbn: book.isbn },
    }));
  };

  const handleCreatePrisoner = () => {
    setIntegratedDialogOpen(false);
    navigate('/prisoners');
  };
  const handleCreateBook = () => {
    setIntegratedDialogOpen(false);
    navigate('/library');
  };

  const handleConfirmSelection = () => {
    const payload = {
      id: {
        prisonerId: currentRecord.id.prisonerId,
        isbn: currentRecord.id.isbn,
      },
      prisoner: { prisonerId: currentRecord.id.prisonerId },
      library: { isbn: currentRecord.id.isbn },
    };

    if (isEditing) {
      fetch(`${API_URL}/${currentRecord.id.prisonerId}/${currentRecord.id.isbn}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((response) => {
        if (response.ok) {
          fetchBorrowed();
          handleCloseIntegratedDialog();
        }
      });
    } else {
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((response) => {
        if (response.ok) {
          fetchBorrowed();
          handleCloseIntegratedDialog();
        }
      });
    }
  };

  const handleShowPrisonerDetails = (prisonerId) => {
    fetch(`${PRISONERS_URL}/${prisonerId}`)
      .then((res) => res.json())
      .then((data) => {
        setPrisonerDetail(data);
        setOpenPrisonerDetailDialog(true);
      });
  };
  const handleClosePrisonerDetailDialog = () => {
    setOpenPrisonerDetailDialog(false);
    setPrisonerDetail(null);
  };

  const handleShowBookDetails = (isbn) => {
    fetch(`${BOOKS_URL}/${isbn}`)
      .then((res) => res.json())
      .then((data) => {
        setBookDetail(data);
        setOpenBookDetailDialog(true);
      });
  };
  const handleCloseBookDetailDialog = () => {
    setOpenBookDetailDialog(false);
    setBookDetail(null);
  };

  const groupedBorrowed = borrowedList.reduce((acc, record) => {
    const prisonerId = record.prisoner?.prisonerId || record.id?.prisonerId;
    if (prisonerId) {
      if (!acc[prisonerId]) {
        acc[prisonerId] = [];
      }
      acc[prisonerId].push(record);
    }
    return acc;
  }, {});

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
        Записи о заимствовании книг
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleOpenIntegratedDialogForCreate}>
          Добавить запись
        </Button>
      </Box>
      {loading ? (
        <Typography align="center">Загрузка...</Typography>
      ) : error ? (
        <Typography align="center" color="error">
          Ошибка: {error.message}
        </Typography>
      ) : (
        Object.keys(groupedBorrowed).length > 0 &&
        Object.keys(groupedBorrowed).map((prisonerId) => (
          <Accordion key={prisonerId} defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Typography variant="subtitle1">
                  Заключённый ID: {prisonerId}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleShowPrisonerDetails(prisonerId)}
                >
                  Подробнее о заключённом
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ISBN</TableCell>
                    <TableCell>Название книги</TableCell>
                    <TableCell>Жанр</TableCell>
                    <TableCell align="center">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupedBorrowed[prisonerId].map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Button
                          variant="text"
                          onClick={() =>
                            handleShowBookDetails(record.library?.ISBN || record.id?.isbn)
                          }
                        >
                          {record.library?.ISBN || record.id?.isbn || 'не найдено'}
                        </Button>
                      </TableCell>
                      <TableCell>{record.library?.bookName || '---'}</TableCell>
                      <TableCell>{record.library?.genre || '---'}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => handleDelete(record)}
                        >
                          Удалить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        ))
      )}

      <Dialog
        open={integratedDialogOpen}
        onClose={handleCloseIntegratedDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {isEditing ? 'Редактировать запись' : 'Добавить запись'}
        </DialogTitle>
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
                    {currentRecord.id.prisonerId === prisoner.prisonerId && (
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
            Книги:
          </Typography>
          {loadingBooks ? (
            <Typography>Загрузка книг...</Typography>
          ) : errorBooks ? (
            <Typography color="error">{errorBooks.message}</Typography>
          ) : booksList.length > 0 ? (
            <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ccc' }}>
              {booksList.map((book) => (
                <ListItem key={book.isbn} disablePadding>
                  <ListItemButton onClick={() => handleSelectBook(book)}>
                    {currentRecord.id.isbn === book.isbn && (
                      <CheckIcon color="primary" sx={{ mr: 1 }} />
                    )}
                    <ListItemText primary={`ISBN: ${book.isbn} - ${book.bookName}`} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography>Нет книг</Typography>
              <Button onClick={handleCreateBook} color="primary">
                Создать новую
              </Button>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">
              Выбранный ID заключённого:{' '}
              <strong>{currentRecord.id.prisonerId || 'не выбран'}</strong>
            </Typography>
            <Typography variant="body1">
              Выбранный ISBN книги:{' '}
              <strong>{currentRecord.id.isbn || 'не выбран'}</strong>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseIntegratedDialog}>Отмена</Button>
          <Button
            onClick={handleConfirmSelection}
            color="primary"
            disabled={!currentRecord.id.prisonerId || !currentRecord.id.isbn}
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPrisonerDetailDialog} onClose={handleClosePrisonerDetailDialog}>
        <DialogTitle>Детальная информация о заключённом</DialogTitle>
        <DialogContent>
          {prisonerDetail ? (
            <Box>
              <Typography>ID: {prisonerDetail.prisonerId}</Typography>
              <Typography>Имя: {prisonerDetail.firstName}</Typography>
              <Typography>Фамилия: {prisonerDetail.lastName}</Typography>
            </Box>
          ) : (
            <Typography>Загрузка...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrisonerDetailDialog}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openBookDetailDialog} onClose={handleCloseBookDetailDialog}>
        <DialogTitle>Детальная информация о книге</DialogTitle>
        <DialogContent>
          {bookDetail ? (
            <Box>
              <Typography>ISBN: {bookDetail.isbn}</Typography>
              <Typography>Название: {bookDetail.bookName}</Typography>
              <Typography>Жанр: {bookDetail.genre}</Typography>
            </Box>
          ) : (
            <Typography>Загрузка...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBookDetailDialog}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BorrowedFrontend;
