# انتشار Coursefar روی GitHub Pages

این بسته، تغییرات لازم برای نمایش نسخه نمونه‌کار پروژه موجود را اضافه می‌کند.
فایل‌ها را با همان ساختار پوشه، داخل ریشه پروژه فعلی کپی کنید؛ جایی که `package.json` قرار دارد.
در صورت درخواست، جایگزینی فایل‌های هم‌نام را تأیید کنید.
پوشه `.github` نیز باید کپی شود. پروژه جدید یا مخزن Git جدید ایجاد نکنید.

## تفاوت نسخه Pages و نسخه اصلی

GitHub Pages فایل‌های HTML، CSS و JavaScript را میزبانی می‌کند و سرور Express و SQLite را اجرا نمی‌کند.
به همین دلیل، بیلد با حالت `pages` از اطلاعات نمایشی موجود پروژه و یک سرویس مرورگری استفاده می‌کند.
بیلد معمولی و `npm run dev` همچنان از بک‌اند فعلی استفاده می‌کنند.
فایل‌های بک‌اند، `.node-version`، `package.json` و `package-lock.json` با این بسته جایگزین نمی‌شوند.

نسخه Pages برای نمایش نمونه‌کار است:

- ۲۰ دوره، ۸ پروفایل مدرس نمایشی و ۱۰ مسیر یادگیری از داده‌های فعلی نمایش داده می‌شوند.
- حساب‌های نمایشی دانشجو، مدرس و مدیر در دسترس‌اند.
- ساخت حساب نمایشی، ثبت‌نام دوره، پیشرفت درس، ذخیره دوره، انتشار دوره توسط مدرس و تعلیق حساب توسط مدیر قابل امتحان‌اند.
- داده‌های دمو در IndexedDB همین مرورگر ذخیره می‌شوند. شناسه حساب جاری در Session Storage و ترجیح تم در Local Storage است.
- عکس‌های آپلودی با سیستم فعلی آواتار، در IndexedDB همان مرورگر باقی می‌مانند.
- داده‌ها و عکس‌ها بین دستگاه‌ها، پروفایل‌های مرورگر یا بازدیدکنندگان همگام نمی‌شوند؛ حذف داده‌های سایت، تغییرات محلی را پاک می‌کند.
- ورود و مجوزها شبیه‌سازی نمایشی هستند و امنیت احراز هویت واقعی را فراهم نمی‌کنند. همه حساب‌های دمو با رمز `demo` قابل ورودند. رمز شخصی یا هش آن در این حالت ذخیره نمی‌شود.
- ثبت‌نام را با نام و ایمیل آزمایشی انجام دهید. اطلاعات واقعی، خصوصی و کاربرد عملیاتی به بک‌اند نیاز دارند.

## ۱. تنظیم GitHub Pages

در مخزن `RamtinBabaei/coursefar` به **Settings → Pages** بروید و **Source = GitHub Actions** را انتخاب کنید.
اگر این تنظیم را انجام داده‌اید، آن را نگه دارید. فایل انتشار آماده در مسیر زیر قرار دارد:

```
.github/workflows/deploy.yml
```

## ۲. بررسی محلی

در PowerShell همان پوشه پروژه اجرا کنید. فقط خود دستور را وارد کنید؛ شماره مراحل و عبارت `PS ...>` بخشی از دستور نیستند.

```powershell
npm ci
npm run typecheck
npm run lint
npm run test
node --test tests/demo.test.mjs
npm run build -- --mode pages
npm run preview -- --base /coursefar/
```

برای دیدن دمو آدرس زیر را باز کنید:

```
http://localhost:4173/coursefar/
```

با `Ctrl+C` پیش‌نمایش را متوقف کنید. برای اجرای نسخه اصلی متصل به بک‌اند:

```powershell
npm run dev
```

برای بیلد نسخه اصلی:

```powershell
npm run build
```

