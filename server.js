import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import * as dotenv from "dotenv";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(express.json());
app.use(express.static(join(__dirname, "public")));

// ─────────────────────────────────────────────────────────
// SYSTEM PROMPT (共通)
// ─────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `あなたは @atsu_english_lesson のInstagramコンテンツ専門クリエイターです。

## アカウント情報
- アカウント名: @atsu_english_lesson（Atsu 独学×英語）
- コンセプト: 独学×留学1年で掴んだ「話せる英語」の作り方
- 経歴: NZ（ニュージーランド）とアメリカ留学・生活経験あり
- ターゲット: 社会人（海外旅行・出張で英語を使いたい人）
- 強み: ネイティブじゃない日本人目線。同じ悩みを持つ人に共感できる
- サービス: 1レッスン2,500円、無料体験受付中（DM）

## ブランドボイス
- 親しみやすく実用的
- 「学校では教えてくれなかった」という視点
- 失敗談や驚き体験を交えてリアルに
- 難しくなく、すぐ試せる内容
- 押しつけがましくなく、自然な誘導

## 2026年 Instagram アルゴリズム重要指標
- リール/ストーリー: 最初の2秒で離脱決定。DMシェアが最強指標
- ポスト: カルーセルは8〜10スライドが最適。最後まで読ませる
- 保存率・シェア率を最大化する設計にすること

必ず日本語で回答してください。`;

// ─────────────────────────────────────────────────────────
// STORY PROMPTS
// ─────────────────────────────────────────────────────────
const STORY_PROMPTS = {
  phrase: (custom) => `
Instagramストーリー用「英語フレーズ・豆知識」ジャンルのネタを3つ作ってください。

【ストーリー設計ルール】
- 縦型 9:16 フォーマット
- 画面を見た瞬間に止まるフック（最初の2秒）
- 1ストーリー1フレーズ。シンプルに
- 最後にDMシェアを促すCTAを入れる

テーマ例（縛りではない）:
- 日本人が言いがちな間違い → ネイティブはこう言う
- 学校で習わない口語表現
- ビジネス・旅行シーンで使えるワンフレーズ
- 日本語に訳せないニュアンス豊かな英単語

${custom ? `追加リクエスト: ${custom}` : ""}

以下のJSON配列で3つ返してください。前置き・説明・コードブロック一切不要。JSONのみ出力。:
[
  {
    "hook": "思わず止まる一言（疑問形か驚き系、15文字前後）",
    "main_content": {
      "wrong": "日本人が言いがちな表現（英語）",
      "right": "ネイティブはこう言う（英語）",
      "translation": "日本語の意味",
      "usage_note": "ニュアンス・使い方の補足（1〜2文、具体的に）"
    },
    "caption": "投稿キャプション（冒頭40文字で掴む・改行・絵文字あり・200文字前後）",
    "hashtags": ["タグ1", "タグ2", "タグ3", "タグ4", "タグ5"],
    "visual": {
      "background": "背景色（例: #1a1a2e ネイビー）",
      "text_color": "文字色（例: #ffffff）",
      "layout": "レイアウト説明（例: 上部フック→中央に❌/✅並列→下部例文）",
      "emoji": "アクセント絵文字（2〜3個）"
    },
    "cta": "最後の行動喚起（DMへの誘導、フォロー促進など）"
  }
]`,

  daily: (custom) => `
Instagramストーリー用「これ英語でなんていう？日常英語」ジャンルのネタを3つ作ってください。

【コンセプト】
日本人が日常でよく使う表現・状況を取り上げ、「これ英語でどう言うの？」という視点で紹介する。
学校では習わないが、実際の会話で使える実用フレーズ。見た人が「知らなかった！明日使ってみよう」と思える内容。

【ストーリー設計ルール】
- 縦型 9:16 フォーマット
- 日常のあるある状況でフック → 英語フレーズ発表 → 使い方解説
- シンプル・わかりやすく・すぐ使える
- 最後にDMシェアを促すCTAを入れる

状況例（縛りではない）:
- 「なんか変な感じがする」→ Something feels off.
- 「ちょっと待って」→ Hold on a sec.
- 「お腹いっぱい」→ I'm stuffed.
- 「気にしないで」→ Don't worry about it.
- 「それで？」→ And then what?
- 旅行・カフェ・職場・友達との会話シーン

${custom ? `追加リクエスト: ${custom}` : ""}

