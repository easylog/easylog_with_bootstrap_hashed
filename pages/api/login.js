import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const client = new MongoClient(process.env.MONGODB_URI);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    await client.connect();
    const db = client.db('easylog');
    const users = db.collection('users');

    const user = await users.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ message: 'Benutzer nicht gefunden' });

    const isValid = await bcrypt.compare(req.body.password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Falsches Passwort' });

    const token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '1d' }
    );

    return res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Interner Serverfehler' });
  }
}
