# Dizayn istiqaməti — "Signal"

> Marketinq = səs-küyün içindən siqnalı keçirmək. Sayt da bunu edir: sakit,
> qaranlıq, "kağız" hissli fon üzərində bir dənə isti, parlaq siqnal rəngi
> diqqəti hara lazımdırsa ora çəkir.

## Konsepsiya

- **Editorial, amma canlı.** Jurnal səhifəsi kimi: nəhəng tipoqrafiya, nazik
  xətlər (hairline), bol boşluq, nömrələnmiş bölmələr `(01) — Work`.
- **Bir siqnal rəngi.** `primary` (siqnal narıncısı) yalnız vacib yerlərdə:
  highlight edilmiş sözlər, CTA, aktiv vəziyyətlər. Hər yerə səpilmir.
- **Marker effekti — saytın imzası.** Başlıqdakı açar sözlərin arxasında
  marker xətti soldan sağa "çəkilir" (`<Highlight>`). Marketoloqun
  prezentasiyada vacib rəqəmin altını cızması kimi.
- **Toxunuş hissi.** Çox yüngül film grain overlay, isti qara fon (#0d0c0a),
  krem mətn (#f2ede3). Soyuq "tech" görünüşdən fərqli olaraq isti və insani.
- **Hərəkət məna daşıyır.** Hər animasiya ya iyerarxiyanı göstərir (reveal),
  ya da interaktivliyi bildirir (magnetic, cursor). Dekorativ, mənasız
  hərəkət yoxdur.

## Rəng tokenləri (default; admində dəyişdirilir)

| Token | Hex | İstifadə |
|---|---|---|
| `background` | `#0d0c0a` | Səhifə fonu (isti qara) |
| `surface` | `#181613` | Kartlar, menyu paneli, input-lar |
| `text` (`fg`) | `#f2ede3` | Əsas mətn (krem). İkinci dərəcəli mətn: `text-fg/60` |
| `primary` | `#ff5b2e` | Siqnal: highlight, CTA, page transition pərdəsi |
| `accent` | `#b8a6ff` | Lavanda: kursor, kiçik detallar, hover işarələri |

Kontrast: `fg` / `background` ≈ 17:1, `primary` / `background` ≈ 6.6:1 (WCAG AA).
Xətlər: `border-fg/10`. Rənglər yalnız token-lərlə yazılır, JSX-də hex olmur.

## Tipoqrafiya

Admin hər qrupdan birini seçir. Hamısı **Ə ə, Ğ ğ, I ı İ, Ş ş, Ç ç, Ö ö, Ü ü
və kiril** üçün yoxlanılıb (spec-dəki Syne/Manrope-da Ə yox idi, Space
Grotesk/DM Sans-da kiril yox idi).

| Rol | Default | Alternativlər | Xarakter |
|---|---|---|---|
| Başlıq | **Unbounded** | Geologica, Playfair Display | Enli, cəsarətli, yaddaqalan |
| Mətn | **Onest** | Inter, Commissioner | Təmiz, oxunaqlı, müasir |

Ölçü şkalası (fluid, `clamp`):

| Token | Ölçü | Harada |
|---|---|---|
| `text-display` | 3rem → 10rem | Hero başlığı |
| `text-h1` | 2.5rem → 6.5rem | Bölmə başlıqları |
| `text-h2` | 2rem → 4rem | Alt başlıqlar, nəhəng rəqəmlər |
| `text-h3` | 1.375rem → 2.25rem | Kart başlıqları |
| `text-lead` | 1.125rem → 1.5rem | Giriş mətnləri |
| `text-label` | 0.75rem, UPPERCASE, geniş aralıq | Bölmə nömrələri, meta |

Başlıqlar: sıx sətir aralığı (0.95), mənfi hərf aralığı, `text-balance`.

## Layout

- 12 sütunlu grid, maksimum en 1600px, kənar boşluq `clamp(1rem, 4vw, 3.5rem)`.
- Bölmələr arası böyük boşluq (`py-section` = 6rem → 12rem).
- Hər bölmənin yuxarısında: nömrə + ad (`(03) — Services`) və nazik xətt.

## Hərəkət prinsipləri

| Element | Davranış |
|---|---|
| Reveal | `opacity 0→1`, `y 24px→0`, 0.8s, ease `[0.22, 1, 0.36, 1]`, stagger 0.06s |
| SplitText | Sözlər maskanın altından yuxarı qalxır (`y 110%→0`) |
| Highlight | Marker `scaleX 0→1`, soldan, 0.9s, reveal-dan 0.3s sonra |
| Cursor | Kiçik lavanda nöqtə + gecikən halqa; `[data-cursor]` üzərində yazılı pill olur ("Bax") |
| Magnetic | Kursora doğru maksimum 30% çəkilir, spring ilə qayıdır |
| Page transition | Primary rəngli pərdə aşağıdan qalxır, sayt adı görünür, yuxarı çəkilir |
| Preloader | 0→100 sayğac + ad, ≤1.2s, sessiyada 1 dəfə |
| Smooth scroll | Lenis, `lerp 0.1`, GSAP ticker ilə sinxron |

Ease-lər: `out-expo` `[0.16, 1, 0.3, 1]` (böyük hərəkətlər), `out-quart`
`[0.22, 1, 0.36, 1]` (reveal-lar), `in-out` `[0.65, 0, 0.35, 1]` (pərdələr).

Qaydalar: yalnız `transform`/`opacity`; `prefers-reduced-motion`-da Lenis,
parallax, pin, split, marker animasiyası sönür (sadə fade qalır); touch
cihazlarda custom kursor və magnetic sönür.

## İlham mənbələri (üslub istiqaməti)

- Editorial jurnal layout-ları: nömrələnmiş bölmələr, nazik xətlər, nəhəng başlıqlar.
- Awwwards "Portfolio" kateqoriyasındakı tipoqrafiya-mərkəzli saytlar: hero-da yalnız söz və hərəkət.
- Marker / highlighter işarələri: marketinq prezentasiyalarındakı "vacib rəqəmin altını cız" jesti.
- Analog toxunuş: film grain, isti qara və krem rənglər.

## Bax

Canlı dizayn sistemi (yalnız dev rejimdə): `http://localhost:5173/dev/design`