以下のJSON配列で3つ返してください。前置き・説明・コードブロック一切不要。JSONのみ出力。:
[
  {
    "hook": "日常のあるある状況（疑問形で引き込む、例：「ちょっと待って」って英語でなんて言う？）",
    "situation": "どんな場面で使うか（具体的なシーン説明）",
    "japanese_phrase": "日本語のフレーズ（例：ちょっと待って）",
    "english_phrase": "英語フレーズ（例：Hold on a sec.）",
    "pronunciation": "カタカナ読み・発音のコツ（例：ホールドン ア セク）",
    "usage_note": "使い方・ニュアンス解説（1〜2文、具体的に）",
    "bonus_phrase": "関連フレーズや言い換え（例：Give me a moment. も同じ意味で使える）",
    "caption": "投稿キャプション（冒頭40文字で掴む・改行・絵文字あり・200文字前後）",
    "hashtags": ["タグ1", "タグ2", "タグ3", "タグ4", "タグ5"],
    "visual": {
      "background": "背景色（例: #0f0c29 ダークネイビー）",
      "text_color": "文字色（例: #ffffff）",
      "layout": "レイアウト説明（例: 上部に状況→中央に日本語→大きく英語→下部に発音）",
      "emoji": "アクセント絵文字（2〜3個）"
    },
    "cta": "最後の行動喚起（DMへの誘導・保存促進など）"
  }
]`,

  episode: (custom) => `
Instagramストーリー用「海外生活エピソード（NZ・アメリカ）」ジャンルのネタを3つ作ってください。

【ストーリー設計ルール】
- 縦型 9:16 フォーマット、複数枚スライドで構成
- フック→出来事→オチ/学び の3段構成
- 読んだ人が「わかる！」「送りたい！」と思える共感設計
- 最後にDMシェアを促すCTAを入れる

テーマ例（縛りではない）:
- 留学初日の衝撃体験
- 英語が通じなかった恥ずかしい失敗
- 文化の違いで驚いたこと
- ネイティブから学んだこと
- 英語が話せるようになった転換点

${custom ? `追加リクエスト: ${custom}` : ""}

以下のJSON配列で3つ返してください。前置き・説明・コードブロック一切不要。JSONのみ出力。:
[
  {
    "hook": "続きが気になる一言（疑問形か体験談の冒頭、15文字前後）",
    "episode_title": "エピソードのタイトル（短くキャッチーに）",
    "story_beats": [
      "状況設定（どこで・何をしていたか）",
      "起きた出来事・失敗・驚き（具体的に）",
      "その時の気持ち・反応",
      "気づいた学び・英語へのつながり"
    ],
    "lesson": "このエピソードから英語学習に結びつける一文",
    "caption": "投稿キャプション（ストーリー調・改行・絵文字あり・200文字前後）",
    "hashtags": ["タグ1", "タグ2", "タグ3", "タグ4", "タグ5"],
    "visual": {
      "background": "背景色",
      "text_color": "文字色",
      "layout": "各スライドのレイアウト説明",
      "emoji": "アクセント絵文字"
    },
    "cta": "最後の行動喚起"
  }
]`
};

// ─────────────────────────────────────────────────────────
// POST PROMPTS
// ─────────────────────────────────────────────────────────
const POST_PROMPTS = {
  carousel_phrase: (custom) => `
Instagramポスト用「英語フレーズ教育カルーセル」のネタを3つ作ってください。

【カルーセル設計ルール】
- 正方形 1:1 フォーマット、8枚構成
- スライド1: 強いフック（保存したくなる予告）
- スライド2〜6: 1枚1ポイント教育コンテンツ（5ポイント）
- スライド7: まとめ
- スライド8: フォロー&保存CTA
- 「保存して後で見返したい」と思わせる内容設計

テーマ例（縛りではない）:
- 日本人がよく間違える英語 5選
- ネイティブが実際に使うフレーズ集
- 旅行で使える英語フレーズ
- ビジネス英語で差がつく表現

${custom ? `追加リクエスト: ${custom}` : ""}

