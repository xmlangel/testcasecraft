#!/bin/bash
# RAGContext axios to api() conversion helper

# This script helps identify patterns in RAGContext.jsx for manual conversion

echo "=== RAGContext axios Pattern Analysis ==="
echo ""

# Count different types of axios calls
echo "POST calls: $(grep -c 'axiosInstance.post' src/main/frontend/src/context/RAGContext.jsx)"
echo "GET calls: $(grep -c 'axiosInstance.get' src/main/frontend/src/context/RAGContext.jsx)"
echo "DELETE calls: $(grep -c 'axiosInstance.delete' src/main/frontend/src/context/RAGContext.jsx)"
echo "PATCH calls: $(grep -c 'axiosInstance.patch' src/main/frontend/src/context/RAGContext.jsx)"
echo "PUT calls: $(grep -c 'axiosInstance.put' src/main/frontend/src/context/RAGContext.jsx)"
echo ""
echo "Total: $(grep -c 'axiosInstance\.' src/main/frontend/src/context/RAGContext.jsx) calls"
echo ""

# Find lines with response.data pattern (needs to change to response.json())
echo "=== Lines with response.data (need to change to await response.json()) ==="
grep -n 'response\.data' src/main/frontend/src/context/RAGContext.jsx | head -20
