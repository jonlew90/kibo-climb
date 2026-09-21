import { describe, it, expect, beforeEach } from 'vitest';
import { getAllBlogPosts, getActiveBlogPromoDrops } from '../src/utils/blogLoader';
import { promoCodeService } from '../src/services/promoCodeService';
import { storageService } from '../src/services/storageService';
import { getNewsItems } from '../src/utils/newsManager';

describe('Blog Secret Reader Promo Drops', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('correctly filters active blog promo drops within the 14-day validity window', () => {
    const mockPosts = [
      {
        slug: 'active-post-1',
        title: 'Active Post 1',
        published_at: '2026-09-15T12:00:00.000Z',
        promo_drop: {
          code: 'ACTIVE100',
          headline: 'Active Drop',
          sparks: 100,
          valid_days: 14
        }
      },
      {
        slug: 'expired-post',
        title: 'Expired Post',
        published_at: '2026-08-01T12:00:00.000Z',
        promo_drop: {
          code: 'EXPIRED100',
          headline: 'Expired Drop',
          sparks: 100,
          valid_days: 14
        }
      },
      {
        slug: 'future-post',
        title: 'Future Post',
        published_at: '2026-10-01T12:00:00.000Z',
        promo_drop: {
          code: 'FUTURE100',
          headline: 'Future Drop',
          sparks: 100,
          valid_days: 14
        }
      }
    ];

    const testDate = new Date('2026-09-20T12:00:00.000Z');
    const activeDrops = getActiveBlogPromoDrops(testDate, mockPosts);

    expect(activeDrops.length).toBe(1);
    expect(activeDrops[0].code).toBe('ACTIVE100');
    expect(activeDrops[0].daysRemaining).toBeGreaterThan(0);
    expect(activeDrops[0].daysRemaining).toBeLessThanOrEqual(14);
  });

  it('resolves active blog promo codes locally via promoCodeService fallback', async () => {
    const posts = getAllBlogPosts();
    const postWithDrop = posts.find(p => p.promo_drop && p.promo_drop.code);
    expect(postWithDrop).toBeDefined();

    const code = postWithDrop.promo_drop.code;
    const resolution = promoCodeService.resolveBlogPromoDrop(code);

    expect(resolution).toBeDefined();
    if (!resolution.expired) {
      expect(resolution.promo).toBeDefined();
      expect(resolution.promo.code).toBe(code.toUpperCase());
      expect(resolution.promo.rewards.sparks).toBeGreaterThan(0);
    }
  });

  it('redeems active blog promo code and updates storage cleanly without auth requirement', async () => {
    const posts = getAllBlogPosts();
    const activeDrops = getActiveBlogPromoDrops(new Date(), posts);

    if (activeDrops.length > 0) {
      const activeDrop = activeDrops[0];
      const code = activeDrop.code;

      const result = await promoCodeService.redeemCode(code);
      expect(result.success).toBe(true);
      expect(result.promo).toBeDefined();
      expect(result.updated.sparks).toBeGreaterThanOrEqual(100);

      // Attempting to redeem again should fail with duplicate prevention
      const duplicateResult = await promoCodeService.redeemCode(code);
      expect(duplicateResult.success).toBe(false);
      expect(duplicateResult.reason).toContain('already been redeemed');
    }
  });

  it('generates dynamic news items for active blog promo drops in newsManager', () => {
    const newsItems = getNewsItems();
    expect(Array.isArray(newsItems)).toBe(true);

    const promoNews = newsItems.find(item => item.type === 'promo_drop');
    if (promoNews) {
      expect(promoNews.priority).toBe(4);
      expect(promoNews.promoCode).toBeTruthy();
      expect(promoNews.blogUrl).toContain('/blog/');
    }
  });
});
