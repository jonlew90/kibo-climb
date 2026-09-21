import { WORKSHOP_ITEMS, SEASONAL_EVENTS, calculateRecurringWindow, getActiveRealMoneySaleEvent } from './itemsCatalog.js';

export function getNewsItems(currentDate = new Date()) {
  const news = [];

  // 1. Active Real Money Sale Events (e.g. Seasonal Spark Sales)
  try {
    const activeSale = getActiveRealMoneySaleEvent(currentDate);
    if (activeSale) {
      const sDayWord = activeSale.daysRemaining === 1 ? 'day' : 'days';
      const isMembershipSale = activeSale.isMembership || (activeSale.id && (activeSale.id.includes('club') || activeSale.id.includes('family')));

      news.push({
        id: `sale_${activeSale.id}_${activeSale.endDate ? new Date(activeSale.endDate).getFullYear() : 'active'}`,
        type: 'sale_active',
        priority: 4,
        title: `✨ ${activeSale.label} Active!`,
        message: `${activeSale.description || 'Special bonus Sparks and store discounts are live in the Workshop!'} (${activeSale.daysRemaining} ${sDayWord} remaining)`,
        icon: '✨',
        actionType: isMembershipSale ? 'parent_family_plan' : 'workshop_sparks',
        actionLabel: isMembershipSale ? '👑 View Offer (Parent Gate 🔒)' : '🛍️ Visit Spark Shop',
        actionParams: isMembershipSale
          ? { targetTab: 'verification', targetHighlight: 'family_plan' }
          : { hub: 'sparks' }
      });
    }
  } catch (e) {
    console.warn('newsManager: error checking active sales', e);
  }

  // 2. Seasonal Events (Quarterly & Special Summits)
  for (const event of SEASONAL_EVENTS) {
    if (event.id === 'all_active') continue;
    const eventItems = WORKSHOP_ITEMS.filter(i => i.category === 'seasonal' && i.seasonId === event.id);
    if (eventItems.length === 0) continue;

    // Check if there's any item with a recurring schedule
    const sampleItem = eventItems.find(i => i.recurringSchedule);
    if (!sampleItem) continue;

    const window = calculateRecurringWindow(sampleItem.recurringSchedule, currentDate);
    if (!window || !window.startTime) continue;

    const now = (currentDate instanceof Date ? currentDate : new Date(currentDate)).getTime();
    const daysSinceStart = Math.floor((now - window.startTime) / (1000 * 60 * 60 * 24));

    const isQuarterly = ['spring', 'summer', 'autumn', 'winter'].includes(event.id);
    const eventNamePhrase = isQuarterly ? event.label : `The ${event.label} event`;
    const dayWord = window.daysRemaining === 1 ? 'day' : 'days';

    if (window.status === 'active') {
      if (daysSinceStart <= 2) {
        news.push({
          id: `${event.id}_start_${window.startDate.getFullYear()}`,
          type: 'event_start',
          event,
          window,
          priority: 3,
          title: "New Event Started!",
          message: `${eventNamePhrase} has begun! Check out the new seasonal items in the workshop. (${window.daysRemaining} ${dayWord} remaining)`,
          icon: '🎉',
          actionType: 'workshop_seasonal',
          actionLabel: '🎒 View Seasonal Gear',
          actionParams: { hub: 'seasonal', seasonId: event.id }
        });
      } else if (window.daysRemaining <= 3) {
        news.push({
          id: `${event.id}_ending_${window.startDate.getFullYear()}`,
          type: 'event_ending',
          event,
          window,
          priority: 3,
          title: "Event Ending Soon!",
          message: `${eventNamePhrase} is ending in ${window.daysRemaining} ${dayWord}! Grab the seasonal items before they're gone.`,
          icon: '⏳',
          actionType: 'workshop_seasonal',
          actionLabel: '🎒 Grab Seasonal Items',
          actionParams: { hub: 'seasonal', seasonId: event.id }
        });
      } else {
        // Active ongoing seasonal event
        news.push({
          id: `${event.id}_active_${window.startDate.getFullYear()}`,
          type: 'event_active',
          event,
          window,
          priority: 2,
          title: `${event.label} is Active!`,
          message: `${eventNamePhrase} is live! Explore the Workshop to unlock limited-edition seasonal gear. (${window.daysRemaining} ${dayWord} remaining)`,
          icon: '🏔️',
          actionType: 'workshop_seasonal',
          actionLabel: '🎒 View Seasonal Gear',
          actionParams: { hub: 'seasonal', seasonId: event.id }
        });
      }
    } else if (window.status === 'upcoming') {
      if (window.startsInDays <= 3) {
        const upDayWord = window.startsInDays === 1 ? 'day' : 'days';
        news.push({
          id: `${event.id}_upcoming_${window.startDate.getFullYear()}`,
          type: 'event_upcoming_soon',
          event,
          window,
          priority: 1,
          title: "Upcoming Event!",
          message: `${eventNamePhrase} is starting in ${window.startsInDays} ${upDayWord}! Get ready for new seasonal items.`,
          icon: '📅',
          actionType: 'workshop_seasonal',
          actionLabel: '🎒 Preview Workshop',
          actionParams: { hub: 'seasonal' }
        });
      }
    }
  }

  // Sort by priority descending
  news.sort((a, b) => b.priority - a.priority);
  return news;
}
