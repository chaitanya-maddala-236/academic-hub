const authorizeRole = (...roles) => {
  // Flatten the roles array in case an array is passed
  const flatRoles = roles.flat();
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login first.'
      });
    }

    if (!flatRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Alias for consistency with usage in routes
const requireRole = authorizeRole;

module.exports = { authorizeRole, requireRole };
