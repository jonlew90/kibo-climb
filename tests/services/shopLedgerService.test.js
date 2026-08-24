import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shopLedgerService } from '../../src/services/shopLedgerService.js';
import { storageService } from '../../src/services/storageService.js';
import { antiCheatService } from '../../src/services/antiCheatService.js';
import * as itemsCatalog from '../../src/utils/itemsCatalog.js';

describe('shopLedgerService', () => {
  beforeEach(() => {
    vi.spyOn(storageService, 'getUserData').mockReturnValue({ sparks: 1000 });
    vi.spyOn(storageService, 'getShopState').mockReturnValue({
      unlockedItems: ['item1'],
      equippedItems: ['item1']
    });
    vi.spyOn(storageService, 'saveUserData').mockImplementation(() => {});
    vi.spyOn(storageService, 'saveShopState').mockImplementation(() => {});
    vi.spyOn(shopLedgerService, 'recordTransactionLedger').mockImplementation(() => {});
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('sellItem', () => {
    it('sells an owned item and updates storage and ledger', () => {
      const res = shopLedgerService.sellItem('item1', 100);
      expect(res.success).toBe(true);
      expect(res.newSparks).toBe(1050); // 1000 + (100 * 0.5)
      expect(res.unlockedItems).not.toContain('item1');
      expect(res.equippedItems).not.toContain('item1');

      expect(storageService.saveUserData).toHaveBeenCalledWith({ sparks: 1050 });
      expect(storageService.saveShopState).toHaveBeenCalledWith([], []);
      expect(shopLedgerService.recordTransactionLedger).toHaveBeenCalledWith(expect.objectContaining({
        type: 'SHOP_SELL',
        itemId: 'item1',
        sparksEarned: 50
      }));
    });

    it('fails if item is not owned', () => {
      const res = shopLedgerService.sellItem('item2', 100);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('Item is not owned');
      expect(storageService.saveUserData).not.toHaveBeenCalled();
    });
  });

  describe('purchaseItem', () => {
    it('purchases a new item successfully', () => {
      vi.spyOn(itemsCatalog, 'getItemById').mockReturnValue({ id: 'item2', cost: 200 });
      vi.spyOn(itemsCatalog, 'getItemSalePrice').mockReturnValue({ isSale: false, salePrice: 200 });
      vi.spyOn(antiCheatService, 'validateSparksTransaction').mockReturnValue({ valid: true });

      const res = shopLedgerService.purchaseItem('item2', 200);
      expect(res.success).toBe(true);
      expect(res.newSparks).toBe(800);
      expect(res.unlockedItems).toContain('item2');

      expect(storageService.saveUserData).toHaveBeenCalledWith({ sparks: 800 });
      expect(storageService.saveShopState).toHaveBeenCalledWith(['item1'], ['item1', 'item2']);
      expect(shopLedgerService.recordTransactionLedger).toHaveBeenCalledWith(expect.objectContaining({
        type: 'SHOP_PURCHASE',
        itemId: 'item2',
        sparksCost: 200
      }));
    });

    it('fails if item ID is invalid', () => {
      vi.spyOn(itemsCatalog, 'getItemById').mockReturnValue(null);
      const res = shopLedgerService.purchaseItem('invalid_item', 100);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('Invalid item ID');
    });

    it('fails if antiCheat rejects transaction', () => {
      vi.spyOn(itemsCatalog, 'getItemById').mockReturnValue({ id: 'item2', cost: 2000 });
      vi.spyOn(itemsCatalog, 'getItemSalePrice').mockReturnValue({ isSale: false, salePrice: 2000 });
      vi.spyOn(antiCheatService, 'validateSparksTransaction').mockReturnValue({ valid: false, reason: 'Insufficient Sparks balance for transaction' });

      const res = shopLedgerService.purchaseItem('item2', 2000);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('Insufficient Sparks balance for transaction');
    });

    it('fails if item is already owned', () => {
      vi.spyOn(itemsCatalog, 'getItemById').mockReturnValue({ id: 'item1', cost: 100 });
      vi.spyOn(itemsCatalog, 'getItemSalePrice').mockReturnValue({ isSale: false, salePrice: 100 });
      vi.spyOn(antiCheatService, 'validateSparksTransaction').mockReturnValue({ valid: true });

      const res = shopLedgerService.purchaseItem('item1', 100);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('Item is already unlocked in Kibo\'s Corner');
    });
  });

  describe('verifyReceiptStub', () => {
    it('verifies a valid receipt', async () => {
      const res = await shopLedgerService.verifyReceiptStub('valid_token', 'apple');
      expect(res.success).toBe(true);
      expect(res.entitlements.isPremium).toBe(true);
      expect(storageService.saveUserData).toHaveBeenCalledWith({ entitlements: res.entitlements });
      expect(shopLedgerService.recordTransactionLedger).toHaveBeenCalledWith(expect.objectContaining({
        type: 'IAP_SUBSCRIPTION',
        receiptToken: 'valid_token'
      }));
    });

    it('fails if receipt token is invalid', async () => {
      const res = await shopLedgerService.verifyReceiptStub(null);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('Invalid receipt token format');
    });
  });

  describe('recordTransactionLedger', () => {
    it('saves transaction to local storage', () => {
      vi.restoreAllMocks(); // Restore to actually test local storage logic
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify([]));

      shopLedgerService.recordTransactionLedger({ type: 'TEST' });
      expect(setItemSpy).toHaveBeenCalled();
      const args = setItemSpy.mock.calls[0];
      expect(args[0]).toBe('kibo_transaction_ledger_history');
      expect(JSON.parse(args[1])[0].type).toBe('TEST');
    });
  });
});
