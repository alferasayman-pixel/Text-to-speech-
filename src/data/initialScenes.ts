import { SceneData, VoiceoverConfig } from '../types/voiceover';

export const DEFAULT_VOICEOVER_CONFIG: VoiceoverConfig = {
  personaId: 'VOICE_ABU_MOHAMMED_01',
  personaName: 'أبو محمد (مستشار وميسر الخدمات الإلكترونية)',
  voiceName: 'Charon',
  vocalAge: '35–45 سنة',
  tone: 'باريتون دافئ، واثق، مهني، هادئ، متعاطف، وواضح تجارياً',
  dialect: 'لهجة بيضاء خليجية خفيفة واضحة ومفهومة لعموم اليمنيين',
  sampleRate: 48000,
  targetLoudnessLUFS: -16,
  truePeakLimitDb: -1.0,
  totalDuration: 120.0,
  whatsappNumber: '0552910447',
  whatsappFormatted: '+966 55 291 0447',
};

export const INITIAL_SCENES: SceneData[] = [
  {
    id: 1,
    sceneNumber: 1,
    startTime: 0.0,
    endTime: 15.0,
    targetDuration: 15.0,
    targetWords: 13,
    spokenText: 'أنت مشغول وما عندك وقت؟ وضعك غير نظامي؟ عندك بلاغ تغيب أو هروب؟',
    visualTitle: 'المشهد الأول: تشخيص المعاناة وضيق الوقت',
    visualCue: 'لقطة 4K مقربة لشخص حائر أمام هاتفه ووثائقه، إشارة استفهام وبطاقة إقامة',
    visualCardType: 'identity',
    preBreakMs: 1000,
    postBreakMs: 4500,
    ssmlSnippet: `<break time="1000ms"/>
أنت مشغول وما عندك وقت؟
<break time="600ms"/>
وضعك غير نظامي؟
<break time="600ms"/>
عندك بلاغ تغيب أو هروب؟
<break time="4500ms"/>`,
    status: 'idle',
  },
  {
    id: 2,
    sceneNumber: 2,
    startTime: 15.0,
    endTime: 30.0,
    targetDuration: 15.0,
    targetWords: 13,
    spokenText: 'أو محتار في المنصات الإلكترونية؟ الإجراءات كثيرة، وكل خطوة تحتاج فهمًا وترتيبًا دقيقًا.',
    visualTitle: 'المشهد الثاني: تشعب المنصات والأنظمة',
    visualCue: 'شاشات متداخلة لبوابات الخدمات الرقمية وقوائم الشروط والتعليمات',
    visualCardType: 'platforms',
    preBreakMs: 1000,
    postBreakMs: 4500,
    ssmlSnippet: `<break time="1000ms"/>
أو محتار في المنصات الإلكترونية؟
<break time="700ms"/>
الإجراءات كثيرة، وكل خطوة تحتاج فهمًا وترتيبًا دقيقًا.
<break time="4500ms"/>`,
    status: 'idle',
  },
  {
    id: 3,
    sceneNumber: 3,
    startTime: 30.0,
    endTime: 45.0,
    targetDuration: 15.0,
    targetWords: 13,
    spokenText: 'خبر يهم اليمنيين بالمملكة: أُعلن بدء التسجيل الإلكتروني لتصحيح الأوضاع وفق الإجراءات المعلنة.',
    visualTitle: 'المشهد الثالث: إعلان فرصة تصحيح الأوضاع (هام)',
    visualCue: 'ظهور شريط الخبر الرسمي: بدء التسجيل لتصحيح أوضاع الأشقاء اليمنيين',
    visualCardType: 'news',
    preBreakMs: 1000,
    postBreakMs: 4500,
    ssmlSnippet: `<break time="1000ms"/>
خبر يهم اليمنيين بالمملكة:
<break time="800ms"/>
أُعلن بدء التسجيل الإلكتروني لتصحيح الأوضاع وفق الإجراءات المعلنة.
<break time="4500ms"/>`,
    status: 'idle',
  },
  {
    id: 4,
    sceneNumber: 4,
    startTime: 45.0,
    endTime: 60.0,
    targetDuration: 15.0,
    targetWords: 13,
    spokenText: 'لكن لكل حالة متطلباتها الخاصة؛ تحقق من أهليتك، واعرف الخطوات والمستندات المطلوبة أولًا.',
    visualTitle: 'المشهد الرابع: دراسة أهلية الحالة وشروطها',
    visualCue: 'مصفوفة معايير الأهلية والشروط ومطابقة فئات المستفيدين',
    visualCardType: 'requirements',
    preBreakMs: 1000,
    postBreakMs: 4500,
    ssmlSnippet: `<break time="1000ms"/>
لكن لكل حالة متطلباتها الخاصة؛
<break time="700ms"/>
تحقق من أهليتك، واعرف الخطوات والمستندات المطلوبة أولًا.
<break time="4500ms"/>`,
    status: 'idle',
  },
  {
    id: 5,
    sceneNumber: 5,
    startTime: 60.0,
    endTime: 75.0,
    targetDuration: 15.0,
    targetWords: 13,
    spokenText: 'من الوثائق إلى المواعيد، التفاصيل مهمة. رتّب أوراقك واستعد للخطوة التالية بثقة ووضوح.',
    visualTitle: 'المشهد الخامس: تدقيق الوثائق وحجز المواعيد',
    visualCue: 'استعراض النماذج الرسمية وتجميع المستندات وترتيبها في ملف منظم',
    visualCardType: 'documents',
    preBreakMs: 1000,
    postBreakMs: 4500,
    ssmlSnippet: `<break time="1000ms"/>
من الوثائق إلى المواعيد، التفاصيل مهمة.
<break time="700ms"/>
رتّب أوراقك واستعد للخطوة التالية بثقة ووضوح.
<break time="4500ms"/>`,
    status: 'idle',
  },
  {
    id: 6,
    sceneNumber: 6,
    startTime: 75.0,
    endTime: 90.0,
    targetDuration: 15.0,
    targetWords: 13,
    spokenText: 'أبو محمد للخدمات الإلكترونية يساعدك في التسجيل، وفهم المتطلبات، والمساعدة بمواعيد منصة أبشر.',
    visualTitle: 'المشهد السادس: الحل والمساندة مع أبو محمد',
    visualCue: 'شعار "أبو محمد للخدمات الإلكترونية" مع تكامل بوابة أبشر الرقمية',
    visualCardType: 'abshar',
    preBreakMs: 1000,
    postBreakMs: 4500,
    ssmlSnippet: `<break time="1000ms"/>
أبو محمد للخدمات الإلكترونية
<break time="600ms"/>
يساعدك في التسجيل، وفهم المتطلبات، والمساعدة بمواعيد منصة أبشر.
<break time="4500ms"/>`,
    status: 'idle',
  },
  {
    id: 7,
    sceneNumber: 7,
    startTime: 90.0,
    endTime: 105.0,
    targetDuration: 15.0,
    targetWords: 13,
    spokenText: 'ونساعدك في تجهيز المستندات ومتابعة الإجراءات؛ خدمة مساندة واضحة، وخطوات منظمة ومناسبة لحالتك.',
    visualTitle: 'المشهد السابع: تجهيز المعاملات والمتابعة المستمرة',
    visualCue: 'متابعة خطوة بخطوة، علامات تدقيق خضراء وانسيابية المعاملة الإدارية',
    visualCardType: 'support',
    preBreakMs: 1000,
    postBreakMs: 4500,
    ssmlSnippet: `<break time="1000ms"/>
ونساعدك في تجهيز المستندات ومتابعة الإجراءات؛
<break time="700ms"/>
خدمة مساندة واضحة، وخطوات منظمة ومناسبة لحالتك.
<break time="4500ms"/>`,
    status: 'idle',
  },
  {
    id: 8,
    sceneNumber: 8,
    startTime: 105.0,
    endTime: 120.0,
    targetDuration: 15.0,
    targetWords: 14,
    spokenText: 'ومن خدماتنا المساعدة بإجراءات الوثيقة المؤقتة. شاهد الإرشادات، وراسل أبو محمد عبر واتساب الآن.',
    visualTitle: 'المشهد الثامن: الوثيقة المؤقتة والتواصل المباشر',
    visualCue: 'ورقة الإرشادات الحكومية ورقم الواتساب الرسمي البارز: 0552910447',
    visualCardType: 'whatsapp',
    preBreakMs: 1000,
    postBreakMs: 2000,
    ssmlSnippet: `<break time="1000ms"/>
ومن خدماتنا المساعدة بإجراءات الوثيقة المؤقتة.
<break time="2500ms"/>
شاهد الإرشادات، وراسل أبو محمد عبر واتساب الآن.
<break time="2000ms"/>`,
    status: 'idle',
  },
];

