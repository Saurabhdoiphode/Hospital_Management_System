const AuditLog = require('../models/AuditLog');

const auditLog = (action, resource) => {
  return async (req, res, next) => {
    // Log after response is sent
    res.on('finish', async () => {
      if (req.user) {
        try {
          const audit = new AuditLog({
            user: req.user._id,
            action,
            resource,
            resourceId: req.params.id || req.body.id,
            details: {
              method: req.method,
              url: req.url,
              body: req.method !== 'GET' ? req.body : undefined
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent')
          });
          await audit.save();
        } catch (error) {
          console.error('Audit log error:', error);
        }
      }
    });
    next();
  };
};

module.exports = auditLog;

