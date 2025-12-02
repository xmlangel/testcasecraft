// src/components/StatusInfoItem.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

const StatusInfoItem = ({ label, value, compact }) => (
  <Box sx={{
    display: 'flex',
    justifyContent: compact ? 'flex-start' : 'space-between',
    alignItems: 'center',
    gap: compact ? 1 : 0,
    mb: compact ? 0 : 1
  }}>
    <Typography variant="body2" color="text.secondary">{label}{compact && ':'}</Typography>
    <Typography variant="body2" fontWeight={compact ? 'bold' : 'normal'}>{value}</Typography>
  </Box>
);

StatusInfoItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  compact: PropTypes.bool
};

export default StatusInfoItem;
