import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const client = new MongoClient(process.env.MONGODB_URI);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Nur GET erlaubt' });
  }

  try {
    await client.connect();
    const db = client.db('easylog');
    const users = db.collection('users');

    const adminExists = await users.findOne({ email: 'admin@easylog.ch' });
    if (adminExists) return res.status(200).json({ message: 'Benutzer existieren schon.' });

    await users.insertMany([
      {
        email: 'admin@easylog.ch',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      },
      {
        email: 'staff@easylog.ch',
        password: await bcrypt.hash('staff123', 10),
        role: 'staff'
      }
    ]);

    res.status(201).json({ message: 'Benutzer erstellt ✅' });
  } catch (err) {
    console.error('Bootstrap-Fehler:', err);
    res.status(500).json({ message: 'Fehler beim Erstellen' });
  }
}
