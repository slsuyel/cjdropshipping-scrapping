import { productService } from '../services/product.service';

// Basic job runner placeholder. In a real app we'd use agenda or node-cron.
export class CjSyncJob {
  public static async run() {
    console.log('🔄 Running scheduled CJ Dropshipping product sync...');
    try {
      const keywords = ['electronics', 'fashion', 'home', 'beauty'];
      for (const keyword of keywords) {
        await productService.syncCjToDb(keyword);
        console.log(`✅ Synced products for keyword: ${keyword}`);
      }
    } catch (err) {
      console.error('❌ Error in CJ Sync Job:', err);
    }
  }

  public static startInterval() {
    // Run every 24 hours (86400000 ms)
    setInterval(() => {
      this.run();
    }, 86400000);
    console.log('⏱️ Background sync job initialized.');
  }
}
