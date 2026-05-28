# TTS_FILES Mapping Plan

> מסמך זה מתאר את כל ה-entries שצריך להוסיף ל-`TTS_FILES` בפאזה 4.
> **טרם עודכן ב-letters.ts** — ממתין לאישור סופי אחרי NEEDS_DECISION.
>
> כללים:
> - patah — קיים (20 entries, לא נגעים)
> - kamatz — speak זהה לפתח (speakSuffix='ָא' לשניהם) → אין entries חדשים דרושים
> - none (עיצור) — קיים (מפאזה 2)
> - tzere ≡ segol → entries של tzere מצביעים ל-MP3 של segol
> - kubutz ≡ shuruk → entries של kubutz מצביעים ל-MP3 של shuruk
> - hatafPatah, hatafSegol, shva — Web Speech fallback, אין entries

---

## עקרונות speak text לכל ניקוד

| ניקוד | speakSuffix | speak formula | דוגמה (ב) |
|-------|-------------|---------------|-----------|
| hirik | `ִי` | displayChar + ִי | `בִּי` |
| segol | `ֶא` | displayChar + ֶא | `בֶּא` |
| tzere | `ֵא` | displayChar + ֵא | `בֵּא` → Be.mp3 |
| holam | `ֹא` | displayChar + ֹא | `בֹּא` |
| shuruk | `וּ` | displayChar + וּ | `בּוּ` |
| kubutz | `ֻ` | displayChar + ֻ | `בֻּ` → Bu.mp3 |

### Overrides (חריגים לkullal)

| Letter | hirik | segol | tzere | holam | shuruk | kubutz |
|--------|-------|-------|-------|-------|--------|--------|
| tz (צ) | `tsee` | `tse` | `tsei` | `tso` | `tsoo` | `tsoo` |
| f_rafe (פ רפה) | `Fi` | `Fe` | `Fei` | `Fo` | `foo` | `foo` |
| ch+hirik | `חִ` | — | — | — | — | — |
| v_rafe | speakChar=ו → same as va | — | — | — | — | — |
| ch_rafe | speakChar=ח → same as ch | — | — | — | — | — |

---

## ניקוד: חיריק (i)

**MP3 dir:** `hirik/` | **Speak overrides:** tz=`tsee`, f_rafe=`Fi`, ch+hirik=`חִ`

| speak | filename |
|-------|----------|
| `אִי` | `Ai.mp3` |
| `בִּי` | `Bi.mp3` |
| `גִי` | `Gi.mp3` |
| `דִי` | `Di.mp3` |
| `הִי ` | `Hi.mp3` |
| `וִי` | `Vi.mp3` |
| `זִי` | `Zi.mp3` |
| `חִ` | `Chi.mp3` |
| `טִי` | `Ti.mp3` |
| `יִי` | `Yi.mp3` |
| `כִּי` | `Ki.mp3` |
| `לִי` | `Li.mp3` |
| `מִי` | `Mi.mp3` |
| `נִי` | `Ni.mp3` |
| `סִי` | `Si.mp3` |
| `פִּי` | `Pi.mp3` |
| `tsee` | `Tsai.mp3` |
| `קִי` | `Qi.mp3` |
| `רִי` | `Ri.mp3` |
| `שִׁי` | `Shi.mp3` |
| `תִּי` | `Tavi.mp3` |
| `שִׂי` | `Sini.mp3` |
| `עִיא` | `Aai.mp3` |
| `[short] וִי` | `Vi.mp3` |
| `Fi` | `Fi.mp3` |

> **שיתופים ב-TTS_FILES:** גם va_rafe וגם va מצביעים ל-Vi.mp3 (אותו speak `[short] וִי`). ח+ch_rafe מצביעים ל-Chi.mp3 (speak `חִ`).

---

## ניקוד: סגול (e)

**MP3 dir:** `segol/` | **Speak overrides:** tz=`tse`, f_rafe=`Fe`

