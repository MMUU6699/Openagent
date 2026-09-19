# تفعيل تسجيل Google وGitHub

تم تجهيز التكامل في التطبيق، لكنه لن يعمل حتى تنشئ تطبيق OAuth لكل مزوّد وتضيف بياناته على الخادم. لا تضع Client Secret داخل الواجهة أو المستودع أو المحادثة.

## القيم المشتركة

- عنوان الموقع: `https://145.241.159.235.nip.io`
- عنوان الرجوع لكلا المزوّدين: `https://145.241.159.235.nip.io/oauth/callback`
- عنوان الرجوع هو مسار الواجهة أعلاه، وليس `/api/oauth/callback`.
- للبيئة المحلية استخدم تطبيقات/عملاء اختبار منفصلة مع `http://localhost:8080/oauth/callback`، ولا تغيّر إعدادات إنتاج Oracle للاختبار المحلي.

## Google

1. افتح https://console.cloud.google.com/ واختر أو أنشئ مشروعًا تملكه.
2. افتح Google Auth Platform وأكمل Branding وAudience وContact information. اختر External إذا كان الدخول لمستخدمين خارج مؤسستك.
3. في مرحلة Testing، أضف عناوين حسابات الاختبار إلى Test users. أكمل متطلبات النشر والتحقق في Google قبل إتاحة الدخول للجمهور.
4. من Clients اختر Create client ثم Web application.
5. أضف الموقع أعلاه إلى Authorized JavaScript origins، وعنوان الرجوع بالضبط إلى Authorized redirect URIs.
6. أنشئ العميل واحفظ Client ID وClient Secret في ملف خاص. إذا رفضت Google نطاق nip.io أو طلبت إثبات ملكية النطاق، استخدم نطاقًا تملكه؛ لا تتجاوز التحقق.
7. الأذونات المطلوبة للتسجيل فقط: `openid email profile`. لا يحتاج هذا التطبيق إلى صلاحيات Drive أو Gmail.

مرجع Google: https://developers.google.com/identity/protocols/oauth2/web-server

## GitHub

1. افتح https://github.com/settings/developers ثم OAuth Apps ثم New OAuth App.
2. Application name: `OpenAgent`؛ Homepage URL: عنوان الموقع أعلاه.
3. Authorization callback URL: عنوان الرجوع أعلاه.
4. اختر Register application، ثم Generate a new client secret واحفظ Client ID وClient Secret في ملف خاص.
5. التطبيق يطلب `read:user user:email` ويقرأ بريدًا موثّقًا حتى عندما يكون بريد GitHub مخفيًا. لا يطلب الوصول إلى المستودعات.

مرجع GitHub: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps

## ربط البيانات بالتطبيق

أخبرني بمسار ملف البيانات الخاص عندما يصبح جاهزًا؛ لا ترسل الأسرار كنص في المحادثة.
الهيكل المطلوب داخل config.json على الخادم (ادمجه ولا تستبدل بقية إعدادات قاعدة البيانات والنماذج):

```json
{
  "oauth": {
    "providers.google": { "clientId": "GOOGLE_CLIENT_ID", "clientSecret": "GOOGLE_CLIENT_SECRET" },
    "providers.github": { "clientId": "GITHUB_CLIENT_ID", "clientSecret": "GITHUB_CLIENT_SECRET" }
  }
}
```

الملف: `/home/ubuntu/open-agent/deploy/oci/config.json`؛ الأذونات `600`.
بعد الحفظ أعد تشغيل التطبيق من مجلد النشر: `sudo docker compose restart app`.
تعرض `/api/oauth/providers` أسماء المزوّدين المفعّلين فقط، ولا تكشف مفاتيحهم.
اختبر الدخول الفعلي لكل مزوّد بحساب اختبار؛ لا يُعد ظهور الزر دليلًا على نجاح تسجيل الدخول. رفض الموافقة أو فشل الدخول يعيد المستخدم إلى صفحة الدخول برسالة واضحة.

## اللغة والخط

العربية افتراضية، والإنجليزية متاحة من الإعدادات ومن صفحة الدخول. يُحفظ الاختيار في المتصفح، وليس مزامنًا بين الأجهزة. عند تبديل اللغة يعاد تركيب صفحات الواجهة؛ احفظ المسودات غير المرسلة قبل التبديل. أسماء النماذج ومحتوى المستخدم والشيفرات تبقى كما هي.
خط Noto Naskh Arabic بأوزان 400–700 مستضاف محليًا مع رخصة OFL داخل `public/fonts/noto-naskh-arabic`. يطبّق اتجاه RTL على الواجهة العربية وتبقى الشيفرات LTR.
