export type ImageSrc = number | { uri: string };

export type Salon = { id: string; name: string; city: string };

export type Employee = {
  id: string;
  name: string;
  specialty: string;
  salonId: string;
  points: number;
  initials: string;
};

export type Post = {
  id: string;
  authorId: string;
  image: ImageSrc;
  caption: string;
  category: "hair" | "nails" | "makeup" | "brows" | "skin";
  tags: string[];
  likedBy: string[];
  savedBy: string[];
  comments: { id: string; authorId: string; text: string; at: number }[];
  createdAt: number;
};

export type Lesson = {
  id: string;
  title: string;
  type: "video" | "text" | "checklist" | "test";
  duration: number;
  description: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  cover: ImageSrc;
  level: "Базовый" | "Продвинутый" | "Экспертный";
  category: "Адаптация" | "Сервис" | "Продажи" | "Парикмахерское" | "Маникюр" | "Брови" | "Макияж";
  reward: number;
  lessons: Lesson[];
};

export type Chat = {
  id: string;
  kind: "company" | "salon" | "specialty" | "dm";
  title: string;
  subtitle?: string;
  members: number;
  pinned?: boolean;
};

export type Message = {
  id: string;
  chatId: string;
  authorId: string;
  text: string;
  at: number;
  pinned?: boolean;
};

export type Contest = {
  id: string;
  title: string;
  description: string;
  cover: ImageSrc;
  prize: string;
  reward: number;
  participants: string[];
  endsAt: number;
};

const cover = require("../assets/images/course-cover.png") as ImageSrc;
const hair = require("../assets/images/post-hair.png") as ImageSrc;
const nails = require("../assets/images/post-nails.png") as ImageSrc;
const makeup = require("../assets/images/post-makeup.png") as ImageSrc;

export const SALONS_SEED: Salon[] = [
  { id: "salon_msk", name: "Maison Beauté Москва", city: "Москва · Патриаршие" },
  { id: "salon_spb", name: "Maison Beauté Санкт-Петербург", city: "Санкт-Петербург · Литейный" },
  { id: "salon_sochi", name: "Maison Beauté Сочи", city: "Сочи · Курортный" },
];

export const EMPLOYEES_SEED: Employee[] = [
  { id: "e1", name: "София Орлова", specialty: "Парикмахер-стилист", salonId: "salon_msk", points: 7820, initials: "СО" },
  { id: "e2", name: "Артём Соколов", specialty: "Колорист", salonId: "salon_msk", points: 6210, initials: "АС" },
  { id: "e3", name: "Виктория Лебедева", specialty: "Косметолог-эстетист", salonId: "salon_spb", points: 5430, initials: "ВЛ" },
  { id: "e4", name: "Мария Зайцева", specialty: "Бровист", salonId: "salon_msk", points: 4980, initials: "МЗ" },
  { id: "e5", name: "Никита Громов", specialty: "Барбер", salonId: "salon_sochi", points: 4350, initials: "НГ" },
  { id: "e6", name: "Елена Беляева", specialty: "Мастер маникюра", salonId: "salon_spb", points: 3890, initials: "ЕБ" },
  { id: "e7", name: "Анна Морозова", specialty: "Визажист", salonId: "salon_msk", points: 3110, initials: "АМ" },
  { id: "e8", name: "Кирилл Васильев", specialty: "Парикмахер", salonId: "salon_sochi", points: 2640, initials: "КВ" },
];

const now = Date.now();
const day = 86_400_000;

