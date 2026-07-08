import PriceAlert from '../models/PriceAlert.js';
import Notification from '../models/Notification.js';
import { getRouteEstimate } from '../services/routing.js';
// ^ reuses the SAME service your GET /api/route endpoint already uses,
//   so pricing logic (major-routes.json -> RouteCache -> Google Routes API
//   -> Haversine fallback) is not duplicated.

/**
 * checkAllActiveAlerts
 * Flow:
 *   -> fetch all PriceAlert docs where status = "active" and not expired
 *   -> for each: call routing service for current cost estimate on `mode`
 *   -> update lastCheckedPrice / lastCheckedAt
 *   -> if price <= thresholdAmount:
 *        -> set status = "triggered", triggeredAt = now
 *        -> create Notification for the user
 *   -> if expiresAt has passed: set status = "expired"
 */
export async function checkAllActiveAlerts() {
  const now = new Date();
  const alerts = await PriceAlert.find({ status: 'active' });

  for (const alert of alerts) {
    try {
      if (alert.expiresAt && alert.expiresAt < now) {
        alert.status = 'expired';
        await alert.save();
        continue;
      }

      const estimate = await getRouteEstimate({
        origin: alert.origin,
        destination: alert.destination,
        mode: alert.mode === 'all' ? undefined : alert.mode,
      });

      const currentPrice =
        alert.mode === 'all'
          ? Math.min(
              ...Object.values(estimate.costs || {}).filter(
                (v) => typeof v === 'number'
              )
            )
          : estimate.costs?.[alert.mode];

      if (typeof currentPrice !== 'number' || !Number.isFinite(currentPrice)) {
        continue; // couldn't price this route right now, try again next run
      }

      alert.lastCheckedPrice = currentPrice;
      alert.lastCheckedAt = now;

      if (currentPrice <= alert.thresholdAmount) {
        alert.status = 'triggered';
        alert.triggeredAt = now;
        await Notification.create({
          userId: alert.user,
          type: 'price_alert_triggered',
          message: `Price drop! ${alert.origin.label} -> ${alert.destination.label} is now ${alert.currency} ${currentPrice} (your target was ${alert.thresholdAmount}).`,
        });
      }

      await alert.save();
    } catch (err) {
      console.error(`Price alert check failed for alert ${alert._id}:`, err.message);
      // keep going with remaining alerts
    }
  }
}

/**
 * startPriceAlertScheduler
 * Registers a cron job. Call this once from server.js after MongoDB connects.
 * Default: every 6 hours. Adjust via PRICE_ALERT_CRON env var (cron syntax).
 */
export function startPriceAlertScheduler() {
  const schedule = process.env.PRICE_ALERT_CRON || '0 */6 * * *';
  const run = () => {
    checkAllActiveAlerts().catch((err) =>
      console.error('Price alert scheduler run failed:', err)
    );
  };

  import('node-cron')
    .then(({ default: cron }) => {
      cron.schedule(schedule, run);
      console.log(`Price alert scheduler started (${schedule})`);
    })
    .catch(() => {
      const sixHoursMs = 6 * 60 * 60 * 1000;
      setInterval(run, sixHoursMs);
      console.warn('node-cron is not installed; price alert scheduler is using a 6h interval fallback');
    });
}
