export default function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;
    // Normally verify user & password, generate token, etc.
    if (email === "test@example.com" && password === "password") {
      return res.status(200).json({ message: "Login successful", token: "fake-jwt-token" });
    } else {
      return res.status(401).json({ error: "Invalid credentials" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
