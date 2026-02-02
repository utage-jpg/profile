import { storage } from './storageAdapter.js';
import { cardGenerator } from './cardGenerator.js';
import { intimacyManager } from './intimacyManager.js';

/**
 * ルーター管理
 */
class Router {
  constructor() {
    this.routes = new Map();
    this.currentPage = null;
    this.init();
  }

  init() {
    console.log('🛣️ ルーターを初期化中...');
    
    // ルート定義
    this.routes.set('/', () => this.showPage('home'));
    this.routes.set('/create', () => this.showPage('create'));
    this.routes.set('/preview', () => this.showPage('preview'));
    this.routes.set('/share/:cardId', (params) => this.showSharePage(params.cardId));
    this.routes.set('/my-cards', () => this.showMyCards());
    this.routes.set('/card-detail/:relationId', (params) => this.showCardDetail(params.relationId));

    // ハッシュ変更イベント
    window.addEventListener('hashchange', () => this.handleRoute());
    
    // 初期ルート処理
    this.handleRoute();
    console.log('✅ ルーター初期化完了');
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const [path, ...queryString] = hash.split('?');
    
    console.log('🔍 ルート処理:', hash);
    
    // パラメータ解析
    const params = {};
    const pathParts = path.split('/');
    
    // ルートマッチング
    for (const [route, handler] of this.routes) {
      const routeParts = route.split('/');
      if (this.matchRoute(routeParts, pathParts, params)) {
        console.log('✅ ルート一致:', route, params);
        handler(params);
        return;
      }
    }

    // デフォルトルート
    console.log('🏠 デフォルトルートへ');
    this.showPage('home');
  }

  matchRoute(routeParts, pathParts, params) {
    if (routeParts.length !== pathParts.length) return false;

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const pathPart = pathParts[i];

      if (routePart.startsWith(':')) {
        const paramName = routePart.slice(1);
        params[paramName] = pathPart;
      } else if (routePart !== pathPart) {
        return false;
      }
    }

