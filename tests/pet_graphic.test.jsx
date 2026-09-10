import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import PetGraphic, { PET_CONFIGS, IS_PET_ID } from '../src/components/PetGraphic';

describe('PetGraphic & Pets Catalog Verification', () => {
  const ALL_PET_IDS = [
    'snowy_owl',
    'alpine_fox',
    'mini_robot',
    'phoenix_pet',
    'frost_dragon',
    'cosmic_griffin',
    'dragon_pet_premium',
    'spring_butterfly_pet',
    'autumn_squirrel_pet',
    'winter_snowman_pet',
    'mlk_peace_dove_pet',
    'halloween_ghost_pet',
    'holiday_gingerbread_pet'
  ];

  it('should recognize all 13 pets via IS_PET_ID', () => {
    expect(ALL_PET_IDS.length).toBe(13);
    for (const petId of ALL_PET_IDS) {
      expect(IS_PET_ID(petId)).toBe(true);
      expect(PET_CONFIGS[petId]).toBeDefined();
      expect(PET_CONFIGS[petId].name).toBeTruthy();
      expect(['flying', 'ground']).toContain(PET_CONFIGS[petId].type);
    }
  });

  it('should render all 13 pets in thumbnail mode to valid SVG string', () => {
    for (const petId of ALL_PET_IDS) {
      const html = renderToStaticMarkup(
        <svg>
          <PetGraphic petId={petId} isCompanion={false} />
        </svg>
      );
      expect(html).toContain(`pet-${petId}`);
      expect(html).toContain('<defs>');
    }
  });

  it('should render all 13 pets in companion mode with signature animation classes', () => {
    for (const petId of ALL_PET_IDS) {
      const html = renderToStaticMarkup(
        <svg>
          <PetGraphic petId={petId} isCompanion={true} />
        </svg>
      );
      expect(html).toContain(`pet-${petId}`);
      // Each pet in companion mode has either animate-pet-hover or animate-pet-ground
      const hasAnimation = html.includes('animate-pet-hover') || html.includes('animate-pet-ground');
      expect(hasAnimation).toBe(true);
    }
  });
});
