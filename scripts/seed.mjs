// ローカル Supabase に、あらかじめ用意したダミーのアンケートを投入するスクリプト。
//
// 使い方:
//   npm run db:seed
import { createClient } from "@supabase/supabase-js";

// カードの見た目の差異が出るよう、あえて長さの違う文言を混ぜている
const SURVEYS = [
  {
    p_title: "アンケートのお願い",
    p_recruiter_name: "田中太郎",
    p_affiliation: "筑波大学",
    p_url: "https://forms.gle/seed-01",
    p_requirements: [],
  },
  {
    p_title: "SNS利用実態調査",
    p_recruiter_name: "佐藤花子",
    p_affiliation: "つくば市役所",
    p_url: "https://forms.gle/seed-02",
    p_requirements: ["20歳以上であること"],
  },
  {
    p_title: "新商品パッケージデザインに関するアンケート",
    p_recruiter_name: "山田研究室",
    p_affiliation: "筑波大学 情報学群 情報科学類",
    p_url: "https://forms.gle/seed-03",
    p_requirements: [
      "スマートフォンを所有していること",
      "本調査への協力に同意いただける方",
    ],
  },
  {
    p_title: "地域コミュニティにおける防災意識調査",
    p_recruiter_name: "高橋 美咲",
    p_affiliation: "○○株式会社 マーケティング部",
    p_url: "https://forms.gle/seed-04",
    p_requirements: [
      "筑波大学の学生であること",
      "20歳以上であること",
      "所要時間は約10分です",
    ],
  },
  {
    p_title: "オンラインショッピングに関するアンケート調査のご協力をお願いします",
    p_recruiter_name: "鈴木一郎（筑波大学大学院システム情報工学研究群）",
    p_affiliation: "筑波大学附属病院 臨床研究推進センター",
    p_url: "https://forms.gle/seed-05",
    p_requirements: ["過去1年以内にオンラインショッピングを利用したことがある方"],
  },
  {
    p_title: "オンライン授業と対面授業の学習効果比較に関する調査",
    p_recruiter_name: "筑波大学人間学群心理学類4年 伊藤健",
    p_affiliation: "筑波大学大学院 システム情報工学研究群 知能機能システム専攻",
    p_url: "https://forms.gle/seed-06",
    p_requirements: [
      "筑波大学の学生であること",
      "回答は任意で、いつでも中断できます",
    ],
  },
  {
    p_title: "働き方改革が従業員満足度に与える影響についてのアンケート",
    p_recruiter_name: "田中太郎",
    p_affiliation: "○○株式会社 マーケティング部",
    p_url: "https://forms.gle/seed-07",
    p_requirements: [],
  },
  {
    p_title: "大学生の睡眠習慣と学業成績の関連性に関するアンケート調査へのご協力をお願いいたします",
    p_recruiter_name: "山田研究室",
    p_affiliation: "筑波大学 情報学群 情報科学類",
    p_url: "https://forms.gle/seed-08",
    p_requirements: [
      "筑波大学の学生であること",
      "スマートフォンを所有していること",
      "本調査への協力に同意いただける方",
      "所要時間は約10分です",
      "週3回以上SNSを利用している方",
    ],
  },
  {
    p_title: "健康的な食生活に関するアンケート",
    p_recruiter_name: "佐藤花子",
    p_affiliation: "筑波大学",
    p_url: "https://forms.gle/seed-09",
    p_requirements: ["20歳以上であること", "回答は任意で、いつでも中断できます"],
  },
  {
    p_title: "つくば市内の交通利便性に関する調査",
    p_recruiter_name: "高橋 美咲",
    p_affiliation: "つくば市役所",
    p_url: "https://forms.gle/seed-10",
    p_requirements: ["週3回以上SNSを利用している方"],
  },
];

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY が設定されていません。.env.local を確認してください",
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log(`${SURVEYS.length}件のダミーデータを投入します`);

  for (const [i, survey] of SURVEYS.entries()) {
    const { error } = await supabase.rpc("create_survey", survey);
    if (error) {
      throw new Error(`${i + 1}件目の投入に失敗しました: ${error.message}`);
    }
    console.log(`  [${i + 1}/${SURVEYS.length}] ${survey.p_title}`);
  }

  console.log("完了しました");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
