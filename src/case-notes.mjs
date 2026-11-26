// Case notes for the existing project cards: the same four slots in English and Japanese.
// Copy stays within current release facts; the build script owns placement, routes and theme.
export const caseNoteSlots = ['problem', 'built', 'decision', 'limits'];

export const caseNotes = {
 en: {
  labels: {summary:'Case notes', project:name=>` (${name})`, problem:'Problem', built:'What I built', decision:'Approach and tradeoff', limits:'Current limits'},
  projects: {
   narelog: {
    problem:'When lookup and practice happen in separate places, reviewing a Japanese word can mean copying it into another tool first.',
    built:'One place to look up a Japanese word, save it to a set, and come back to it in practice. A saved word is ready for review without entering it again.',
    decision:'Saving is a separate step from lookup. You choose which words to add to review. The tradeoff is one more step for each word you want to keep.',
    limits:'The current beta is a limited release focused on study. Using the app requires beta access, so the link here goes to the public site.'
   },
   lodestone: {
    problem:'Hearing where a note sits in a key is a skill you build by ear, with practice.',
    built:'A browser ear-training app with on-screen piano keys and a guided first lesson. Practice starts with two contrasting sounds.',
    decision:'The lesson plays each sound before revealing its key, then lets you explore the introduced keys. Starting with two sounds keeps the first exercise focused, but covers only a small part of the key.',
    limits:'The browser beta is in English only. On iPhone, use Safari; audio has an unresolved problem when the app is opened from the Home Screen.'
   },
   plink: {
    problem:'Can arranging objects in a scene work as a way to make music? Plink is a prototype for testing that.',
    built:'A scene where you place objects in the rain. Where each object sits across the pitch and rhythm lanes shapes the music it makes.',
    decision:'Object positions supply pitch and rhythm inputs. Jam uses local rules to add chords, bass, and rhythm without a cloud AI service. Music generation stays in the browser; it does not learn from audio recordings.',
    limits:'A public experimental demo of a procedural music prototype. There is no save or export yet. Behavior on a real iPhone and the musical results still need evaluation.'
   }
  }
 },
 ja: {
  labels: {summary:'制作メモ', project:name=>`（${name}）`, problem:'課題', built:'つくったもの', decision:'仕組みとトレードオフ', limits:'現在の制約'},
  projects: {
   narelog: {
    problem:'日本語の言葉を調べる場所と練習する場所が別々だと、復習する前に別のツールへ言葉を移す手間がかかります。',
    built:'日本語の言葉を調べ、セットに保存し、練習で使うまでを一か所で行えるようにしました。保存した言葉は、入力し直さなくても復習に使えます。',
    decision:'検索と保存は別の操作です。復習したい言葉を自分で選んで保存します。その分、残したい言葉ごとに操作が一つ増えます。',
    limits:'現在のベータ版は、学習機能に絞って限定的に提供しています。アプリの利用にはベータアクセスが必要なため、ここからは公式サイトにリンクしています。'
   },
   lodestone: {
    problem:'調の中で音がどこにあるかを聴き取る力は、耳で練習しながら身につけるものです。',
    built:'画面上の鍵盤と、手順に沿って進める最初のレッスンを備えた、ブラウザ版の耳の練習アプリです。対照的な二つの音から練習を始めます。',
    decision:'まず音を鳴らし、その後に対応する鍵盤を示します。紹介された鍵盤は、自分で弾いて確かめられます。最初は二つの音に絞るため、練習の対象は明確ですが、扱うのは調のごく一部です。',
    limits:'ブラウザ版ベータは英語のみです。iPhoneではSafariをご利用ください。ホーム画面から起動した場合の音声には、未解決の問題があります。'
   },
   plink: {
    problem:'場面の中にものを並べることで、音楽をつくれるか。それを確かめるための試作です。',
    built:'雨の中にものを置く場面です。音の高さとリズムのレーンのどこに置くかで、鳴る音楽が変わります。',
    decision:'ものの位置を音の高さとリズムの入力に使い、Jamがブラウザ内で決められたルールに沿ってコード、ベース、リズムを加えます。クラウドのAIサービスは使いません。音楽の生成はブラウザ内で完結し、録音データから学習する仕組みではありません。',
    limits:'ルールで音楽を生成する試作の、実験的な公開デモです。保存・書き出し機能はまだありません。iPhone実機での動作と、音楽としての仕上がりは引き続き評価が必要です。'
   }
  }
 }
};

// Native disclosure: closed by default, keyboard accessible and usable without JavaScript.
export function renderCaseNotes(lang, product, {esc}) {
 const notes = caseNotes[lang]?.projects[product.id];
 if (!notes) return '';
 const l = caseNotes[lang].labels;
 return `<details class="case-notes"><summary>${l.summary}<span class="visually-hidden">${esc(l.project(product.name))}</span></summary><dl>${caseNoteSlots.map(slot=>`<div><dt>${l[slot]}</dt><dd>${esc(notes[slot])}</dd></div>`).join('')}</dl></details>`;
}