    return true;
  }

  navigate(path) {
    window.location.hash = path;
  }

  showPage(pageId) {
    console.log('📄 ページ表示:', pageId);
    
    // すべてのページを非表示
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });

    // 指定ページを表示
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.classList.add('active');
      this.currentPage = pageId;

      // 画面遷移時にトップへスクロール
      window.scrollTo(0, 0);

      // ページ固有の初期化
      this.initPage(pageId);
      
      console.log('✅ ページ表示完了:', pageId);
    } else {
      console.error('❌ ページが見つかりません:', pageId);
    }
  }

  async showSharePage(cardId) {
    this.showPage('share');
    
    try {
      const card = await storage.getCard(cardId);
      if (card) {
        this.renderShareCard(card);
      } else {
        document.getElementById('share-content').innerHTML = `
          <div class="share-card">
            <p>カードが見つかりませんでした</p>
            <button class="btn btn-primary" onclick="router.navigate('/')">ホームへ</button>
          </div>
        `;
      }
    } catch (error) {
      console.error('カード読み込みエラー:', error);
      document.getElementById('share-content').innerHTML = `
        <div class="share-card">
          <p>エラーが発生しました</p>
          <button class="btn btn-primary" onclick="router.navigate('/')">ホームへ</button>
        </div>
      `;
    }
  }

  async showMyCards() {
    this.showPage('my-cards');
    await this.loadMyCards();
  }

  async showCardDetail(relationId) {
    this.showPage('card-detail');
    await this.loadCardDetail(relationId);
  }

  initPage(pageId) {
    switch (pageId) {
      case 'create':
        this.initCreatePage();
        break;
      case 'my-cards':
        this.initFilters();
        break;
    }
  }

  initCreatePage() {
    const form = document.getElementById('create-form');
    const taglineInput = document.getElementById('tagline');
    const taglineCount = document.getElementById('tagline-count');

    // 文字数カウント
    taglineInput.addEventListener('input', () => {
      taglineCount.textContent = taglineInput.value.length;
    });

    // フォーム送信
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleCreateSubmit(form);
    });
  }

  initFilters() {
    const typeFilter = document.getElementById('type-filter');
    const intimacyFilter = document.getElementById('intimacy-filter');
    const sortOrder = document.getElementById('sort-order');

    // フィルター初期化
    this.populateTypeFilter();

    // イベントリスナー
    [typeFilter, intimacyFilter, sortOrder].forEach(element => {
      element.addEventListener('change', () => this.loadMyCards());
    });
  }

  async handleCreateSubmit(form) {
    const formData = new FormData(form);
    
    const cardData = {
      type: formData.get('type'),
      profileData: {
        tagline: formData.get('tagline'),
        likes: {
          preset: formData.getAll('likes-preset'),
          free: formData.get('likes-free') || ''
        },
        dislikes: {
          preset: formData.getAll('dislikes-preset'),
          free: formData.get('dislikes-free') || ''
        },
        relationshipHabits: formData.getAll('habits')
      }
    };

    try {
      const card = await storage.createCard(cardData);
      
      // プレビューページへ
      this.navigate('/preview');
      
      // カード画像生成
      setTimeout(() => {
        cardGenerator.generateCard(card);
      }, 100);
      
    } catch (error) {
      console.error('カード作成エラー:', error);
      alert('カード作成に失敗しました');
    }
  }

  renderShareCard(card) {
    const shareContent = document.getElementById('share-content');
    const isAdded = storage.findRelationByReceivedCardId(card.cardId);
    
    shareContent.innerHTML = `
      <div class="share-card">
        <div class="type-badge type-${card.type.toLowerCase()}">${card.type}</div>
        <h2>${card.profileData.tagline}</h2>
        
        <div class="detail-section">
          <h3>👍 好きなところ</h3>
          <p>${this.formatProfileData(card.profileData.likes)}</p>
        </div>
        
        <div class="detail-section">
          <h3>👎 苦手なところ</h3>
          <p>${this.formatProfileData(card.profileData.dislikes)}</p>
        </div>
        
        <div class="detail-section">
          <h3>🔄 関係で出やすい癖</h3>
          <p>${card.profileData.relationshipHabits.join('、') || 'なし'}</p>
        </div>
        
        <div class="share-actions">
          ${isAdded ? 
            `<p class="added-notice">✅ このカードは追加済みです</p>
             <button class="btn btn-secondary" onclick="router.navigate('/my-cards')">マイ帳で見る</button>` :
            `<button class="btn btn-primary" onclick="router.addCardToMyCards('${card.cardId}')">
              このカードを自分の帳に追加
            </button>`
          }
        </div>
      </div>
    `;
  }

  formatProfileData(data) {
    const items = [];
    if (data.preset && data.preset.length > 0) {
      items.push(...data.preset);
    }
    if (data.free && data.free.trim()) {
      items.push(data.free.trim());
    }
    return items.length > 0 ? items.join('、') : 'なし';
  }

  async addCardToMyCards(cardId) {
    try {
      const relation = await storage.addRelationFromCard(cardId);
      alert('カードを追加しました！');
      this.renderShareCard(await storage.getCard(cardId)); // 再描画
    } catch (error) {
      console.error('カード追加エラー:', error);
      alert('カードの追加に失敗しました');
    }
  }

  async loadMyCards() {
    try {
      const relations = await storage.listRelations();
      const typeFilter = document.getElementById('type-filter').value;
      const intimacyFilter = document.getElementById('intimacy-filter').value;
      const sortOrder = document.getElementById('sort-order').value;

      // フィルタリング
      let filteredRelations = relations.filter(relation => {
        const card = storage.getCard(relation.receivedCardId);
        if (!card) return false;

        if (typeFilter && card.type !== typeFilter) return false;
        if (intimacyFilter && relation.intimacyLevel !== intimacyFilter) return false;
        
        return true;
      });

      // ソート
      filteredRelations.sort((a, b) => {
        if (sortOrder === 'intimate') {
          return b.intimacyPoint - a.intimacyPoint;
        } else {
          return b.createdAt - a.createdAt;
        }
      });

      this.renderCardsList(filteredRelations);
    } catch (error) {
      console.error('カード一覧読み込みエラー:', error);
    }
  }

  renderCardsList(relations) {
    const cardsList = document.getElementById('cards-list');
    
    if (relations.length === 0) {
      cardsList.innerHTML = '<p class="empty-message">カードがありません</p>';
      return;
    }

    cardsList.innerHTML = relations.map(relation => {
      const card = storage.getCard(relation.receivedCardId);
      if (!card) return '';

      const intimacyInfo = intimacyManager.getLevelInfo(relation.intimacyLevel);
      const createdDate = new Date(relation.createdAt).toLocaleDateString();

      return `
        <div class="card-item" onclick="router.navigate('/card-detail/${relation.relationId}')">
          <div class="card-header">
            <span class="type-badge type-${card.type.toLowerCase()}">${card.type}</span>
            <span class="intimacy-badge">${intimacyInfo.name}</span>
          </div>
          <div class="card-tagline">${card.profileData.tagline}</div>
          <div class="card-meta">追加日: ${createdDate}</div>
        </div>
      `;
    }).join('');
  }

  async loadCardDetail(relationId) {
    try {
      const relation = await storage.getRelation(relationId);
      const card = await storage.getCard(relation.receivedCardId);
      
      if (!relation || !card) {
        document.getElementById('card-detail-content').innerHTML = '<p>データが見つかりません</p>';
        return;
      }

      // 訪問加点を処理
      const intimacyUpdate = intimacyManager.updateRelationIntimacy(relation, 'visit');
      if (intimacyUpdate.intimacyPoint > relation.intimacyPoint) {
        await storage.updateRelation(relationId, intimacyUpdate);
        relation.intimacyPoint = intimacyUpdate.intimacyPoint;
        relation.intimacyLevel = intimacyUpdate.intimacyLevel;
      }

      this.renderCardDetail(relation, card);
    } catch (error) {
      console.error('カード詳細読み込みエラー:', error);
    }
  }

  renderCardDetail(relation, card) {
    const intimacyInfo = intimacyManager.getLevelInfo(relation.intimacyLevel);
    const pointsToNext = intimacyManager.getPointsToNextLevel(relation.intimacyPoint, relation.intimacyLevel);

    document.getElementById('card-detail-content').innerHTML = `
      <div class="detail-card">
        <div class="type-badge type-${card.type.toLowerCase()}">${card.type}</div>
        <h2>${card.profileData.tagline}</h2>
        
        <div class="detail-section">
          <h3>👍 好きなところ</h3>
          <p>${this.formatProfileData(card.profileData.likes)}</p>
        </div>
        
        <div class="detail-section">
          <h3>👎 苦手なところ</h3>
          <p>${this.formatProfileData(card.profileData.dislikes)}</p>
        </div>
        
        <div class="detail-section">
          <h3>🔄 関係で出やすい癖</h3>
          <p>${card.profileData.relationshipHabits.join('、') || 'なし'}</p>
        </div>
      </div>

      <div class="intimacy-display">
        <div class="level">${intimacyInfo.name}</div>
        <div class="description">
          現在のポイント: ${relation.intimacyPoint}pt
          ${pointsToNext > 0 ? `<br>次のレベルまで: ${pointsToNext}pt` : ''}
        </div>
      </div>

      <div class="memo-section">
        <h3>📝 非公開メモ</h3>
        <textarea id="memo-text" placeholder="この人についてのメモを残しましょう">${relation.memo || ''}</textarea>
        <div class="memo-actions">
          <button class="btn btn-primary" onclick="router.saveMemo('${relation.relationId}')">メモを保存</button>
        </div>
      </div>
    `;
  }

  async saveMemo(relationId) {
    try {
      const memoText = document.getElementById('memo-text').value;
      const relation = await storage.getRelation(relationId);
      
      if (!relation) return;

      // 親密度更新
      const intimacyUpdate = intimacyManager.updateRelationIntimacy(relation, 'memo', memoText);
      
      // 保存
      await storage.updateRelation(relationId, {
        memo: memoText,
        ...intimacyUpdate
      });

      alert('メモを保存しました！');
      this.loadCardDetail(relationId); // 再描画
    } catch (error) {
      console.error('メモ保存エラー:', error);
      alert('メモの保存に失敗しました');
    }
  }

  populateTypeFilter() {
    const typeFilter = document.getElementById('type-filter');
    const types = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
                  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
    
    types.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      typeFilter.appendChild(option);
    });
  }
}

export const router = new Router();
