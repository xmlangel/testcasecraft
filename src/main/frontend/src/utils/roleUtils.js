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
    case 'OWNER': return '소유자';
    case 'ADMIN': return '관리자';
    case 'MEMBER': return '멤버';
    default: return role;
  }
};
