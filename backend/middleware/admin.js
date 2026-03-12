module.exports = (req, res, next) => {
  // Check if user exists (auth middleware should run first)
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  
  // User is admin, proceed
  next();
};