import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5', // Used in Login.jsx
    },
  },
  spacing: 8, // Default spacing unit (8px)
  typography: {
    // You can define typography variants here
  },
  components: {
    // You can define component-level overrides here
  },
});

export default theme;
