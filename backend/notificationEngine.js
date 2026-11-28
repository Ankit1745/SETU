const crypto = require('crypto');

/**
 * SETU In-App Notification Engine
 * Stores & queries role-safe notifications across MongoDB Atlas and database.json fallback.
 */
function buildActorReadKey(user) {
  if (!user) return 'guest';
  return String(user.userId || user.id || user.setuId || user.phone || user.role || 'guest');
}

function canActorSeeNotification(n, user) {
  const role = String(n.targetRole || 'ALL').toUpperCase();
  const actorRole = user ? String(user.role || 'CUSTOMER').toUpperCase() : 'GUEST';
  const actorPhone = user?.phone ? String(user.phone).replace(/\D/g, '').slice(-10) : '';
  const actorId = user ? String(user.userId || user.id || user.setuId || '') : '';

  if (actorRole === 'ADMIN') return true;
  if (role === 'ADMIN') return false; // Never leak Admin-only alerts to normal users

  if (n.targetPhone) {
    return Boolean(actorPhone && n.targetPhone.replace(/\D/g, '').slice(-10) === actorPhone);
  }
  if (n.targetUserId) {
    return Boolean(actorId && String(n.targetUserId) === actorId);
  }
  if (role === 'ALL') return true;
  return role === actorRole;
}

async function emitNotification(deps, params) {
  const { getDbStatus, models, readLocalDb, writeLocalDb } = deps;
  const doc = {
    customId: `notif_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
    type: String(params.type || 'INFO').slice(0, 50),
    title: String(params.title || 'SETU अपडेट').slice(0, 140),
    message: String(params.message || '').slice(0, 420),
    targetRole: String(params.targetRole || 'ALL').toUpperCase(),
    targetUserId: String(params.targetUserId || ''),
    targetPhone: String(params.targetPhone || ''),
    readByKeys: [],
    meta: params.meta && typeof params.meta === 'object' ? params.meta : {},
    createdAt: new Date().toISOString(),
  };

  try {
    if (getDbStatus().isMongoConnected && models.Notification) {
      await models.Notification.create(doc);
    } else {
      const localData = readLocalDb();
      if (!Array.isArray(localData.notifications)) localData.notifications = [];
      localData.notifications.unshift(doc);
      localData.notifications = localData.notifications.slice(0, 100);
      writeLocalDb(localData);
    }
  } catch (err) {
    console.warn('[Notification] Emit warning:', err.message);
  }
  return doc;
}

async function listNotificationsForActor(deps, user, limit = 30) {
  const { getDbStatus, models, readLocalDb } = deps;
  const actorKey = buildActorReadKey(user);
  let rows = [];

  if (getDbStatus().isMongoConnected && models.Notification) {
    rows = await models.Notification.find().sort({ createdAt: -1 }).limit(80).lean();
  } else {
    const localData = readLocalDb();
    rows = Array.isArray(localData.notifications) ? localData.notifications : [];
  }

  const visible = rows
    .filter((n) => canActorSeeNotification(n, user))
    .slice(0, limit)
    .map((n) => {
      const readBy = Array.isArray(n.readByKeys) ? n.readByKeys : [];
      return {
        id: n.customId || n.id || String(n._id || ''),
        type: n.type || 'INFO',
        title: n.title,
        message: n.message,
        targetRole: n.targetRole || 'ALL',
        createdAt: n.createdAt || new Date().toISOString(),
        read: readBy.includes(actorKey),
        meta: n.meta || {},
      };
    });

  return {
    notifications: visible,
    unreadCount: visible.filter((x) => !x.read).length,
  };
}

async function markActorNotificationsRead(deps, user, notificationId) {
  const { getDbStatus, models, readLocalDb, writeLocalDb } = deps;
  const actorKey = buildActorReadKey(user);

  if (getDbStatus().isMongoConnected && models.Notification) {
    if (notificationId) {
      await models.Notification.updateOne(
        { customId: notificationId },
        { $addToSet: { readByKeys: actorKey } }
      );
    } else {
      const all = await models.Notification.find().sort({ createdAt: -1 }).limit(80);
      for (const doc of all) {
        if (canActorSeeNotification(doc, user) && !(doc.readByKeys || []).includes(actorKey)) {
          doc.readByKeys = [...(doc.readByKeys || []), actorKey];
          await doc.save();
        }
      }
    }
    return { success: true };
  }

  const localData = readLocalDb();
  if (!Array.isArray(localData.notifications)) localData.notifications = [];
  for (const n of localData.notifications) {
    const id = n.customId || n.id;
    if (notificationId && id !== notificationId) continue;
    if (!canActorSeeNotification(n, user)) continue;
    if (!Array.isArray(n.readByKeys)) n.readByKeys = [];
    if (!n.readByKeys.includes(actorKey)) n.readByKeys.push(actorKey);
  }
  writeLocalDb(localData);
  return { success: true };
}

module.exports = {
  emitNotification,
  listNotificationsForActor,
  markActorNotificationsRead,
};