| speak | filename |
|-------|----------|
| `אֶא` | `Ae.mp3` |
| `בֶּא` | `Be.mp3` |
| `גֶא` | `Ge.mp3` |
| `דֶא` | `De.mp3` |
| `הֶא` | `He.mp3` |
| `וֶא` | `Ve.mp3` |
| `זֶא` | `Ze.mp3` |
| `חֶא` | `Che.mp3` |
| `טֶא` | `Te.mp3` |
| `יֶא` | `Ye.mp3` |
| `כֶּא` | `Ke.mp3` |
| `לֶא` | `Le.mp3` |
| `מֶא` | `Me.mp3` |
| `נֶא` | `Ne.mp3` |
| `סֶא` | `Se.mp3` |
| `פֶּא` | `Pe.mp3` |
| `tse` | `Tsae.mp3` |
| `קֶא` | `Qe.mp3` |
| `רֶא` | `Re.mp3` |
| `שֶׁא` | `She.mp3` |
| `תֶּא` | `Tave.mp3` |
| `שֶׂא` | `Sine.mp3` |
| `עֶא` | `Aae.mp3` |
| `Fe` | `Fe.mp3` |

> **שיתופים:** va_rafe → speak=`וֶא` = Ve.mp3 (אוטומטי). ch_rafe → speak=`חֶא` = Che.mp3 (אוטומטי).

---

## ניקוד: צירה (ei) — SHARED עם סגול

**אין העלאה ל-R2.** כל entry מצביע על MP3 של סגול.

| speak (tzere) | filename (segol) |
|---------------|-----------------|
| `אֵא` | `Ae.mp3` |
| `בֵּא` | `Be.mp3` |
| `גֵא` | `Ge.mp3` |
| `דֵא` | `De.mp3` |
| `הֵא` | `He.mp3` |
| `וֵא` | `Ve.mp3` |
| `זֵא` | `Ze.mp3` |
| `חֵא` | `Che.mp3` |
| `טֵא` | `Te.mp3` |
| `יֵא` | `Ye.mp3` |
| `כֵּא` | `Ke.mp3` |
| `לֵא` | `Le.mp3` |
| `מֵא` | `Me.mp3` |
| `נֵא` | `Ne.mp3` |
| `סֵא` | `Se.mp3` |
| `פֵּא` | `Pe.mp3` |
| `tsei` | `Tsae.mp3` |
| `קֵא` | `Qe.mp3` |
| `רֵא` | `Re.mp3` |
| `שֵׁא` | `She.mp3` |
| `תֵּא` | `Tave.mp3` |
| `שֵׂא` | `Sine.mp3` |
| `עֵא` | `Aae.mp3` |
| `Fei` | `Fe.mp3` |

---

## ניקוד: חולם (o)

**MP3 dir:** `holam/` | **Speak overrides:** tz=`tso`, f_rafe=`Fo`

| speak | filename |
|-------|----------|
| `אֹא` | `Ao.mp3` |
| `בֹּא` | `Bo.mp3` |
| `גֹא` | `Go.mp3` |
| `דֹא` | `Do.mp3` |
| `הֹא` | `Ho.mp3` |
| `וֹא` | `Vo.mp3` |
| `זֹא` | `Zo.mp3` |
| `חֹא` | `Cho.mp3` |
| `טֹא` | `To.mp3` |
| `יֹא` | `Yo.mp3` |
| `כֹּא` | `Ko.mp3` |
| `לֹא` | `Lo.mp3` |
| `מֹא` | `Mo.mp3` |
| `נֹא` | `No.mp3` |
| `סֹא` | `So.mp3` |
| `פֹּא` | `Po.mp3` |
| `tso` | `Tsao.mp3` |
| `קֹא` | `Qo.mp3` |
| `רֹא` | `Ro.mp3` |
| `שֹׁא` | `Sho.mp3` |
| `תֹּא` | `Tavo.mp3` |
| `שֹׂא` | `Sino.mp3` |
| `עֹא` | `Aao.mp3` |
| `Fo` | `Fo.mp3` |

---

## ניקוד: שורוק (u)

**MP3 dir:** `shuruk/` | **Speak overrides:** tz=`tsoo`, f_rafe=`foo`
**חריגים נוספים (variants):** Vu=`voo`, Su=`soo`, Au=`oo`, Gu=`goo`, Hu=`hoo`, Ch=`חֻ`

