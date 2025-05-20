export const ROLES = {
  ADMIN: 'admin',
  WARDEN: 'warden',
  GUARD: 'guard',
  LIBRARIAN: 'librarian',
  MEDIC: 'medic',
};

export const permissions = {
  prisoners: [
    ROLES.ADMIN,
    ROLES.WARDEN,
    ROLES.GUARD,
    ROLES.LIBRARIAN,
    ROLES.MEDIC,
  ],
  properties: [
    ROLES.ADMIN,
    ROLES.WARDEN,
    ROLES.GUARD,
    ROLES.LIBRARIAN,
    ROLES.MEDIC,
  ],
  courses: [ROLES.ADMIN, ROLES.WARDEN],
  labor: [ROLES.ADMIN, ROLES.WARDEN],
  borrowed: [ROLES.ADMIN, ROLES.LIBRARIAN],
  certificates: [ROLES.ADMIN, ROLES.WARDEN],
  ownCertificates: [ROLES.ADMIN, ROLES.WARDEN],
  staff: [ROLES.ADMIN],
  jobs: [ROLES.ADMIN],
  cells: [ROLES.ADMIN, ROLES.GUARD],
  security: [ROLES.ADMIN, ROLES.GUARD],
  visitors: [ROLES.ADMIN, ROLES.WARDEN, ROLES.GUARD],
  visitedBy: [ROLES.ADMIN, ROLES.WARDEN, ROLES.GUARD],
  infirmary: [ROLES.ADMIN, ROLES.MEDIC],
  library: [ROLES.ADMIN, ROLES.LIBRARIAN],
};