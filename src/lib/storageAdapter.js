/**
 * Storage Adapter - localStorage版
 * 将来Firebase導入時に差し替え可能なインターフェース
 */
class StorageAdapter {
  constructor() {
    this.userIdKey = 'profile-card-user-id';
    this.cardsKey = 'profile-card-cards';
    this.relationsKey = 'profile-card-relations';
  }

  /**
   * ユーザーIDの取得または作成
   */
  getOrCreateUserId() {
    let userId = localStorage.getItem(this.userIdKey);
    if (!userId) {
      userId = this.generateUUID();
      localStorage.setItem(this.userIdKey, userId);
    }
    return userId;
  }

  /**
   * カード作成
   */
  createCard(cardData) {
    const cards = this.getAllCards();
    const card = {
      cardId: this.generateUUID(),
      ownerUserId: this.getOrCreateUserId(),
      createdAt: Date.now(),
      ...cardData
    };
    
    cards.push(card);
    localStorage.setItem(this.cardsKey, JSON.stringify(cards));
    return card;
  }

  /**
   * カード取得
   */
  getCard(cardId) {
    const cards = this.getAllCards();
    return cards.find(card => card.cardId === cardId) || null;
  }

  /**
   * 自分のカード一覧
   */
  listMyCards() {
    const userId = this.getOrCreateUserId();
    const cards = this.getAllCards();
    return cards.filter(card => card.ownerUserId === userId);
  }

  /**
   * カードから関係を作成
   */
  addRelationFromCard(cardId) {
    const userId = this.getOrCreateUserId();
    
    // 既に追加済みかチェック
    const existing = this.findRelationByReceivedCardId(cardId);
    if (existing) {
      return existing;
    }

    const card = this.getCard(cardId);
    if (!card) {
      throw new Error('カードが見つかりません');
    }

    const relations = this.getAllRelations();
    const relation = {
      relationId: this.generateUUID(),
      ownerUserId: userId,
      receivedCardId: cardId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      memo: '',
      intimacyPoint: 0,
      intimacyLevel: 'seed',
      lastVisitedAtByDay: {}
    };

    relations.push(relation);
    localStorage.setItem(this.relationsKey, JSON.stringify(relations));
    return relation;
  }

  /**
   * 関係一覧
   */
  listRelations() {
    const userId = this.getOrCreateUserId();
    const relations = this.getAllRelations();
    return relations.filter(relation => relation.ownerUserId === userId);
  }

  /**
   * 関係取得
   */
  getRelation(relationId) {
    const relations = this.getAllRelations();
    return relations.find(relation => relation.relationId === relationId) || null;
  }

  /**
   * 関係更新
   */
  updateRelation(relationId, patch) {
    const relations = this.getAllRelations();
    const index = relations.findIndex(r => r.relationId === relationId);
    
    if (index === -1) {
      throw new Error('関係が見つかりません');
    }

    relations[index] = {
      ...relations[index],
      ...patch,
      updatedAt: Date.now()
    };

    localStorage.setItem(this.relationsKey, JSON.stringify(relations));
    return relations[index];
  }

  /**
   * カードIDで関係検索
   */
  findRelationByReceivedCardId(cardId) {
    const userId = this.getOrCreateUserId();
    const relations = this.getAllRelations();
    return relations.find(relation => 
      relation.ownerUserId === userId && 
      relation.receivedCardId === cardId
    ) || null;
  }

  /**
   * プライベートメソッド群
   */
  getAllCards() {
    const data = localStorage.getItem(this.cardsKey);
    return data ? JSON.parse(data) : [];
  }

  getAllRelations() {
    const data = localStorage.getItem(this.relationsKey);
    return data ? JSON.parse(data) : [];
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// グローバルインスタンス
export const storage = new StorageAdapter();