| speak | filename | הערה |
|-------|----------|------|
| `oo` | `Au.mp3` | א+שורוק — אילם, רק תנועה |
| `בּוּ` | `Bu.mp3` | |
| `goo` | `Gu.mp3` | variant גוּ |
| `דוּ` | `Du.mp3` | |
| `hoo` | `Hu.mp3` | variant הוּ |
| `voo` | `Vu.mp3` | variant ווּ |
| `זוּ` | `Zu.mp3` | |
| `חֻ` | `Chu.mp3` | variant — avoid waw swallowing chet |
| `טוּ` | `Tu.mp3` | |
| `יוּ` | `Yu.mp3` | |
| `כּוּ` | `Ku.mp3` | |
| `לוּ` | `Lu.mp3` | |
| `מוּ` | `Mu.mp3` | |
| `נוּ` | `Nu.mp3` | |
| `soo` | `Su.mp3` | variant סוּ |
| `פּוּ` | `Pu.mp3` | |
| `tsoo` | `Tsau.mp3` | Latin override צ |
| `קוּ` | `Qu.mp3` | |
| `רוּ` | `Ru.mp3` | |
| `שׁוּ` | `Shu.mp3` | |
| `תּוּ` | `Tavu.mp3` | |
| `שׂוּ` | `Sinu.mp3` | |
| `עוּ` | `Aau.mp3` | |
| `voo` | `Vu.mp3` | ב רפה = ו → shared |
| `חֻ` | `Chu.mp3` | כ רפה = ח → shared |
| `foo` | `Fu.mp3` | Latin override פ רפה |

> **שיתופים:** va_rafe speak=`voo` = Vu.mp3. ch_rafe speak=`חֻ` = Chu.mp3.

---

## ניקוד: קובוץ (uu) — SHARED עם שורוק

**אין העלאה ל-R2.** כל entry מצביע על MP3 של שורוק.

| speak (kubutz) | filename (shuruk) |
|----------------|------------------|
| `אֻ` | `Au.mp3` |
| `בֻּ` | `Bu.mp3` |
| `גֻ` | `Gu.mp3` |
| `דֻ` | `Du.mp3` |
| `הֻ` | `Hu.mp3` |
| `וֻ` | `Vu.mp3` |
| `זֻ` | `Zu.mp3` |
| `חֻ` | `Chu.mp3` |
| `טֻ` | `Tu.mp3` |
| `יֻ` | `Yu.mp3` |
| `כֻּ` | `Ku.mp3` |
| `לֻ` | `Lu.mp3` |
| `מֻ` | `Mu.mp3` |
| `נֻ` | `Nu.mp3` |
| `סֻ` | `Su.mp3` |
| `פֻּ` | `Pu.mp3` |
| `tsoo` | `Tsau.mp3` |
| `קֻ` | `Qu.mp3` |
| `רֻ` | `Ru.mp3` |
| `שֻׁ` | `Shu.mp3` |
| `תֻּ` | `Tavu.mp3` |
| `שֻׂ` | `Sinu.mp3` |
| `עֻ` | `Aau.mp3` |
| `וֻ` | `Vu.mp3` |
| `חֻ` | `Chu.mp3` |
| `foo` | `Fu.mp3` |

> **שים לב:** kubutz ch (חֻ) = שורוק ch (חֻ) — אותו speak, אותו MP3, ממילא.

---

## מה לא בסקופ (Web Speech fallback)

- `hatafPatah` — כל 26 צירופים
- `hatafSegol` — כל 26 צירופים
- `shva` — כל 26 צירופים

---

## ספירת entries חדשים

| ניקוד | entries חדשים |
|-------|--------------|
| hirik | ~25 |
| segol | ~24 |
| tzere (→ segol) | ~24 |
| holam | ~24 |
| shuruk | ~26 |
| kubutz (→ shuruk) | ~26 |
| **סה"כ** | **~149 entries** |

בנוסף לpatah הקיים (~20 entries) ו-none הקיים (~21 entries) = **~190 entries total** ב-TTS_FILES.

---

## R2 — קבצים להעלאה

| ניקוד | תיקייה | קבצים | מעלים? |
|-------|---------|--------|--------|
| hirik | `hirik/` | 26 | ✅ (אחרי אישור) |
| segol | `segol/` | 26 | ✅ |
| tzere | `tzere/` | 26 | ❌ (shared עם segol) |
| holam | `holam/` | 26 | ✅ |
| shuruk | `shuruk/` | 26 | ✅ |
| kubutz | `kubutz/` | 26 | ❌ (shared עם shuruk) |
| hatafPatah | `hatafPatah/` | 26 | ❌ (Web Speech) |
| hatafSegol | `hatafSegol/` | 26 | ❌ (Web Speech) |
| **סה"כ** | | | **104 קבצים ל-R2** |

---

*נוצר 2026-05-18 על ידי executor לקראת אישור NEEDS_DECISION.*
