export default function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password, profilePic, isBusiness, isAdmin } = req.body;
    // Here you’d normally add user to DB, hash password, validation, etc.
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    // Just echo back for demo
    return res.status(201).json({ message: "User registered", user: { email, profilePic, isBusiness, isAdmin } });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
