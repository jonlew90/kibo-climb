import { WORKSHOP_ITEMS, SEASONAL_EVENTS, calculateRecurringWindow } from './itemsCatalog.js';
import { getActiveBlogPromoDrops } from './blogLoader.js';

export function getNewsItems(currentDate = new Date()) {
  const news = [];

  // 1. Active Blog Promo Code Drops (Secret Reader Rewards)
  try {
    const activeDrops = getActiveBlogPromoDrops(currentDate);
    activeDrops.forEach(({ post, promoDrop, code, daysRemaining }) => {
      const dayWord = daysRemaining === 1 ? 'day' : 'days';
      news.push({
        id: `blog_promo_${code}`,
        type: 'promo_drop',
        priority: 4, // High priority so players see secret reward drops immediately
        title: `🎁 ${promoDrop.title || 'New Secret Reader Reward!'}`,
        message: `New article drop: "${post.title}". Use secret code ${code} in the Workshop for +${promoDrop.sparks || 100} Sparks & bonus power-ups! (${daysRemaining} ${dayWord} left)`,
        icon: '🎁',
        promoCode: code,
        blogSlug: post.slug,
        blogUrl: `/blog/${post.slug}`
      });
    });
  } catch (e) {
    console.warn('newsManager: error resolving active blog promo drops', e);
  }

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

    if (window.status === 'active') {
      if (daysSinceStart <= 2) {
        news.push({
          id: `${event.id}_start_${window.startDate.getFullYear()}`,
          type: 'event_start',
          event,
          window,
          priority: 3,
          title: "New Event Started!",
          message: `${eventNamePhrase} has begun! Check out the new seasonal items in the workshop.`,
          icon: '🎉'
        });
      } else if (window.daysRemaining <= 3) {
        const dayWord = window.daysRemaining === 1 ? 'day' : 'days';
        news.push({
          id: `${event.id}_ending_${window.startDate.getFullYear()}`,
          type: 'event_ending',
          event,
          window,
          priority: 2,
          title: "Event Ending Soon!",
          message: `${eventNamePhrase} is ending in ${window.daysRemaining} ${dayWord}! Grab the seasonal items before they're gone.`,
          icon: '⏳'
        });
      }
    } else if (window.status === 'upcoming') {
      if (window.startsInDays <= 3) {
        const dayWord = window.startsInDays === 1 ? 'day' : 'days';
        news.push({
          id: `${event.id}_upcoming_${window.startDate.getFullYear()}`,
          type: 'event_upcoming_soon',
          event,
          window,
          priority: 1,
          title: "Upcoming Event!",
          message: `${eventNamePhrase} is starting in ${window.startsInDays} ${dayWord}! Get ready for new seasonal items.`,
          icon: '📅'
        });
      }
    }
  }

  // Sort by priority descending
  news.sort((a, b) => b.priority - a.priority);
  return news;
}
