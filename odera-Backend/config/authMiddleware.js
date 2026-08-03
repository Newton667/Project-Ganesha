const supabase = require('./supabaseClient');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' });
  
  req.user = user; // attach user to request
  next();
};

module.exports = authMiddleware;