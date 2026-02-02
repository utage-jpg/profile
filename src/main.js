import { storage } from './lib/storageAdapter.js';
import { cardGenerator } from './lib/cardGenerator.js';
import { intimacyManager } from './lib/intimacyManager.js';
import { router } from './lib/router.js';

// グローバル変数（HTMLからの呼び出し用）
window.router = router;
window.cardGenerator = cardGenerator;
window.storage = storage;
window.intimacyManager = intimacyManager;

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
  console.log('類型プロフィール帳を起動しました');
  
  // ユーザーIDの初期化
  const userId = storage.getOrCreateUserId();
  console.log('ユーザーID:', userId);
  
  // 定期的な親密度更新チェック（時間経過分）
  checkTimeBasedIntimacy();
});

/**
 * 時間経過による親密度更新チェック
 */
async function checkTimeBasedIntimacy() {
  try {
    const relations = await storage.listRelations();
    let updatedCount = 0;
    
    for (const relation of relations) {
      const intimacyUpdate = intimacyManager.updateRelationIntimacy(relation, 'time');
      
      if (intimacyUpdate.intimacyPoint > relation.intimacyPoint) {
        await storage.updateRelation(relation.relationId, intimacyUpdate);
        updatedCount++;
      }
    }
    
    if (updatedCount > 0) {
      console.log(`${updatedCount}件の関係で時間経過による親密度更新がありました`);
    }
  } catch (error) {
    console.error('親密度更新チェックエラー:', error);
  }
}

/**
 * ページ訪問時の親密度更新
 */
export async function recordPageVisit(relationId) {
  try {
    const relation = await storage.getRelation(relationId);
    if (!relation) return;

    const intimacyUpdate = intimacyManager.updateRelationIntimacy(relation, 'visit');
    
    if (intimacyUpdate.intimacyPoint > relation.intimacyPoint) {
      await storage.updateRelation(relationId, intimacyUpdate);
      console.log('訪問による親密度更新:', intimacyUpdate);
    }
  } catch (error) {
    console.error('訪問記録エラー:', error);
  }
}

// エラーハンドリング
window.addEventListener('error', (event) => {
  console.error('アプリケーションエラー:', event.error);
});

// 開発モードの場合のデバッグ情報
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.debugInfo = {
    storage,
    intimacyManager,
    cardGenerator,
    router
  };
  
  console.log('デバッグモード: window.debugInfo から各機能にアクセスできます');
}
