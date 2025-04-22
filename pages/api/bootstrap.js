import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    await client.connect();
    const db = client.db('easylog');
    const users = db.collection('users');

    const existing = await users.find({}).toArray();
    if (existing.length > 0) {
      return res.status(200).json({ message: 'Benutzer bereits vorhanden.' });
    }

    const hashedAdmin = await bcrypt.hash('admin123', 10);
    const hashedStaff = await bcrypt.hash('staff123', 10);

    await users.insertMany([
      {
        email: 'admin@easylog.ch',
        password: hashedAdmin,
        role: 'admin',
      },
      {
        email: 'staff@easylog.ch',
        password: hashedStaff,
        role: 'staff',
      },
    ]);

    res.status(201).json({ message: 'Standard-Benutzer erfolgreich erstellt.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
}