## ۳. ارسال تغییرات به مخزن

پس از کپی فایل‌های بسته و موفق بودن بیلد:

```powershell
git add src/App.tsx src/api.ts src/assets.ts src/demoApi.ts src/demoStore.ts src/styles.css src/components/UserAvatar.tsx vite.config.ts .github/workflows/deploy.yml tests/demo.test.mjs GITHUB_PAGES_SETUP.md
git commit -m "Add GitHub Pages portfolio demo"
git push
```

## ۴. دریافت لینک سایت

صفحه مخزن را باز کنید و به **Actions** بروید. اجرای **Deploy Coursefar demo** را باز کنید.
پس از موفقیت، لینک سایت در مرحله **Publish website** و محیط **github-pages** دیده می‌شود.
لینک مورد انتظار برای مخزن فعلی:

https://ramtinbabaei.github.io/coursefar/

این لینک پس از موفقیت انتشار قابل استفاده خواهد بود. هر push جدید به `main`، بررسی و انتشار خودکار را اجرا می‌کند.
اگر اجرا شکست خورد، مرحله قرمز را باز کنید و متن خطای همان مرحله را بررسی کنید.
فایل workflow خودش وابستگی‌ها را نصب، typecheck و lint و تست‌ها را اجرا و بیلد Pages را منتشر می‌کند.

## ۵. معرفی در رزومه

در صفحه مخزن، کنار **About** روی آیکون تنظیمات بزنید و لینک آنلاین را در **Website** وارد کنید.
همین لینک را در README و رزومه نیز بگذارید و آن را «دموی تعاملی Coursefar» معرفی کنید.
برای کاربران واقعی و داده مشترک، نسخه اصلی Express و SQLite باید روی میزبان دارای اجرای Node.js و فضای ذخیره دائمی منتشر شود.

## حساب‌های نمایشی

| نقش | ایمیل | رمز |
| --- | --- | --- |
| دانشجو | student@coursefar.test | demo |
| مدرس | instructor@coursefar.test | demo |
| مدیر | admin@coursefar.test | demo |

حساب‌های جدید همین دمو نیز با ایمیل آزمایشی ثبت‌شده و رمز `demo` وارد می‌شوند.

## دامنه یا نام مخزن متفاوت

workflow نام مخزن را از GitHub می‌خواند و base مناسب را به Vite می‌دهد.
پیش‌فرض بیلد محلی Pages برابر `/coursefar/` است. برای مخزن دیگر، base را صریح بدهید:

```powershell
npm run build -- --mode pages --base /my-repo/
npm run preview -- --base /my-repo/
```

برای دامنه اختصاصی یا مخزن `USERNAME.github.io`، base باید `/` باشد؛ مقدار `PAGES_BASE` در workflow را متناسب با آن تغییر دهید.

## منابع رسمی

- [راهنمای انتشار Vite](https://vite.dev/guide/static-deploy.html)
- [معرفی GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

## بررسی انجام‌شده برای این بسته

- `npm run typecheck` موفق بود.
- `npm run lint` موفق بود.
- `npm run test` شامل ۳ تست بک‌اند موفق بود.
- `node --test tests/demo.test.mjs` شامل ۷ تست منطق دمو موفق بود.
- بیلد معمولی و بیلد `pages` هر دو موفق بودند.
- index خروجی Pages و ۳۰ آدرس مستقل شامل تصاویر و فایل‌های JavaScript/CSS با سرور استاتیک محلی بررسی شدند و پاسخ ۲۰۰ و محتوای غیرخالی داشتند.
- فایل workflow از نظر ساختار YAML بررسی شد؛ اجرای واقعی آن بعد از push روی GitHub انجام می‌شود.
- تست UI با Playwright اجرا نشد؛ فایل اجرایی Chromium در محیط تهیه بسته موجود نبود. پس از انتشار، دمو را در مرورگر خودتان بررسی کنید.
