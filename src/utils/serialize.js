// Mongoose documents contain types React Server Components can't send to
// the client as-is — ObjectId instances and (for the product model's
// `specs` field) a real Map. These helpers convert a fetched document (or
// a plain lean() object) into a plain, JSON-safe object before it's passed
// as a prop into a Client Component.

export function serializeProduct(doc) {
  if (!doc) return null;
  const obj = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    ...obj,
    _id: String(obj._id),
    createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : null,
    updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : null,
    specs: obj.specs instanceof Map ? Object.fromEntries(obj.specs) : (obj.specs || {}),
  };
}

export function serializeReview(doc) {
  if (!doc) return null;
  const obj = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    ...obj,
    _id: String(obj._id),
    createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : null,
  };
}