export const FULL_SSML_DOCUMENT = `<speak>
  <!-- المشهد 01: [00:00 - 00:15] | 13 كلمة -->
  <break time="1000ms"/>
  أنت مشغول وما عندك وقت؟
  <break time="600ms"/>
  وضعك غير نظامي؟
  <break time="600ms"/>
  عندك بلاغ تغيب أو هروب؟
  <break time="4500ms"/>

  <!-- المشهد 02: [00:15 - 00:30] | 13 كلمة -->
  <break time="1000ms"/>
  أو محتار في المنصات الإلكترونية؟
  <break time="700ms"/>
  الإجراءات كثيرة، وكل خطوة تحتاج فهمًا وترتيبًا دقيقًا.
  <break time="4500ms"/>

  <!-- المشهد 03: [00:30 - 00:45] | 13 كلمة (متزامن مع ظهور صورة الخبر) -->
  <break time="1000ms"/>
  خبر يهم اليمنيين بالمملكة:
  <break time="800ms"/>
  أُعلن بدء التسجيل الإلكتروني لتصحيح الأوضاع وفق الإجراءات المعلنة.
  <break time="4500ms"/>

  <!-- المشهد 04: [00:45 - 01:00] | 13 كلمة -->
  <break time="1000ms"/>
  لكن لكل حالة متطلباتها الخاصة؛
  <break time="700ms"/>
  تحقق من أهليتك، واعرف الخطوات والمستندات المطلوبة أولًا.
  <break time="4500ms"/>

  <!-- المشهد 05: [01:00 - 01:15] | 13 كلمة (متزامن مع استعراض النماذج) -->
  <break time="1000ms"/>
  من الوثائق إلى المواعيد، التفاصيل مهمة.
  <break time="700ms"/>
  رتّب أوراقك واستعد للخطوة التالية بثقة ووضوح.
  <break time="4500ms"/>

  <!-- المشهد 06: [01:15 - 01:30] | 13 كلمة -->
  <break time="1000ms"/>
  أبو محمد للخدمات الإلكترونية
  <break time="600ms"/>
  يساعدك في التسجيل، وفهم المتطلبات، والمساعدة بمواعيد منصة أبشر.
  <break time="4500ms"/>

  <!-- المشهد 07: [01:30 - 01:45] | 13 كلمة -->
  <break time="1000ms"/>
  ونساعدك في تجهيز المستندات ومتابعة الإجراءات؛
  <break time="700ms"/>
  خدمة مساندة واضحة، وخطوات منظمة ومناسبة لحالتك.
  <break time="4500ms"/>

  <!-- المشهد 08: [01:45 - 02:00] | 14 كلمة (متزامن مع ورقة الإرشادات ورقم الواتساب) -->
  <break time="1000ms"/>
  ومن خدماتنا المساعدة بإجراءات الوثيقة المؤقتة.
  <break time="2500ms"/>
  شاهد الإرشادات، وراسل أبو محمد عبر واتساب الآن.
  <break time="2000ms"/>
</speak>`;
