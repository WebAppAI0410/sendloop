# Lottie Animation Files

## 現在の状態
- `plant-growing-sample.json` - テスト用のサンプルアニメーション

## 推奨Lottieアニメーションの取得方法

以下の高品質な無料アニメーションをLottieFiles.comからダウンロードしてください：

### 第1選択: Shannon Ferguson作「Plant growing animation」
- URL: https://lottiefiles.com/72610-plant-growing-animation
- ファイル名: `72610-plant-growing-animation.json`
- 特徴: マーカー駆動制御で確実な段階管理

### 第2選択: SVGenius作「Growing Plant」
- URL: https://lottiefiles.com/free-animation/growing-plant-p8whF7BNjS
- ファイル名: `growing-plant-p8whF7BNjS.json`
- 特徴: 最高品質のビジュアル表現

## 統合手順

1. 上記URLからLottie JSONファイルをダウンロード
2. このディレクトリ (`src/assets/animations/`) に配置
3. `LottieGrowthAnimation.tsx`で使用:

```typescript
// HomeScreen.tsx内で切り替え
import plantGrowingAnimation from '../assets/animations/72610-plant-growing-animation.json';

<LottieGrowthAnimation
  progress={animationProgress}
  size={width - (Spacing.lg * 4)}
  animationSource={plantGrowingAnimation}
/>
```

## パフォーマンス最適化

- ファイルサイズ目標: 500KB以下
- 必要に応じてhttps://lottiefiles.com/optimizeで最適化
- dotLottie形式（.lottie）も検討可能

## テスト確認

統合後は以下のコマンドでテスト実行：
```bash
npm test -- __tests__/components/animations/LottieGrowthAnimation.test.tsx
```