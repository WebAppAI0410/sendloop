# sendloop OnBoarding Flow

## 要件（seed_loop_requirements_and_screen_design.md から）

### 画面フロー
1. **S01 Welcome** - アプリ紹介 Carousel
2. **S02 OnBoarding 1** - タスク基本情報 (title, Cycle Slider)
3. **S03 OnBoarding 2** - 通知設定 (TimePicker)
4. **S04 OnBoarding 3** - ビジュアル選択 (VisualPicker grid)
5. **S05 Home** - メイン画面

### タスク作成要件
- **FR-01**: ユーザーはタイトル・アイコン・サイクル長・通知時刻を設定
- Free プランは常に1タスクのみ有効
- サイクル長: 3-180日
- VisualType: 0:Tree, 1:Flower, 2:Fish, 3:Stars

### TDD実装順序
1. タスク作成ロジックのテスト
2. OnBoarding画面コンポーネントのテスト
3. 統合テスト