# 類型プロフィール帳サービス

16タイプをベースにしたプロフィール帳を作成・交換・蓄積できるWebサービスです。

## 🚀 クイックスタート

### インストール
```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

### アクセス
- 開発サーバー: http://localhost:3000
- ブラウザが自動で開きます

## 📱 機能概要

### v0.1で実装済みの機能
1. **プロフィール帳作成**
   - 16タイプから選択
   - ひとこと、好き/苦手なところ、関係の癖を入力
   - Canvasでカード画像を生成

2. **カード共有**
   - PNG画像として保存
   - SNS投稿用テキストコピー
   - 共有リンク発行

3. **カード受け取り**
   - 共有リンクからカードを閲覧
   - マイ帳に追加

4. **マイ帳**
   - 受け取ったカード一覧
   - タイプ・親密度でフィルタ
   - 並び替え機能

5. **親密度システム**
   - 🌱 知った → 🌿 慣れた → 🌳 深まった
   - 時間経過、訪問、メモで成長

## 🛠️ 技術構成

- **フロントエンド**: Vite + Vanilla JavaScript
- **画像生成**: Canvas API
- **データ保存**: localStorage（v0.1）
- **ルーティング**: Hash-based SPA

## 📁 プロジェクト構成

```
交換帳(windsurf)/
├── src/
│   ├── lib/
│   │   ├── storageAdapter.js    # データ保存層（Firebase差し替え用）
│   │   ├── cardGenerator.js      # カード画像生成
│   │   ├── intimacyManager.js    # 親密度管理
│   │   └── router.js             # ルーティング管理
│   ├── main.js                  # アプリケーションエントリ
│   └── style.css                # スタイルシート
├── index.html                   # メインHTML
├── package.json                 # 依存関係
├── vite.config.js              # Vite設定
└── README.md                   # このファイル
```

## 🧪 テスト手順

### 基本機能テスト

1. **カード作成→保存テスト**
   ```
   1. トップページで「プロフィール帳を作る」をクリック
   2. タイプを選択（例: INFP）
   3. ひとことを入力（例: 「静かに過ごすのが好き」）
   4. 好き/苦手なところを選択
   5. 「次へ」をクリック
   6. 「画像を保存」でPNGがダウンロードされることを確認
   ```

2. **共有リンクテスト**
   ```
   1. カード作成画面で「共有リンクをコピー」
   2. コピーしたリンクを新しいタブで開く
   3. 受け取りページが表示されることを確認
   4. 「このカードを自分の帳に追加」をクリック
   5. 「追加済み」と表示されることを確認
   ```

3. **マイ帳→詳細→メモテスト**
   ```
   1. トップページで「交換したカードを見る」をクリック
   2. 追加したカードが表示されることを確認
   3. カードをクリックして詳細ページへ
   4. メモ欄にテキストを入力（例: 「優しい人だと思った」）
   5. 「メモを保存」をクリック
   6. 親密度が上がることを確認
   ```

4. **データ永続化テスト**
   ```
   1. カードを作成・追加した後、ページをリロード
   2. データが残っていることを確認
   3. ブラウザを閉じて再起動
   4. すべてのデータが保持されていることを確認
   ```

### 親密度テスト

1. **メモによる上昇**
   ```
   1. カード詳細でメモを保存 → +2pt
   2. 同日に再度保存 → ポイント変化なし
   3. 翌日に保存 → +2pt
   ```

2. **時間経過による上昇**
   ```
   1. カードを追加して7日以上経過
   2. ページにアクセス → +1pt（自動）
   ```

## 🔧 開発者向け情報

### Firebase差し替えについて
`src/lib/storageAdapter.js` を差し替えることで、localStorageからFirebaseに移行できます。

```javascript
// Firebase実装時のインターフェース例
class FirebaseStorageAdapter {
  async getOrCreateUserId() { /* Firebase実装 */ }
  async createCard(cardData) { /* Firebase実装 */ }
  async getCard(cardId) { /* Firebase実装 */ }
  // ... 他のメソッドも同様のインターフェース
}
```

### データ構造

#### Card（カード）
```javascript
{
  cardId: "uuid",
  ownerUserId: "uuid", 
  type: "INFP",
  profileData: {
    tagline: "30文字以内",
    likes: { preset: ["論理的思考"], free: "自由記述" },
    dislikes: { preset: ["曖昧さ"], free: "自由記述" },
    relationshipHabits: ["深く考えすぎる"]
  },
  createdAt: 1234567890
}
```

#### Relation（関係）
```javascript
{
  relationId: "uuid",
  ownerUserId: "uuid",
  receivedCardId: "uuid",
  intimacyPoint: 5,
  intimacyLevel: "sprout",
  memo: "非公開メモ",
  lastVisitedAtByDay: {
    "2024-01-01": true,
    "memo_2024-01-01": true
  },
  createdAt: 1234567890,
  updatedAt: 1234567890
}
```

## 🚀 デプロイ

### Vercelでのデプロイ
```bash
npm run build
# distフォルダをVercelにデプロイ
```

### GitHub Pagesでのデプロイ
```bash
npm run build
# distフォルダをgh-pagesブランチにプッシュ
```

## 📋 v0.2以降の予定

- ラブタイプ対応
- ペア画像生成
- 公開プロフィール機能
- Firebase連携
- 通知機能

## 🤝 貢献

1. Forkする
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## 📄 ライセンス

MIT License
