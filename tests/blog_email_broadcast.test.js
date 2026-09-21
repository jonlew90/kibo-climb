import { describe, it, expect } from 'vitest';
import { generateBlogEmailHtml } from '../src/utils/blogEmailTemplate.js';

describe('Blog Email Template Generator', () => {
  const samplePost = {
    title: 'Mental Math Shortcuts for Fast Climbers',
    slug: 'mental-math-shortcuts-for-fast-climbers',
    description: 'Learn fast addition tricks to speed up your mental calculations.',
    subject: 'math',
    tier: 3,
    reading_time_minutes: 5,
    featured_asset: 'kibo_rock_climbing_granite_cliff_20260916124919.jpeg',
    reader_reward_code: 'SUMMITPEAK50',
    reader_reward_desc: '50 Free Sparks',
    key_takeaways: [
      'Learn how to break large numbers into friendly chunks',
      'Boost calculation speed without pencil and paper',
      'Download the companion worksheet for offline practice'
    ]
  };

  it('generates valid HTML containing title, link, and secret promo drop', () => {
    const html = generateBlogEmailHtml({ post: samplePost });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Mental Math Shortcuts for Fast Climbers');
    expect(html).toContain('https://kiboclimb.com/blog/mental-math-shortcuts-for-fast-climbers/');
    expect(html).toContain('MATH • Tier 3');
    expect(html).toContain('⏱️ 5 min read');
    expect(html).toContain('SUMMITPEAK50');
    expect(html).toContain('Claim 50 Free Sparks in Kibo Climb!');
    expect(html).toContain('Learn how to break large numbers into friendly chunks');
    expect(html).toContain('Read Full Guide & Print Worksheets →');
    expect(html).toContain('Manage Notification Preferences / Unsubscribe');
  });

  it('handles post without promo code gracefully', () => {
    const postWithoutCode = {
      ...samplePost,
      reader_reward_code: null
    };
    const html = generateBlogEmailHtml({ post: postWithoutCode });

    expect(html).toContain('Mental Math Shortcuts for Fast Climbers');
    expect(html).not.toContain('Exclusive Reader Drop');
  });

  it('throws an error if no post data is supplied', () => {
    expect(() => generateBlogEmailHtml({})).toThrow('Post data is required');
  });
});