以下のJSON配列で3つ返してください。前置き・説明・コードブロック一切不要。JSONのみ出力。:
[
  {
    "theme": "カルーセルのシリーズタイトル（例: 日本人が間違えがちな英語 5選）",
    "slides": [
      {
        "num": 1,
        "type": "hook",
        "headline": "強いフック見出し",
        "subheadline": "補足・約束（例: この5つを知れば、もう恥をかかない）"
      },
      {
        "num": 2,
        "type": "content",
        "point_num": 1,
        "wrong_phrase": "間違い英語",
        "right_phrase": "正しい英語",
        "translation": "日本語訳",
        "explanation": "なぜこちらが自然か（1文）"
      },
      {
        "num": 3,
        "type": "content",
        "point_num": 2,
        "wrong_phrase": "間違い英語",
        "right_phrase": "正しい英語",
        "translation": "日本語訳",
        "explanation": "説明"
      },
      {
        "num": 4,
        "type": "content",
        "point_num": 3,
        "wrong_phrase": "間違い英語",
        "right_phrase": "正しい英語",
        "translation": "日本語訳",
        "explanation": "説明"
      },
      {
        "num": 5,
        "type": "content",
        "point_num": 4,
        "wrong_phrase": "間違い英語",
        "right_phrase": "正しい英語",
        "translation": "日本語訳",
        "explanation": "説明"
      },
      {
        "num": 6,
        "type": "content",
        "point_num": 5,
        "wrong_phrase": "間違い英語",
        "right_phrase": "正しい英語",
        "translation": "日本語訳",
        "explanation": "説明"
      },
      {
        "num": 7,
        "type": "summary",
        "headline": "まとめ見出し",
        "points": ["ポイント1を一言で", "ポイント2を一言で", "ポイント3を一言で", "ポイント4を一言で", "ポイント5を一言で"]
      },
      {
        "num": 8,
        "type": "cta",
        "main_text": "フォロー・保存を促すメインテキスト",
        "sub_text": "無料体験の案内テキスト（DMで受付中など）"
      }
    ],
    "caption": "投稿キャプション（冒頭40文字で掴む・300文字前後・改行・絵文字あり）",
    "hashtags": ["タグ1", "タグ2", "タグ3", "タグ4", "タグ5"]
  }
]`,

  carousel_episode: (custom) => `
Instagramポスト用「海外生活エピソードカルーセル」のネタを3つ作ってください。

【カルーセル設計ルール】
- 正方形 1:1 フォーマット、6枚構成
- ストーリー仕立てで読み進めたくなる設計
- スライド1: 「え、何があったの？」と思わせる強いフック
- 中盤: 共感を呼ぶ体験談を展開
- 最後: 英語学習への橋渡し + CTA
- 読み切った達成感・保存したくなる設計

テーマ例（縛りではない）:
- 留学初日に起きた〇〇
- 英語が通じなかったエピソード
- 文化の違いシリーズ
- ネイティブに教えてもらったこと

${custom ? `追加リクエスト: ${custom}` : ""}

以下のJSON配列で3つ返してください。前置き・説明・コードブロック一切不要。JSONのみ出力。:
[
  {
    "theme": "エピソードのタイトル（キャッチーに）",
    "slides": [
      {
        "num": 1,
        "type": "hook",
        "headline": "続きが読みたくなるフック",
        "subheadline": "場面設定（NZ/アメリカ、どんな状況だったか）"
      },
      {
        "num": 2,
        "type": "content",
        "headline": "状況設定",
        "scene": "どこで・何をしていたか（具体的に）"
      },
      {
        "num": 3,
        "type": "content",
        "headline": "その時起きたこと",
        "scene": "起きた出来事・失敗・驚き（具体的に）",
        "twist": "予想外だったポイント"
      },
      {
        "num": 4,
        "type": "content",
        "headline": "そこから気づいたこと",
        "scene": "その時の気持ち・反応",
        "lesson": "英語学習・文化理解への橋渡し"
      },
      {
        "num": 5,
        "type": "summary",
        "headline": "まとめ・学び",
        "points": ["学んだこと1", "学んだこと2", "英語フレーズへの応用"]
      },
      {
        "num": 6,
        "type": "cta",
        "main_text": "フォロー・無料体験への誘導メインテキスト",
        "sub_text": "DM案内テキスト"
      }
    ],
    "caption": "投稿キャプション（ストーリー調・300文字前後・改行・絵文字あり）",
    "hashtags": ["タグ1", "タグ2", "タグ3", "タグ4", "タグ5"]
  }
]`
};

// ─────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────
app.post("/api/generate", async (req, res) => {
  const { type, genre, customPrompt } = req.body;

  let promptFn;
  if (type === "story") {
    promptFn = STORY_PROMPTS[genre];
  } else if (type === "post") {
    promptFn = POST_PROMPTS[genre];
  }

  if (!promptFn) {
    return res.status(400).json({ error: "type と genre を正しく指定してください" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = client.messages.stream({
      model: "claude-opus-4-7",
      max_tokens: 6000,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: promptFn(customPrompt?.trim()) }],
    });

    let fullText = "";

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        fullText += event.delta.text;
        res.write(`data: ${JSON.stringify({ chunk: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true, fullText })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Generation error:", error);
    res.write(
      `data: ${JSON.stringify({ error: error.message || "生成中にエラーが発生しました" })}\n\n`
    );
    res.end();
  }
});

app.get("/api/health", (_, res) => {
  res.json({ status: "ok", apiKeySet: !!process.env.ANTHROPIC_API_KEY });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Instagram Content Generator 起動!`);
  console.log(`📱 http://localhost:${PORT}\n`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn(`⚠️  ANTHROPIC_API_KEY が未設定です`);
  }
});
