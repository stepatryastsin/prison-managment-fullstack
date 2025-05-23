// src/routeConfig.js
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
import Statistics from './components/Statistics';

export const routeConfig = [
  { path: '/prisoners',                 label: 'Заключённые',               component: Prisoners,                allowed: ['admin','warden','guard','librarian','medic'] },
  { path: '/prisoners/properties',      label: 'Вещи',                     component: Properties,               allowed: ['admin','warden','guard','librarian','medic'] },
  { path: '/statistics',                label: 'Статистика',               component: Statistics,               allowed: ['admin','warden','guard','librarian','medic'] },

  { path: '/staff',                     label: 'Персонал',                 component: Staff,                    allowed: ['admin'] },
  { path: '/staff/job',                 label: 'Должности',                component: Job,                      allowed: ['admin'] },

  { path: '/cells',                     label: 'Камеры',                   component: Cells,                    allowed: ['admin','guard'] },
  { path: '/security-levels',           label: 'Уровни защиты',            component: SecurityLevels,           allowed: ['admin','guard'] },

  { path: '/prisoners/courses',         label: 'Обучение',                 component: Courses,                  allowed: ['admin','warden'] },
  { path: '/prisoners/prisoner-labor',  label: 'Труд',                     component: PrisonerLaborFrontend,    allowed: ['admin','warden'] },
  { path: '/prisoners/borrowed',        label: 'Книги',                    component: Borrowed,                 allowed: ['admin','librarian'] },
  { path: '/enrollments-certs',         label: 'Сертификаты',              component: Work,                     allowed: ['admin','warden'] },
  { path: '/own-certificate-from',      label: 'Собственные сертификаты',  component: OwnCertificateFromFrontend, allowed: ['admin','warden'] },

  { path: '/visitors',                  label: 'Регистрация посетителей',  component: Visitors,                 allowed: ['admin','warden','guard'] },
  { path: '/visited-by',                label: 'Посещаемость',             component: VisitedBy,                allowed: ['admin','warden','guard'] },

  { path: '/infirmary',                 label: 'Лазарет',                  component: Infirmary,                allowed: ['admin','medic'] },
  { path: '/library',                   label: 'Библиотека',               component: Library,                  allowed: ['admin','librarian'] },
];
