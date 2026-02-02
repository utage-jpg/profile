/**
 * 親密度管理クラス
 */
class IntimacyManager {
  constructor() {
    this.levels = {
      seed: { name: '🌱 知った', minPoints: 0, maxPoints: 2 },
      sprout: { name: '🌿 慣れた', minPoints: 3, maxPoints: 5 },
      tree: { name: '🌳 深まった', minPoints: 6, maxPoints: Infinity }
    };
  }

  /**
   * 親密度レベルを計算
   */
  calculateLevel(points) {
    for (const [key, level] of Object.entries(this.levels)) {
      if (points >= level.minPoints && points <= level.maxPoints) {
        return key;
      }
    }
    return 'seed';
  }

  /**
   * 親密度レベル情報を取得
   */
  getLevelInfo(level) {
    return this.levels[level] || this.levels.seed;
  }

  /**
   * 時間経過によるポイント加算（7日経過で+1pt）
   */
  addTimePoints(relation) {
    const now = Date.now();
    const daysPassed = Math.floor((now - relation.createdAt) / (1000 * 60 * 60 * 24));
    
    if (daysPassed >= 7) {
      return 1;
    }
    return 0;
  }

  /**
   * 訪問によるポイント加算（1日1回まで）
   */
  addVisitPoints(relation) {
    const today = this.getTodayString();
    const lastVisited = relation.lastVisitedAtByDay || {};
    
    if (!lastVisited[today]) {
      lastVisited[today] = true;
      return 1;
    }
    return 0;
  }

  /**
   * メモによるポイント加算（1日1回まで）
   */
  addMemoPoints(relation, memoText) {
    if (!memoText || memoText.trim().length === 0) {
      return 0;
    }

    const today = this.getTodayString();
    const lastVisited = relation.lastVisitedAtByDay || {};
    const memoKey = `memo_${today}`;
    
    if (!lastVisited[memoKey]) {
      lastVisited[memoKey] = true;
      return 2;
    }
    return 0;
  }

  /**
   * 関係を更新して親密度を計算
   */
  updateRelationIntimacy(relation, action = null, memoText = null) {
    let newPoints = relation.intimacyPoint || 0;
    const lastVisited = { ...relation.lastVisitedAtByDay };

    // アクションに応じてポイント加算
    switch (action) {
      case 'visit':
        newPoints += this.addVisitPoints(relation);
        break;
      case 'memo':
        newPoints += this.addMemoPoints(relation, memoText);
        break;
      case 'time':
        newPoints += this.addTimePoints(relation);
        break;
    }

    // 新しいレベルを計算
    const newLevel = this.calculateLevel(newPoints);

    return {
      intimacyPoint: newPoints,
      intimacyLevel: newLevel,
      lastVisitedAtByDay: lastVisited
    };
  }

  /**
   * 今日の日付文字列を取得
   */
  getTodayString() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  /**
   * 親密度表示用テキストを取得
   */
  getDisplayText(level) {
    const info = this.getLevelInfo(level);
    return info.name;
  }

  /**
   * 次のレベルまでの残りポイントを取得
   */
  getPointsToNextLevel(currentPoints, currentLevel) {
    const currentLevelInfo = this.getLevelInfo(currentLevel);
    
    if (currentLevel === 'tree') {
      return 0; // すでに最高レベル
    }

    // 次のレベルを探す
    const levels = ['seed', 'sprout', 'tree'];
    const currentIndex = levels.indexOf(currentLevel);
    const nextLevel = levels[currentIndex + 1];
    const nextLevelInfo = this.getLevelInfo(nextLevel);
    
    return nextLevelInfo.minPoints - currentPoints;
  }
}

export const intimacyManager = new IntimacyManager();
