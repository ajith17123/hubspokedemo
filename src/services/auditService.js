/* ==========================================================================
   Audit Service: Log System Actions & Audit Trails
   ========================================================================== */

const AUDIT_LOGS_KEY = 'LIMS_AUDIT_LOGS';

export const getAuditLogs = () => {
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading audit logs:', e);
    return [];
  }
};

export const logAuditAction = (action, entityType, entityId, description, user = 'System') => {
  try {
    const logs = getAuditLogs();
    const newEntry = {
      auditId: `AUD-${Date.now()}`,
      action,
      entityType,
      entityId,
      description,
      user: typeof user === 'object' ? user.welcomeName || user.username : user,
      timestamp: new Date().toLocaleString('en-GB')
    };
    const updated = [newEntry, ...logs];
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updated.slice(0, 100))); // Keep latest 100 entries
    return newEntry;
  } catch (e) {
    console.error('Error writing audit log:', e);
  }
};