export const POSTS_SEED: Post[] = [
  {
    id: "p1", authorId: "e1", image: hair, category: "hair",
    caption: "Холодный пепельный блонд с молочной растяжкой. Тонировка через два разных пигмента, чтобы убрать жёлтый и сохранить плотность цвета у корня.",
    tags: ["окрашивание", "блонд", "balayage"],
    likedBy: ["e2", "e4", "e7", "e3"], savedBy: ["e2", "e6"],
    comments: [
      { id: "c1", authorId: "e2", text: "Чисто. Какая база была?", at: now - 2 * 3600_000 },
      { id: "c2", authorId: "e1", text: "Натуральный 6.0, выводила в три захода.", at: now - 1 * 3600_000 },
    ],
    createdAt: now - 1 * day,
  },
  {
    id: "p2", authorId: "e3", image: nails, category: "nails",
    caption: "Молочный камень и тонкая золотая черта на безымянном. Минимум — но звучит.",
    tags: ["маникюр", "nudes"],
    likedBy: ["e1", "e6", "e4"], savedBy: ["e7"],
    comments: [{ id: "c3", authorId: "e6", text: "Эстетика на максимум.", at: now - 4 * 3600_000 }],
    createdAt: now - 1.2 * day,
  },
  {
    id: "p3", authorId: "e7", image: makeup, category: "makeup",
    caption: "Палитра вечера: тёплая бронза, влажная кожа, чёткий контур губ цвета терракоты. Снято до выхода в зал.",
    tags: ["макияж", "вечер"],
    likedBy: ["e1", "e2", "e3", "e4", "e5"], savedBy: ["e1", "e3"],
    comments: [],
    createdAt: now - 1.6 * day,
  },
  {
    id: "p4", authorId: "e2", image: hair, category: "hair",
    caption: "Сложное окрашивание для гостьи с тонкой структурой. Работала на щадящем oxidant 4%, без потери длины.",
    tags: ["окрашивание", "уход"],
    likedBy: ["e1", "e8"], savedBy: ["e1"],
    comments: [],
    createdAt: now - 2 * day,
  },
  {
    id: "p5", authorId: "e6", image: nails, category: "nails",
    caption: "Архитектура ногтя — геометрия, а не вкус. Форма almond, длина средняя, плотный кутикулярный валик.",
    tags: ["маникюр", "almond"],
    likedBy: ["e3", "e4"], savedBy: [],
    comments: [],
    createdAt: now - 2.5 * day,
  },
  {
    id: "p6", authorId: "e4", image: makeup, category: "brows",
    caption: "Архитектура брови по золотому сечению лица. Без воска — только пинцет и моделирующий гель.",
    tags: ["брови", "архитектура"],
    likedBy: ["e1", "e7", "e3", "e6"], savedBy: ["e7"],
    comments: [{ id: "c5", authorId: "e7", text: "Очень чисто посажено.", at: now - 6 * 3600_000 }],
    createdAt: now - 3 * day,
  },
  {
    id: "p7", authorId: "e5", image: hair, category: "hair",
    caption: "Классика для постоянного гостя. Конус, фейд, скос виска — без украшательств.",
    tags: ["барбер", "fade"],
    likedBy: ["e2", "e8"], savedBy: [],
    comments: [],
    createdAt: now - 3.5 * day,
  },
  {
    id: "p8", authorId: "e3", image: makeup, category: "skin",
    caption: "Авторский протокол сияния перед мероприятием: пилинг ферментами, увлажняющая маска, лимфомассаж.",
    tags: ["уход", "сияние"],
    likedBy: ["e1", "e7"], savedBy: ["e7"],
    comments: [],
    createdAt: now - 4 * day,
  },
];

