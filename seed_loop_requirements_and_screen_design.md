# sendloop – 要件定義書 & 画面設計書

---

## 1. 概要

| 項目   | 内容 |
| ---- | -- |
| アプリ名 |    |

| **sendloop** |                                                         |
| ------------ | ------------------------------------------------------- |
| 目的           | 習慣化をサポートする “1 日 1 タップ” アプリ。期間ごとに育成ビジュアルを楽しみながら継続意欲を高める。 |
| 対応プラットフォーム   | iOS 15 以降 / Android 9 以降（React Native Expo）             |
| 料金体系         | *Free* / *sendloop Pro*（月額・年額サブスク）                      |
| 最大サイクル       | 6 か月（180 日）                                             |
| 最小サイクル       | 3 日                                                     |

---

## 2. ユーザーペルソナ

| Persona                  | 動機                | ニーズ                |
| ------------------------ | ----------------- | ------------------ |
| “Starter” (20 代／学生)      | 勉強・筋トレなど短期目標を始めたい | 無料で 1 つだけ手軽に習慣化したい |
| “Builder” (30 代／社会人)     | 複数習慣を並行管理したい      | 複数タスク・視覚変化を楽しみたい   |
| “Long‑Runner” (40 代／会社員) | 半年スパンで語学やランニング    | 長期進捗を視覚的に把握したい     |

---

## 3. 機能一覧（FREE / PRO）

| #   | 機能                                       | Free         | sendloop Pro |
| --- | ---------------------------------------- | ------------ | ------------ |
| F1  | 1 日 1 タップ達成記録                            | ●            | ●            |
| F2  | サイクルテンプレ（7, 21, 30, 66, 90, 180 日, カスタム） | ● (1 active) | ● (無制限)      |
| F3  | 育成ビジュアル①: 樹木                             | ●            | ●            |
| F4  | 育成ビジュアル②: 花壇 / 魚群 / 星空 etc.              | –            | ●            |
| F5  | 育成進化：日毎に 1 フレーム変化                        | ●            | ●            |
| F6  | 成長スナップシェア（SNS）                           | ●            | ●            |
| F7  | 複数タスク並列（同時最大 8 個）                        | –            | ●            |
| F8  | 通知カスタム (サウンド / リマインド回数)                  | △ (固定 1 回)   | ●            |
| F9  | CSV/JSON エクスポート                          | –            | ●            |
| F10 | クラウドバックアップ (iCloud / Google)             | –            | ●            |
| F11 | ロック解除トークン (継続扱いに変換)                      | 1 / cycle    | 3 / cycle    |

---

## 4. 詳細要件

### 4.1 機能要件

- **FR‑01：タスク作成**
  - ユーザーはタイトル・アイコン・サイクル長・通知時刻を設定できる。
  - Free プランは常に 1 タスクのみ有効。新規作成時、既存タスクはアーカイブへ移動。
- **FR‑02：タスク達成記録**
  - ホーム画面中央の *SeedButton* をタップ → 当日を達成として保存。
  - 過去日修正は 48 時間以内に限り可能。
- **FR‑03：育成ビジュアル**
  - `progress = 達成日数 / cycleLength` でステートを決定。
  - 1 日ごとに PNG / Lottie フレーム切替え。最大 180 フレーム。
  - 到達点が異なる 4 段階ゴール（30%・60%・90%・100%）でビジュアル差分を用意。
- **FR‑04：通知**
  - Local push。デバイス時間 00:00 にバッジリセット。
  - 未達成状態が `now > remindTime + 2h` の場合リマインダー通知。
- **FR‑05：有料プラン購入**
  - RevenueCat SDK。App Store / Google Play サブスク。
  - 機能フラグをリアルタイム反映。

### 4.2 非機能要件

| 区分       | 要件                                                        |
| -------- | --------------------------------------------------------- |
| パフォーマンス  | Cold start < 2 s (P95) ／ メモリ < 150 MB                     |
| オフライン    | 記録・描画は完全オフライン動作。クラウド同期はオンライン時に非同期実行                       |
| セキュリティ   | タスクデータは AES‑256 でローカル暗号化。バックアップは Apple/Google Keychain 経由 |
| アクセシビリティ | WCAG 2.1 AA 準拠、VoiceOver 読み上げ設定完備                         |

