exports.checkUserRole = (roles) => {
    return (req, res, next) => {
      if (!Array.isArray(roles)) {
        roles = [roles];
      }
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          success: false,
          message: "You don't have permission to access this resource"
        });
      }
      next();
    };
  };