export const COURSES_SEED: Course[] = [
  {
    id: "c_adapt",
    title: "Адаптация в Maison Beauté",
    description: "Путь нового сотрудника: ценности дома, регламенты, первые смены и стандарты сервиса.",
    cover, level: "Базовый", category: "Адаптация", reward: 400,
    lessons: [
      { id: "l1", title: "Видеоприветствие основателя", type: "video", duration: 8, description: "Философия Maison Beauté из первых уст." },
      { id: "l2", title: "Стандарты сервиса", type: "text", duration: 12, description: "Чёткие правила, как мы говорим, двигаемся, обслуживаем." },
      { id: "l3", title: "Чек-лист первой смены", type: "checklist", duration: 10, description: "11 пунктов, которые закрывает каждый новый сотрудник." },
      { id: "l4", title: "Голос бренда", type: "text", duration: 10, description: "Как звучит Maison в чате, в зале и на ресепшн." },
      { id: "l5", title: "Финальный тест адаптации", type: "test", duration: 15, description: "12 вопросов. Можно пересдать дважды." },
    ],
  },
  {
    id: "c_lux",
    title: "Сервис премиум-уровня",
    description: "Ритуалы встречи и сопровождения гостя, без которых дом не дом.",
    cover, level: "Базовый", category: "Сервис", reward: 350,
    lessons: [
      { id: "l1", title: "Встреча гостя за 90 секунд", type: "video", duration: 9, description: "Что говорить, куда смотреть, как держать паузу." },
      { id: "l2", title: "Язык салонного этикета", type: "text", duration: 12, description: "Слова, от которых отказываемся. Слова, которые добавляем." },
      { id: "l3", title: "Чек-лист идеальной услуги", type: "checklist", duration: 8, description: "23 шага от рукопожатия до проводов." },
      { id: "l4", title: "Тест по сервису", type: "test", duration: 12, description: "10 вопросов с разбором." },
    ],
  },
  {
    id: "c_sales",
    title: "Скрипты дополнительных продаж",
    description: "Как предлагать домашний уход и услуги-комплементы, не ломая премиальную интонацию.",
    cover, level: "Продвинутый", category: "Продажи", reward: 500,
    lessons: [
      { id: "l1", title: "Психология up-sell в премиум-сегменте", type: "video", duration: 11, description: "Что чувствует гость, когда вы предлагаете больше." },
      { id: "l2", title: "12 рабочих скриптов", type: "text", duration: 18, description: "Готовые формулировки для зала и кассы." },
      { id: "l3", title: "Возражения: дорого, не сейчас, подумаю", type: "checklist", duration: 10, description: "Сценарии для трёх ключевых отказов." },
      { id: "l4", title: "Тест по продажам", type: "test", duration: 15, description: "Кейсы с реальными гостями." },
    ],
  },
  {
    id: "c_balayage",
    title: "Окрашивание Balayage",
    description: "Авторская техника дома Maison: мягкие переходы, низкий ущерб, высокая себестоимость работы.",
    cover, level: "Экспертный", category: "Парикмахерское", reward: 700,
    lessons: [
      { id: "l1", title: "Теория цвета: пигмент и фон", type: "video", duration: 14, description: "Базовый словарь колориста." },
      { id: "l2", title: "Подбор oxidant под структуру", type: "text", duration: 12, description: "Когда 1.8, когда 6, когда нет." },
      { id: "l3", title: "Техника растяжки на 3 секции", type: "video", duration: 16, description: "Послойная демонстрация на модели." },
      { id: "l4", title: "Тонирование после осветления", type: "text", duration: 10, description: "Холодные и тёплые финиши." },
      { id: "l5", title: "Чек-лист после услуги", type: "checklist", duration: 8, description: "Что проверяем перед сушкой." },
      { id: "l6", title: "Экзамен", type: "test", duration: 20, description: "Кейсы и теория." },
    ],
  },
  {
    id: "c_nails",
    title: "Мастер маникюра: премиум-формы",
    description: "Архитектура ногтя, акцент-дизайн, длительный носимый результат.",
    cover, level: "Продвинутый", category: "Маникюр", reward: 550,
    lessons: [
      { id: "l1", title: "Анатомия ногтевой пластины", type: "text", duration: 10, description: "Что важно для долгого носки." },
      { id: "l2", title: "Формы: almond, ballerina, square", type: "video", duration: 12, description: "Когда какую форму предложить." },
      { id: "l3", title: "Французский nude нового поколения", type: "video", duration: 14, description: "Без чёрной линии и желтизны." },
      { id: "l4", title: "Чек-лист идеального покрытия", type: "checklist", duration: 8, description: "9 точек контроля качества." },
      { id: "l5", title: "Финальный тест", type: "test", duration: 12, description: "Теория + два кейса." },
    ],
  },
  {
    id: "c_brows",
    title: "Архитектура бровей",
    description: "Геометрия лица, моделирование без воска, индивидуальная карта брови.",
    cover, level: "Продвинутый", category: "Брови", reward: 450,
    lessons: [
      { id: "l1", title: "Золотое сечение лица", type: "video", duration: 10, description: "Как читать пропорции." },
      { id: "l2", title: "Карта брови за 6 точек", type: "text", duration: 12, description: "Авторский метод дома." },
      { id: "l3", title: "Моделирование пинцетом", type: "video", duration: 14, description: "Без потери натурального изгиба." },
      { id: "l4", title: "Тест", type: "test", duration: 10, description: "8 вопросов." },
    ],
  },
];

export const CHATS_SEED: Chat[] = [
  { id: "chat_company", kind: "company", title: "Maison Beauté HQ", subtitle: "47 сотрудников", members: 47, pinned: true },
  { id: "chat_msk", kind: "salon", title: "Maison Москва", subtitle: "Команда салона", members: 14 },
  { id: "chat_spb", kind: "salon", title: "Maison Санкт-Петербург", subtitle: "Команда салона", members: 16 },
  { id: "chat_hair", kind: "specialty", title: "Парикмахеры", subtitle: "Закрытый клуб", members: 18 },
  { id: "chat_nails", kind: "specialty", title: "Мастера маникюра", subtitle: "Закрытый клуб", members: 9 },
  { id: "dm_e1", kind: "dm", title: "София Орлова", subtitle: "Парикмахер-стилист", members: 2 },
];

