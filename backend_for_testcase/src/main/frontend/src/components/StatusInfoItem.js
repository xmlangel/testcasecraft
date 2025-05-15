// src/components/StatusInfoItem.js
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

const StatusInfoItem = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
    <Typography variant="body2">{label}</Typography>
    <Typography variant="body2">{value}</Typography>
  </Box>
);

StatusInfoItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired
};

export default StatusInfoItem;
