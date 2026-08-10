import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'spun-dev-secret-change-me';

export function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, SECRET, { expiresIn: '7d' });
}

/** Reads and verifies the Bearer token from a Next.js Request. Returns the decoded payload or null. */
export function getUserFromRequest(request) {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function requireUser(request) {
  const user = getUserFromRequest(request);
  if (!user) throw new ApiError(401, 'Not authenticated');
  return user;
}

export function requireAdmin(request) {
  const user = requireUser(request);
  if (user.role !== 'admin') throw new ApiError(403, 'Admin access required');
  return user;
}
