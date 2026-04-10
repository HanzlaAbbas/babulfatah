const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fixes = [
  {
    slug: "ilamat-e-qiyamat-ka-bayan",
    metaDescription: "Ilamat e Qiyamat Ka Bayan is an Urdu book on the signs of the Day of Judgment. Covers minor and major signs, resurrection from Quran and hadith."
  },
  {
    slug: "imam-ibn-e-taimiya-ki-zindgi-kay-sunehray-waqiat",
    metaDescription: "Imam Ibn e Taimiya ki Zindgi kay Sunehray Waqiat is an Urdu biography of Ibn Taymiyyah. Covers his scholarship, debates, imprisonments, and legacy."
  },
  {
    slug: "imam-muhammad-bin-ismael-al-bukhari-aur-sahih-al-bukhari",
    metaDescription: "Imam Muhammad bin Ismael Al-Bukhari aur Sahih Al-Bukhari is an Urdu book on Imam Bukhari's life and hadith methodology. Covers his biography and Sahih al-Bukhari."
  },
  {
    slug: "imam-sufiyan-bin-uyaniyah-may-allah-have-mercy-upon-him",
    metaDescription: "Imam Sufiyan Bin Uyaniyah is an Urdu biography of the great hadith scholar and exegete. Covers his life, teachers, students, and scholarly contributions."
  },
  {
    slug: "important-lessons-for-muslim-women",
    metaDescription: "Important Lessons for Muslim Women is an English guide covering prayer, hijab, family life, and daily Islamic obligations for Muslim women."
  },
  {
    slug: "in-defence-of-the-true-faith",
    metaDescription: "In Defence of the True Faith is an English book on early Islamic battles as defensive struggles. Covers Badr, Uhud, Khandaq, and rules of warfare."
  },
  {
    slug: "in-quest-of-truth-salman-al-farisi-ra",
    metaDescription: "In Quest of Truth Salman Al-Farisi R.A. is an English biography of the Persian companion's spiritual journey from Zoroastrianism to Islam."
  },
  {
    slug: "in-the-kings-court",
    metaDescription: "In The King's Court is an English Islamic storybook of court narratives across Islamic history. Teaches justice, wisdom, and courage through stories."
  },
  {
    slug: "ina-allah-ala-kulli-shayen-qadeer-calligraphy-laser-cut-table-decor-black",
    metaDescription: "Ina Allah Ala Kulli Shayen Qadeer black laser-cut table decor with Surah Al-Baqarah 2:20 calligraphy. Precision-cut Islamic decorative tabletop piece."
  },
  {
    slug: "ina-allah-ala-kulli-shayen-qadeer-calligraphy-laser-cut-wall-art-black",
    metaDescription: "Ina Allah Ala Kulli Shayen Qadeer black laser-cut wall art with Surah Al-Baqarah 2:20 calligraphy. Bold Islamic decor for homes and offices."
  },
  {
    slug: "ina-allah-ala-kulli-shayen-qadeer-calligraphy-laser-cut-wall-art-golden",
    metaDescription: "Ina Allah Ala Kulli Shayen Qadeer golden laser-cut wall art with Surah Al-Baqarah 2:20. Premium gold-finish Islamic calligraphy decor."
  },
  {
    slug: "inam-yafta-taqreeain",
    metaDescription: "Inam Yafta Taqreeain is an Urdu compilation of award-winning Islamic essays. Covers aqeedah, fiqh, history, and Muslim issues by scholars."
  },
  {
    slug: "inkaar-e-hadith-se-inkar-e-quran-tk",
    metaDescription: "Inkaar-e-Hadith se Inkar-e-Quran Tak is an Urdu scholarly book proving hadith denial leads to Quran denial. Shows Quran needs Prophetic explanation."
  },
  {
    slug: "insaan-apni-sifaat-k-ayinay-main",
    metaDescription: "Insaan Apni Sifaat k Ayinay Main is an Urdu Islamic self-improvement book on character development. Covers positive and negative traits with practical steps."
  },
  {
    slug: "insaniyat-mout-kay-darwazay-par",
    metaDescription: "Insaniyat Mout Kay Darwazay Par is an Urdu Islamic book on facing death with faith. Covers mortality, funeral rites, and spiritual preparation per Islam."
  }
];

async function main() {
  console.log(`Fixing ${fixes.length} meta descriptions...`);
  let ok = 0, fail = 0;
  for (const f of fixes) {
    try {
      const len = f.metaDescription.length;
      if (len < 130 || len > 155) {
        console.log(`⚠️  STILL BAD: ${f.slug} — ${len} chars`);
        fail++;
      } else {
        await prisma.product.update({
          where: { slug: f.slug },
          data: { metaDescription: f.metaDescription }
        });
        console.log(`✅ ${f.slug} — ${len} chars`);
        ok++;
      }
    } catch (err) {
      console.error(`❌ ${f.slug} — ${err.message}`);
      fail++;
    }
  }
  console.log(`\nFixed: ${ok}, Bad: ${fail}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
