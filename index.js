const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

initializeApp();
const db = getFirestore();
const auth = getAuth();

/**
 * Runs hourly. Accounts still suspended past their seven-day deadline are deleted
 * only if the user did not submit corrections before the deadline. If a correction
 * is awaiting admin review, the account remains suspended until an admin decides.
 */
exports.deleteExpiredSuspensions = onSchedule('every 60 minutes', async () => {
  const now = Timestamp.now();
  for (const collectionName of ['users', 'drivers']) {
    const expired = await db.collection(collectionName)
      .where('moderationStatus', '==', 'suspended')
      .where('suspensionExpiresAt', '<=', now)
      .get();

    for (const snap of expired.docs) {
      const data = snap.data();
      if (data.correctionStatus === 'pending_review') continue;
      const uid = snap.id;
      try { await auth.deleteUser(uid); }
      catch (error) {
        if (error.code !== 'auth/user-not-found') { console.error('Auth deletion failed; leaving profile data in place for retry', uid, error); continue; }
      }
      if (collectionName === 'drivers') {
        await db.collection('driverPrivate').doc(uid).delete().catch(() => {});
      }
      for (const field of ['passengerId', 'driverId']) {
        const related = await db.collection('bookings').where(field, '==', uid).get();
        const batch = db.batch();
        related.docs.forEach((booking) => batch.delete(booking.ref));
        if (!related.empty) await batch.commit();
      }
      await snap.ref.delete();
      await db.collection('adminNotifications').doc(`deleted_${collectionName === 'drivers' ? 'driver' : 'passenger'}_${uid}`).set({
        uid,
        role: collectionName === 'drivers' ? 'driver' : 'passenger',
        event: 'account_deleted_after_suspension_deadline',
        status: 'unread',
        deletedAt: Timestamp.now()
      });
    }
  }
});
