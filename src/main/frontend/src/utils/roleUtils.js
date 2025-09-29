export const getRoleChipColor = (role) => {
  switch (role) {
    case 'OWNER': return 'error';
    case 'ADMIN': return 'warning';
    case 'MEMBER': return 'default';
    default: return 'default';
  }
};

export const getRoleDisplayName = (role) => {
  switch (role) {
    case 'OWNER': return 'Owner';
    case 'ADMIN': return 'Admin';
    case 'MEMBER': return 'Member';
    default: return role;
  }
};
