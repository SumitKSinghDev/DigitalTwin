import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'digital_twin_jwt_secure_key_2026_student_success';
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};

export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'digital_twin_jwt_secure_key_2026_student_success';
  return jwt.verify(token, secret);
};