### 4.3 データモデル (SQLite)

| Table      | Column        | 型       | 説明                  |
| ---------- | ------------- | ------- | ------------------- |
| `tasks`    | id            | PK TEXT | UUID                |
|            | title         | TEXT    | ユーザー入力              |
|            | cycle\_length | INT     | 日数 (3–180)          |
|            | visual\_type  | INT     | 0\:Tree, 1\:Flower… |
|            | start\_date   | DATE    | ISO8601             |
|            | archived      | BOOL    |                     |
| `progress` | id            | PK TEXT |                     |
|            | task\_id      | FK TEXT |                     |
|            | date          | DATE    |                     |

---

## 5. 画面設計書

### 5.1 画面一覧

| ID  | 画面名                         | 主 UI 要素                                 | 遷移元→先                       |
| --- | --------------------------- | --------------------------------------- | --------------------------- |
| S01 | **Welcome**                 | アプリ紹介 Carousel                          | Cold Start → S02            |
| S02 | **On‑Boarding 1** – タスク基本情報 | Input (title), Cycle Slider             | ←S01 →S03                   |
| S03 | **On‑Boarding 2** – 通知設定    | TimePicker                              | ←S02 →S04                   |
| S04 | **On‑Boarding 3** – ビジュアル選択 | VisualPicker (grid)                     | ←S03 →S05                   |
| S05 | **Home**                    | SeedButton, GrowthCanvas, ProgressRing  | ←On‑Boarding / S06 / S10    |
| S06 | **Task List (Dashboard)**   | ListCards + FAB                         | ←S05 → S07                  |
| S07 | **Task Detail**             | GrowthCanvas, HistoryList, EditBtn      | ←S06                        |
| S08 | **Stats**                   | HeatmapCalendar, StreakCount            | ↑各 PullUp                   |
| S09 | **Settings**                | ThemeToggle, BackupStatus, Subscription | ←S05                        |
| S10 | **Paywall**                 | BenefitList, SubscribeBtn               | any Free Feature Lock → S10 |
| S11 | **Share Sheet**             | SnapshotPreview, ShareBtn               | S05 (cycle complete)        |

### 5.2 主要画面ワイヤー (Text)

#### S05 – Home

```
┌──────────────────────────────┐
│  (TopBar)   [Title / Cycle D‑Day]    │
├──────────────────────────────┤
│           GrowthCanvas            │
│      (Lottie / 1 frame per day)   │
├──────────────────────────────┤
│            SeedButton             │
│      “TAP TO GROW” (Pressable)    │
├──────────────────────────────┤
│ ProgressRing  [◯◯%]               │
├──────────────────────────────┤
│ Quote / Tip (optional)            │
└──────────────────────────────┘
```

Interaction:

- **SeedButton** → haptic, frame advance, ring update.
- Long‑press → *Slump Token* 使用モーダル。

#### S06 – Task List (Pro)

```
┌──────────────────────────────┐
│  My Habits (TopBar)           │
├──────────────────────────────┤
│ ▢ Drink Water   45/90d  🌳     │
│ ▢ Reading       12/30d  🌼     │
│ ▢ Jogging       3/180d  🐟     │
│  …                               │
├──────────────────────────────┤
│ +  (Floating Action Button)    │
└──────────────────────────────┘
```

Swipe left → archive; tap → S07.

### 5.3 カラーパレット & タイ포グラフィ

| Token        | Light       | Dark    |
| ------------ | ----------- | ------- |
| `bg-default` | #FFFFFF     | #1B1B1D |
| `primary`    | #58A16C     | #58A16C |
| `accent`     | #FFC970     | #FFC970 |
| Font         | Inter, 16sp | 同左      |

---

## 6. アーキテクチャ & 技術スタック

| 層  | 技術 / ライブラリ                                 |
| -- | ------------------------------------------ |
| UI | React Native, tailwindcss-react-native, sh |