export const MESSAGES_SEED: Record<string, Message[]> = {
  chat_company: [
    { id: "m1", chatId: "chat_company", authorId: "e1", text: "Команда, в субботу — съёмка для нового лукбука. Просим всех мастеров, кто хочет участвовать, отметиться у Анны.", at: now - 6 * 3600_000, pinned: true },
    { id: "m2", chatId: "chat_company", authorId: "e7", text: "Запись по съёмке закрываю в пятницу в 18:00.", at: now - 5 * 3600_000 },
    { id: "m3", chatId: "chat_company", authorId: "e2", text: "Готов. Записал двух гостей под фото.", at: now - 4 * 3600_000 },
    { id: "m4", chatId: "chat_company", authorId: "e4", text: "С нашей стороны — три модели по бровям.", at: now - 2 * 3600_000 },
  ],
  chat_msk: [
    { id: "m5", chatId: "chat_msk", authorId: "e1", text: "Утренний бриф в 9:30 — стандартно.", at: now - 8 * 3600_000 },
    { id: "m6", chatId: "chat_msk", authorId: "e2", text: "Записан полный день, гость 12:00 — VIP, под рекомендацию основателя.", at: now - 7 * 3600_000 },
    { id: "m7", chatId: "chat_msk", authorId: "e4", text: "Поняла, согласую сервис лично.", at: now - 6 * 3600_000 },
  ],
  chat_spb: [
    { id: "m8", chatId: "chat_spb", authorId: "e3", text: "Закрываю смену пораньше, остаются Лена и Мария.", at: now - 9 * 3600_000 },
    { id: "m9", chatId: "chat_spb", authorId: "e6", text: "Принято.", at: now - 8 * 3600_000 },
  ],
  chat_hair: [
    { id: "m10", chatId: "chat_hair", authorId: "e1", text: "Поделитесь, кто работает на новом oxidant 1.8 — впечатления?", at: now - 12 * 3600_000 },
    { id: "m11", chatId: "chat_hair", authorId: "e2", text: "На тонкой структуре идеально, на жёстких волосах добавляю время.", at: now - 11 * 3600_000 },
    { id: "m12", chatId: "chat_hair", authorId: "e8", text: "Только начал тестить, к выходным напишу разбор.", at: now - 10 * 3600_000 },
  ],
  chat_nails: [
    { id: "m13", chatId: "chat_nails", authorId: "e6", text: "Закупка пилок — последний день сегодня. Кому нужно — скиньте список.", at: now - 14 * 3600_000 },
    { id: "m14", chatId: "chat_nails", authorId: "e3", text: "Пять штук на 180 грит, спасибо.", at: now - 13 * 3600_000 },
  ],
  dm_e1: [
    { id: "m15", chatId: "dm_e1", authorId: "e1", text: "Привет! Видела вашу публикацию по балаяжу — какая база была?", at: now - 18 * 3600_000 },
    { id: "m16", chatId: "dm_e1", authorId: "u_self", text: "Привет! 6.0 натуральный, выводила в три захода.", at: now - 17 * 3600_000 },
    { id: "m17", chatId: "dm_e1", authorId: "e1", text: "Спасибо! В пятницу буду работать рядом — заходите на кофе.", at: now - 1 * 3600_000 },
  ],
};

export const CONTESTS_SEED: Contest[] = [
  {
    id: "ct_week",
    title: "Лучшая работа недели",
    description: "Опубликуйте свою лучшую работу с тегом #неделя. Победителя выбирает совет мастеров и руководитель направления.",
    cover: hair, prize: "30 000 ₽ + бонусный день к отпуску",
    reward: 500,
    participants: ["e1", "e3", "e7"],
    endsAt: now + 3 * day,
  },
  {
    id: "ct_month",
    title: "Топ-мастер месяца",
    description: "Учитывается выручка, рейтинг от гостей, активность в обучении и публикациях.",
    cover: makeup, prize: "Поездка на неделю в Париж — Maison отправляет за свой счёт",
    reward: 1500,
    participants: ["e1", "e2", "e4", "e5"],
    endsAt: now + 18 * day,
  },
  {
    id: "ct_adapt",
    title: "Адаптация без слабых мест",
    description: "Для сотрудников первого года — пройти все курсы адаптации и набрать максимум по сервису.",
    cover, prize: "AirPods Pro + наставничество от Софии Орловой",
    reward: 800,
    participants: ["e8", "e7"],
    endsAt: now + 10 * day,
  },
];
