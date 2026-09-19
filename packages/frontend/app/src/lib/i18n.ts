import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'ar' | 'en';
export const useLanguage = create<{ language: Language; setLanguage: (value: Language) => void }>()(
  persist(set => ({ language: 'ar', setLanguage: language => set({ language }) }), { name: 'openagent-language' })
);

export const arabic: Record<string, string> = {
  'Settings':'الإعدادات', 'Language':'اللغة', 'Appearance':'المظهر',
  'Choose your interface language. Changes are saved on this browser.':'اختر لغة الواجهة. يُحفظ اختيارك في هذا المتصفح.',
  'Back to chats':'العودة إلى المحادثات', 'Your workspace, your language.':'مساحة عملك، بلغتك.',
  'Welcome back':'مرحبًا بعودتك', 'Create account':'إنشاء حساب',
  'One workspace for your ideas, documents, and AI conversations.':'مساحة واحدة لأفكارك ومستنداتك ومحادثاتك مع الذكاء الاصطناعي.',
  'Sign in to continue your work.':'سجّل الدخول لمتابعة عملك.', 'Start your next idea with OpenAgent.':'ابدأ فكرتك القادمة مع OpenAgent.',
  'Email address':'البريد الإلكتروني', 'Password':'كلمة المرور', 'Confirm password':'تأكيد كلمة المرور',
  'At least 8 characters':'ثمانية أحرف على الأقل', 'Passwords do not match':'كلمتا المرور غير متطابقتين',
  'Sign in':'تسجيل الدخول', 'Sign In':'تسجيل الدخول', 'Sign out':'تسجيل الخروج', 'Welcome Back':'مرحبًا بعودتك',
  'Already have an account?':'لديك حساب بالفعل؟', 'New to OpenAgent?':'هل تستخدم OpenAgent لأول مرة؟',
  'Or use your email':'أو استخدم بريدك الإلكتروني', 'Continue with Google':'المتابعة باستخدام Google',
  'Continue with GitHub':'المتابعة باستخدام GitHub', 'Not configured yet':'لم يُفعّل بعد',
  'Provider setup is required by the administrator. Email registration is available.':'يتطلب هذا الخيار إعدادًا من المسؤول. يمكنك التسجيل بالبريد وكلمة المرور.',
  'Unable to load sign-in providers. Please retry.':'تعذّر تحميل خيارات الدخول. حاول مجددًا.',
  'Unable to sign in. Check your email and password.':'تعذّر تسجيل الدخول. تحقق من البريد وكلمة المرور.',
  'Unable to create account. The email may already be registered.':'تعذّر إنشاء الحساب. قد يكون البريد مسجلًا بالفعل.',
  'OAuth sign-in could not be completed. Please try again.':'تعذّر إكمال الدخول بواسطة المزوّد. حاول مجددًا.',
  'Completing sign-in...':'جارٍ إكمال تسجيل الدخول...', 'Please wait...':'يرجى الانتظار...',
  'New Chat':'محادثة جديدة', 'Library':'المكتبة', 'Recent':'الأخيرة', 'Favorites':'المفضلة',
  'Search':'بحث', 'Search ⌘K':'بحث ⌘K', 'Search chats...':'ابحث في المحادثات...',
  'What can I help you with?':'كيف يمكنني مساعدتك؟', 'What are your thoughts?':'ما الذي تفكر فيه؟',
  'All':'الكل', 'Chats':'المحادثات', 'Documents':'المستندات', 'Attachments':'المرفقات',
  'Docs':'المستندات', 'Files':'الملفات', 'No results':'لا توجد نتائج', 'No results found':'لم يُعثر على نتائج',
  'There are no contents here':'لا يوجد محتوى هنا', 'You can generate content by creating new chats':'يمكنك إنشاء محتوى ببدء محادثة جديدة',
  'Loading...':'جارٍ التحميل...', 'Loading history...':'جارٍ تحميل السجل...', 'Loading document...':'جارٍ تحميل المستند...',
  'Loading preview...':'جارٍ تحميل المعاينة...', 'Today':'اليوم', 'Yesterday':'أمس', 'This Week':'هذا الأسبوع', 'This Month':'هذا الشهر', 'Older':'الأقدم',
  'Share':'مشاركة', 'Copy':'نسخ', 'Copied':'تم النسخ', 'Copied to clipboard':'تم النسخ إلى الحافظة', 'Link copied to clipboard':'تم نسخ الرابط',
  'Delete Chat':'حذف المحادثة', 'Are you sure you want to sign out?':'هل تريد تسجيل الخروج؟', 'Cancel':'إلغاء', 'Confirm':'تأكيد',
  'Foundation Model':'النموذج الأساسي', 'Code Artifact':'إنشاء الشيفرة', 'Make It Real':'تحويل التصميم إلى تطبيق',
  'Doc Compose':'كتابة مستند', 'Web Search':'البحث على الويب', 'Browser Use':'استخدام المتصفح', 'Task Analysis':'تحليل المهمة',
  'Actions':'الإجراءات', 'Open Library':'فتح المكتبة', 'Add images & files':'إضافة صور وملفات', 'Document Context':'سياق المستند',
  'Show More':'عرض المزيد', 'Untitled':'بلا عنوان', 'Document':'مستند', 'Generated Document':'المستند الناتج', 'Close document':'إغلاق المستند',
  'Open chat panel':'فتح لوحة المحادثة', 'No document available':'لا يوجد مستند', 'No content to present':'لا يوجد محتوى للعرض',
  'Enter presentation mode':'بدء العرض التقديمي', 'Close Presentation':'إغلاق العرض', '← → Navigate | ESC Exit | Space Next Page':'الأسهم للتنقل | ESC للخروج | المسافة للصفحة التالية',
  'Thinking...':'جارٍ التفكير...', 'Thought for':'مدة التفكير', 'Thoughts':'الأفكار', 'seconds':'ثانية',
  'Generating...':'جارٍ الإنشاء...', 'Coding...':'جارٍ كتابة الشيفرة...', 'Code generated':'تم إنشاء الشيفرة',
  'Code':'الشيفرة', 'Preview':'المعاينة', 'Result':'النتيجة', 'No output':'لا توجد مخرجات', 'Running python code...':'جارٍ تشغيل شيفرة Python...',
  'Searching the web':'جارٍ البحث على الويب', 'No search results found.':'لم يُعثر على نتائج بحث.', 'Crawling completed':'اكتملت قراءة الصفحة',
  'Browser task processing...':'جارٍ تنفيذ مهمة المتصفح...', 'Browser screenshot':'لقطة المتصفح',
  'The browser task has been completed. Below are the steps and results.':'اكتملت مهمة المتصفح. فيما يلي الخطوات والنتائج.',
  'The browser task is running. Below are the steps and results.':'مهمة المتصفح قيد التنفيذ. فيما يلي الخطوات والنتائج.',
  'In progress':'قيد التنفيذ', 'In&nbsp;Progress':'قيد التنفيذ', 'Done':'مكتمل', 'Error':'خطأ', 'Errored':'فشل',
  'Todo':'المهام', 'Todo Item':'مهمة', 'Tool':'أداة', 'Image':'صورة', 'Plot':'رسم بياني',
  'Start playback':'بدء التشغيل', 'Watch again':'المشاهدة مجددًا', 'Skip to results':'الانتقال إلى النتائج',
  'OpenAgent is replaying task...':'يعيد OpenAgent عرض المهمة...', 'OpenAgent replay completed':'اكتملت إعادة عرض المهمة',
  'You are viewing a complete OpenAgent task. Playback will begin automatically in':'أنت تشاهد مهمة مكتملة. سيبدأ العرض تلقائيًا خلال',
  'No detailed content available.':'لا توجد تفاصيل متاحة.', 'Unexpected error':'خطأ غير متوقع',
  'Failed to create document':'تعذّر إنشاء المستند', 'Failed to load document':'تعذّر تحميل المستند',
  'No note blocks found in the document for presentation':'لا توجد ملاحظات قابلة للعرض في المستند',
  'Failed to create snapshot from note':'تعذّر إنشاء لقطة من الملاحظة', '📄 Click to open in side panel':'📄 اضغط للفتح في اللوحة الجانبية', '📄 View PDF':'📄 عرض PDF',
};

export function t(text: string): string {
  return useLanguage.getState().language === 'ar' ? arabic[text] ?? text : text;
}
