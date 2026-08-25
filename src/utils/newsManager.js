import { WORKSHOP_ITEMS, SEASONAL_EVENTS, calculateRecurringWindow } from './itemsCatalog.js';

export function getNewsItems(currentDate = new Date()) {
  const news = [];

  for (const event of SEASONAL_EVENTS) {
    if (event.id === 'all_active') continue;
    const eventItems = WORKSHOP_ITEMS.filter(i => i.category === 'seasonal' && i.seasonId === event.id);
    if (eventItems.length === 0) continue;

    // Check if there's any item with a recurring schedule
    const sampleItem = eventItems.find(i => i.recurringSchedule);
    if (!sampleItem) continue;

    const window = calculateRecurringWindow(sampleItem.recurringSchedule, currentDate);
    if (!window) continue;

    const now = (currentDate instanceof Date ? currentDate : new Date(currentDate)).getTime();
    const daysSinceStart = Math.floor((now - window.startTime) / (1000 * 60 * 60 * 24));

    if (window.status === 'active') {
      if (daysSinceStart <= 2) {
        news.push({
          id: `${event.id}_start_${window.startDate.getFullYear()}`,
          type: 'event_start',
          event,
          window,
          priority: 3,
          title: "New Event Started!",
          message: `${event.label} has begun! Check out the new seasonal items in the workshop.`,
          icon: '🎉'
        });
      } else if (window.daysRemaining <= 3) {
        news.push({
          id: `${event.id}_ending_${window.startDate.getFullYear()}`,
          type: 'event_ending',
          event,
          window,
          priority: 2,
          title: "Event Ending Soon!",
          message: `${event.label} is ending in ${window.daysRemaining} days! Grab the seasonal items before they're gone.`,
          icon: '⏳'
        });
      }
    } else if (window.status === 'upcoming') {
      if (window.startsInDays <= 3) {
        news.push({
          id: `${event.id}_upcoming_${window.startDate.getFullYear()}`,
          type: 'event_upcoming_soon',
          event,
          window,
          priority: 1,
          title: "Upcoming Event!",
          message: `${event.label} is starting in ${window.startsInDays} days! Get ready for new seasonal items.`,
          icon: '📅'
        });
      }
    }
  }

  // Sort by priority descending
  news.sort((a, b) => b.priority - a.priority);
  return news;
}
