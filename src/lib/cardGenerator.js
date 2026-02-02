/**
 * カード画像生成クラス
 */
class CardGenerator {
  constructor() {
    this.canvas = document.getElementById('card-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.currentCard = null;
  }

  /**
   * タイプごとの色設定
   */
  getTypeColors(type) {
    const colors = {
      'INTJ': { bg: '#8b5cf6', text: '#ffffff' },
      'INTP': { bg: '#06b6d4', text: '#ffffff' },
      'ENTJ': { bg: '#dc2626', text: '#ffffff' },
      'ENTP': { bg: '#f59e0b', text: '#ffffff' },
      'INFJ': { bg: '#7c3aed', text: '#ffffff' },
      'INFP': { bg: '#10b981', text: '#ffffff' },
      'ENFJ': { bg: '#f97316', text: '#ffffff' },
      'ENFP': { bg: '#84cc16', text: '#ffffff' },
      'ISTJ': { bg: '#6366f1', text: '#ffffff' },
      'ISFJ': { bg: '#14b8a6', text: '#ffffff' },
      'ESTJ': { bg: '#0ea5e9', text: '#ffffff' },
      'ESFJ': { bg: '#22c55e', text: '#ffffff' },
      'ISTP': { bg: '#a855f7', text: '#ffffff' },
      'ISFP': { bg: '#06b6d4', text: '#ffffff' },
      'ESTP': { bg: '#f43f5e', text: '#ffffff' },
      'ESFP': { bg: '#fbbf24', text: '#ffffff' }
    };
    return colors[type] || { bg: '#6b7280', text: '#ffffff' };
  }

  /**
   * カード画像を生成
   */
  generateCard(card) {
    this.currentCard = card;
    const colors = this.getTypeColors(card.type);
    
    // キャンバスをクリア
    this.ctx.fillStyle = colors.bg;
    this.ctx.fillRect(0, 0, 1080, 1080);

    // 白い内側の背景
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(40, 40, 1000, 1000);

    // タイプ表示
    this.ctx.fillStyle = colors.bg;
    this.ctx.fillRect(40, 40, 1000, 200);
    
    this.ctx.fillStyle = colors.text;
    this.ctx.font = 'bold 80px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(card.type, 540, 160);

    // ひとこと
    this.ctx.fillStyle = '#333333';
    this.ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    this.ctx.textAlign = 'center';
    const tagline = this.truncateText(card.profileData.tagline, 30);
    this.ctx.fillText(tagline, 540, 320);

    // セクションのY位置
    let currentY = 400;
    const lineHeight = 60;
    const sectionGap = 80;

    // 好きなところ
    currentY = this.drawSection('👍 好きなところ', card.profileData.likes, currentY, colors);

    // 苦手なところ
    currentY += sectionGap;
    currentY = this.drawSection('👎 苦手なところ', card.profileData.dislikes, currentY, colors);

    // 関係で出やすい癖
    currentY += sectionGap;
    currentY = this.drawSection('🔄 関係の癖', card.profileData.relationshipHabits, currentY, colors);

    // フッター
    this.ctx.fillStyle = '#999999';
    this.ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('類型プロフィール帳', 540, 1040);
  }

  /**
   * セクションを描画
   */
  drawSection(title, data, startY, colors) {
    let currentY = startY;

    // タイトル
    this.ctx.fillStyle = colors.bg;
    this.ctx.fillRect(80, currentY - 40, 920, 60);
    
    this.ctx.fillStyle = colors.text;
    this.ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(title, 100, currentY);

    currentY += 40;

    // 内容
    this.ctx.fillStyle = '#333333';
    this.ctx.font = '32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    
    const items = [];
    if (data.preset && data.preset.length > 0) {
      items.push(...data.preset);
    }
    if (data.free && data.free.trim()) {
      items.push(data.free.trim());
    }

    if (items.length === 0) {
      this.ctx.fillStyle = '#999999';
      this.ctx.fillText('なし', 100, currentY);
      currentY += 40;
    } else {
      items.forEach(item => {
        const text = this.truncateText(item, 25);
        this.ctx.fillText(`・${text}`, 100, currentY);
        currentY += 40;
      });
    }

    return currentY;
  }

  /**
   * テキストを省略
   */
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 1) + '…';
  }

  /**
   * 画像をダウンロード
   */
  downloadImage() {
    if (!this.currentCard) return;

    const link = document.createElement('a');
    link.download = `profile-card-${this.currentCard.type}.png`;
    link.href = this.canvas.toDataURL();
    link.click();
  }

  /**
   * SNS投稿用テキストをコピー
   */
  copyShareText() {
    if (!this.currentCard) return;

    const text = `私の${this.currentCard.type}プロフィール帳を作成しました！\n${this.currentCard.profileData.tagline}\n\n#類型プロフィール帳 #${this.currentCard.type}`;
    
    navigator.clipboard.writeText(text).then(() => {
      alert('投稿文をコピーしました！');
    }).catch(() => {
      alert('コピーに失敗しました');
    });
  }

  /**
   * 共有リンクをコピー
   */
  copyShareLink() {
    if (!this.currentCard) return;

    const shareUrl = `${window.location.origin}${window.location.pathname}#/share/${this.currentCard.cardId}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('共有リンクをコピーしました！');
    }).catch(() => {
      alert('コピーに失敗しました');
    });
  }
}

export const cardGenerator = new CardGenerator();
