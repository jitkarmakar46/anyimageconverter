const crypto = require('crypto');

// Server-side only salt and expected hash (NEVER exposed to the browser)
const SERVER_SALT = "AnyImageConverter_Secure_Server_Salt_2026_X99!";
const EXPECTED_HASH = crypto.createHash('sha512').update("Jittus@123" + SERVER_SALT).digest('hex');

module.exports = async (req, res) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (_) {}
    }
    const { password } = body || {};

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password required' });
    }

    // Compute SHA-512 with server-side secret salt
    const inputHash = crypto.createHash('sha512').update(password + SERVER_SALT).digest('hex');

    // Constant-time comparison to prevent timing attacks
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(inputHash, 'hex'),
      Buffer.from(EXPECTED_HASH, 'hex')
    );

    if (!isMatch) {
      // Delay to defeat automated brute-force attempts
      await new Promise(r => setTimeout(r, 600));
      return res.status(401).json({ success: false, error: 'Incorrect password' });
    }

    // Generate signed session token with expiry timestamp (2 hours)
    const expiresAt = Date.now() + (2 * 60 * 60 * 1000);
    const payload = `aic_admin_${expiresAt}`;
    const signature = crypto.createHmac('sha256', SERVER_SALT).update(payload).digest('hex');
    const sessionToken = `${payload}.${signature}`;

    return res.status(200).json({
      success: true,
      token: sessionToken,
      expiresAt
    });
  } catch (err) {
    console.error('Server auth error:', err);
    return res.status(500).json({ error: 'Internal authentication error' });
  }
};
