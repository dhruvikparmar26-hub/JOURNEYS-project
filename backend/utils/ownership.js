export const getUserId = (req) => {
  const id = req.user?._id || req.user?.id || null;
  return id ? id.toString() : null;
};

export const canAccessOwnedDocument = (req, doc) => {
  if (!doc) return false;

  const userId = getUserId(req);
  if (userId && doc.userId && doc.userId.toString() === userId) {
    return true;
  }

  return Boolean(!userId && req.guestId && doc.guestId === req.guestId);
};

export const getOwnerFields = (req) => {
  const userId = getUserId(req);
  return {
    userId: userId || null,
    guestId: userId ? null : req.guestId,
  };
};
