import db from '../config/db.js';

export class OtpSession {
  /**
   * Generates or retrieves an OTP session for a phone number
   */
  static create({ phone, purpose = 'login', metadata = null, ttlMinutes = 10 }) {
    // Demo accounts always use fixed OTP for hackathon judges
    const DEMO_PHONES = ['9000000000', '9876543210', '9111111111', '9820011223'];
    let otp;
    if (DEMO_PHONES.includes(phone)) {
      otp = '123456';
    } else {
      // Random 6-digit OTP
      otp = Math.floor(100000 + Math.random() * 900000).toString();
    }

    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
    const metaStr = metadata ? JSON.stringify(metadata) : null;

    // Delete any prior unverified sessions for this phone
    db.prepare('DELETE FROM otp_sessions WHERE phone = ? AND is_verified = 0').run(phone);

    const stmt = db.prepare(`
      INSERT INTO otp_sessions (phone, otp, purpose, metadata, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(phone, otp, purpose, metaStr, expiresAt);

    return {
      id: result.lastInsertRowid,
      phone,
      otp, // returned for display/demo TTS speech output
      purpose,
      expiresAt
    };
  }

  /**
   * Verifies an OTP code for a given phone number
   */
  static verify(phone, otp) {
    // Universal demo hackathon override
    const DEMO_PHONES = ['9000000000', '9876543210', '9111111111', '9820011223'];
    if (DEMO_PHONES.includes(phone) && otp === '123456') {
      return { success: true, phone, demo: true };
    }

    const session = db.prepare(`
      SELECT * FROM otp_sessions 
      WHERE phone = ? AND otp = ? AND is_verified = 0 AND expires_at > datetime('now')
      ORDER BY id DESC LIMIT 1
    `).get(phone, otp);

    if (!session) {
      return { success: false, error: 'Invalid or expired OTP. Please try again.' };
    }

    // Mark verified
    db.prepare('UPDATE otp_sessions SET is_verified = 1 WHERE id = ?').run(session.id);

    return {
      success: true,
      phone,
      purpose: session.purpose,
      metadata: session.metadata ? JSON.parse(session.metadata) : null
    };
  }
}
