import { REMOTE, uri } from "./images";

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
  video?: ImageSrc;
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
  category:
    | "Адаптация"
    | "Сервис"
    | "Продажи"
    | "Парикмахерское"
    | "Маникюр"
    | "Брови"
    | "Макияж"
    | "Уход"
    | "Менеджмент";
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

export type Trend = { tag: string; posts: number; growth: number };

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: number;
  threshold: number;
};

export const SALONS_SEED: Salon[] = [
  { id: "salon_msk", name: "APIA Москва · Патриаршие", city: "Москва · Патриаршие пруды" },
  { id: "salon_msk2", name: "APIA Москва · Третьяковская", city: "Москва · Лаврушинский 8" },
  { id: "salon_spb", name: "APIA Санкт-Петербург", city: "Санкт-Петербург · Литейный 26" },
  { id: "salon_sochi", name: "APIA Сочи", city: "Сочи · Курортный 87" },
  { id: "salon_kzn", name: "APIA Казань", city: "Казань · Кремлёвская 12" },
  { id: "salon_dxb", name: "APIA Dubai Marina", city: "Дубай · Marina Walk" },
];

export const EMPLOYEES_SEED: Employee[] = [
  { id: "e1", name: "София Орлова", specialty: "Парикмахер-стилист", salonId: "salon_msk", points: 9820, initials: "СО" },
  { id: "e2", name: "Артём Соколов", specialty: "Колорист", salonId: "salon_msk", points: 8210, initials: "АС" },
  { id: "e3", name: "Виктория Лебедева", specialty: "Косметолог-эстетист", salonId: "salon_spb", points: 7430, initials: "ВЛ" },
  { id: "e4", name: "Мария Зайцева", specialty: "Бровист", salonId: "salon_msk", points: 6980, initials: "МЗ" },
  { id: "e5", name: "Никита Громов", specialty: "Барбер", salonId: "salon_sochi", points: 6350, initials: "НГ" },
  { id: "e6", name: "Елена Беляева", specialty: "Мастер маникюра", salonId: "salon_spb", points: 5890, initials: "ЕБ" },
  { id: "e7", name: "Анна Морозова", specialty: "Визажист", salonId: "salon_msk", points: 5110, initials: "АМ" },
  { id: "e8", name: "Кирилл Васильев", specialty: "Парикмахер", salonId: "salon_sochi", points: 4640, initials: "КВ" },
  { id: "e9", name: "Полина Гордеева", specialty: "Топ-стилист", salonId: "salon_msk2", points: 8870, initials: "ПГ" },
  { id: "e10", name: "Дмитрий Карпов", specialty: "Колорист", salonId: "salon_msk2", points: 6120, initials: "ДК" },
  { id: "e11", name: "Лиза Соловьёва", specialty: "Бровист", salonId: "salon_kzn", points: 5450, initials: "ЛС" },
  { id: "e12", name: "Глеб Мартынов", specialty: "Барбер-парикмахер", salonId: "salon_msk", points: 4380, initials: "ГМ" },
  { id: "e13", name: "Ксения Войтенко", specialty: "Косметолог", salonId: "salon_dxb", points: 7780, initials: "КВ" },
  { id: "e14", name: "Ева Романова", specialty: "Мастер маникюра", salonId: "salon_msk2", points: 6610, initials: "ЕР" },
  { id: "e15", name: "Алексей Тихомиров", specialty: "Тренинг-менеджер", salonId: "salon_msk", points: 9100, initials: "АТ" },
  { id: "e16", name: "Маргарита Ким", specialty: "Визажист-преподаватель", salonId: "salon_spb", points: 7250, initials: "МК" },
  { id: "e17", name: "Тимур Бек", specialty: "Топ-барбер", salonId: "salon_dxb", points: 8430, initials: "ТБ" },
  { id: "e18", name: "Алина Журавлёва", specialty: "Колорист", salonId: "salon_kzn", points: 4960, initials: "АЖ" },
  { id: "e19", name: "Олег Снегирёв", specialty: "Парикмахер-стилист", salonId: "salon_spb", points: 5340, initials: "ОС" },
  { id: "e20", name: "Дарья Серебрякова", specialty: "Топ-визажист", salonId: "salon_msk", points: 8990, initials: "ДС" },
  { id: "e21", name: "Виталий Орлов", specialty: "Колорист", salonId: "salon_sochi", points: 4080, initials: "ВО" },
  { id: "e22", name: "Юлия Носова", specialty: "Эстетист", salonId: "salon_msk2", points: 6720, initials: "ЮН" },
];

const userPhoto = require("../assets/images/user_post1.png");
const userVideo = require("../assets/videos/user_post1.mov");

const now = Date.now();
const day = 86_400_000;
const h = 3600_000;

export const POSTS_SEED: Post[] = [
  {
    id: "p_video",
    authorId: "u_self",
    image: userPhoto,
    video: userVideo,
    category: "hair",
    caption: "За работой — короткое видео из зала. Рабочий процесс, без постановки. Именно так выглядят наши будни в APIA.",
    tags: ["бэкстейдж", "APIA", "зал"],
    likedBy: ["e1", "e2", "e4", "e9", "e15"],
    savedBy: ["e1", "e9"],
    comments: [
      { id: "cv1", authorId: "e1", text: "Видео огонь! Атмосфера передана идеально.", at: now - 30 * 60_000 },
      { id: "cv2", authorId: "e15", text: "Отличный формат — больше таких!", at: now - 15 * 60_000 },
    ],
    createdAt: now - 40 * 60_000,
  },
  {
    id: "p_photo",
    authorId: "u_self",
    image: userPhoto,
    category: "hair",
    caption: "После смены — прогулка по кварталу. Иногда важно выйти из зала и просто побыть в городе. Перезагрузка, которая возвращает вдохновение.",
    tags: ["команда", "вдохновение"],
    likedBy: ["e1", "e3", "e7", "e9", "e20"],
    savedBy: ["e7"],
    comments: [
      { id: "cp1", authorId: "e7", text: "Вот это взгляд мастера 😎", at: now - 2 * h },
      { id: "cp2", authorId: "e9", text: "Классный кадр!", at: now - 1 * h },
    ],
    createdAt: now - 3 * h,
  },
  {
    id: "p1", authorId: "e1", image: uri(REMOTE.hair[0]), category: "hair",
    caption: "Холодный пепельный блонд с молочной растяжкой. Тонировка через два разных пигмента — чтобы убрать жёлтый и сохранить плотность цвета у корня.",
    tags: ["окрашивание", "блонд", "balayage"],
    likedBy: ["e2", "e4", "e7", "e3", "e9", "e15", "e20"], savedBy: ["e2", "e6", "e10"],
    comments: [
      { id: "c1", authorId: "e2", text: "Чисто. Какая база была?", at: now - 2 * h },
      { id: "c2", authorId: "e1", text: "Натуральный 6.0, выводила в три захода.", at: now - 1 * h },
      { id: "c1b", authorId: "e9", text: "Чистейший холод. Что использовала на тонировку?", at: now - 30 * 60_000 },
    ],
    createdAt: now - 1 * day,
  },
  {
    id: "p2", authorId: "e3", image: uri(REMOTE.nails[0]), category: "nails",
    caption: "Молочный камень и тонкая золотая черта на безымянном. Минимум — но звучит.",
    tags: ["маникюр", "nudes", "минимализм"],
    likedBy: ["e1", "e6", "e4", "e14", "e11"], savedBy: ["e7", "e14"],
    comments: [{ id: "c3", authorId: "e6", text: "Эстетика на максимум. Лак?", at: now - 4 * h }],
    createdAt: now - 1.2 * day,
  },
  {
    id: "p3", authorId: "e7", image: uri(REMOTE.makeup[2]), category: "makeup",
    caption: "Палитра вечера: тёплая бронза, влажная кожа, чёткий контур губ цвета терракоты. Снято до выхода в зал.",
    tags: ["макияж", "вечер", "глоу"],
    likedBy: ["e1", "e2", "e3", "e4", "e5", "e16", "e20"], savedBy: ["e1", "e3"],
    comments: [
      { id: "c3a", authorId: "e16", text: "Контур губ — мечта.", at: now - 5 * h },
    ],
    createdAt: now - 1.6 * day,
  },
  {
    id: "p4", authorId: "e2", image: uri(REMOTE.hair[2]), category: "hair",
    caption: "Сложное окрашивание для гостьи с тонкой структурой. Работала на щадящем oxidant 4%, без потери длины.",
    tags: ["окрашивание", "уход", "lowlights"],
    likedBy: ["e1", "e8", "e10", "e21"], savedBy: ["e1"],
    comments: [],
    createdAt: now - 2 * day,
  },
  {
    id: "p5", authorId: "e6", image: uri(REMOTE.nails[2]), category: "nails",
    caption: "Архитектура ногтя — геометрия, а не вкус. Форма almond, длина средняя, плотный кутикулярный валик.",
    tags: ["маникюр", "almond", "архитектура"],
    likedBy: ["e3", "e4", "e14"], savedBy: [],
    comments: [],
    createdAt: now - 2.5 * day,
  },
  {
    id: "p6", authorId: "e4", image: uri(REMOTE.brows[0]), category: "brows",
    caption: "Архитектура брови по золотому сечению лица. Без воска — только пинцет и моделирующий гель.",
    tags: ["брови", "архитектура"],
    likedBy: ["e1", "e7", "e3", "e6", "e11", "e16"], savedBy: ["e7"],
    comments: [{ id: "c5", authorId: "e7", text: "Очень чисто посажено.", at: now - 6 * h }],
    createdAt: now - 3 * day,
  },
  {
    id: "p7", authorId: "e5", image: uri(REMOTE.barber[0]), category: "hair",
    caption: "Классика для постоянного гостя. Конус, фейд, скос виска — без украшательств.",
    tags: ["барбер", "fade", "classic"],
    likedBy: ["e2", "e8", "e12", "e17"], savedBy: [],
    comments: [],
    createdAt: now - 3.5 * day,
  },
  {
    id: "p8", authorId: "e3", image: uri(REMOTE.skin[0]), category: "skin",
    caption: "Авторский протокол сияния перед мероприятием: пилинг ферментами, увлажняющая маска, лимфомассаж.",
    tags: ["уход", "сияние", "протокол"],
    likedBy: ["e1", "e7", "e13", "e22"], savedBy: ["e7"],
    comments: [],
    createdAt: now - 4 * day,
  },
  {
    id: "p9", authorId: "e9", image: uri(REMOTE.hair[3]), category: "hair",
    caption: "Короткое каре для редактора моды. Тупой срез, лёгкая текстура, мокрый финиш.",
    tags: ["каре", "стрижка", "трендсеттер"],
    likedBy: ["e1", "e2", "e15", "e20", "e16"], savedBy: ["e15"],
    comments: [
      { id: "c9", authorId: "e15", text: "Чистая работа. На зал такой формат заходит идеально.", at: now - 7 * h },
    ],
    createdAt: now - 4.2 * day,
  },
  {
    id: "p10", authorId: "e10", image: uri(REMOTE.hair[5]), category: "hair",
    caption: "Двойной балаяж с мягкими бликами на тёмном базисе. Корень намеренно сохранён — растёт незаметно.",
    tags: ["balayage", "lowmaintenance"],
    likedBy: ["e1", "e2", "e9", "e21"], savedBy: ["e2"],
    comments: [],
    createdAt: now - 4.4 * day,
  },
  {
    id: "p11", authorId: "e11", image: uri(REMOTE.brows[2]), category: "brows",
    caption: "Долговременная укладка бровей: натуральный изгиб, без пышного блеска. Гость хотел эффект «своих, но в порядке».",
    tags: ["брови", "укладка"],
    likedBy: ["e4", "e7", "e16"], savedBy: ["e4"],
    comments: [],
    createdAt: now - 5 * day,
  },
  {
    id: "p12", authorId: "e13", image: uri(REMOTE.skin[1]), category: "skin",
    caption: "Дубайский протокол перед свадьбой: курс из 4 процедур, мягкие пилинги, инъекционная гидратация.",
    tags: ["косметология", "свадьба", "Dubai"],
    likedBy: ["e3", "e7", "e17", "e20"], savedBy: ["e3", "e17"],
    comments: [{ id: "c12", authorId: "e17", text: "Чистая красота. Гостья счастлива?", at: now - 8 * h }],
    createdAt: now - 5.5 * day,
  },
  {
    id: "p13", authorId: "e14", image: uri(REMOTE.nails[1]), category: "nails",
    caption: "Французский маникюр нового поколения — без чёрной линии, мягкая молочная подложка, прозрачный финиш.",
    tags: ["french", "маникюр"],
    likedBy: ["e3", "e6", "e11"], savedBy: ["e6"],
    comments: [],
    createdAt: now - 6 * day,
  },
  {
    id: "p14", authorId: "e15", image: uri(REMOTE.interior[1]), category: "skin",
    caption: "Открыли новый кабинет для процедур в Москве на Третьяковской. Бронь — через старшего администратора.",
    tags: ["команда", "новости", "APIA"],
    likedBy: ["e1", "e2", "e3", "e4", "e7", "e9", "e10", "e16", "e20"], savedBy: ["e1", "e9"],
    comments: [
      { id: "c14a", authorId: "e9", text: "Жду первого гостя!", at: now - 10 * h },
      { id: "c14b", authorId: "e22", text: "Кабинет — мечта.", at: now - 9 * h },
    ],
    createdAt: now - 6.2 * day,
  },
  {
    id: "p15", authorId: "e16", image: uri(REMOTE.makeup[3]), category: "makeup",
    caption: "Бэкстейдж со съёмки лукбука. Ставила свет на лицо моделей: тёплая бронза + холодный хайлайтер.",
    tags: ["бэкстейдж", "лукбук"],
    likedBy: ["e1", "e7", "e20", "e3"], savedBy: ["e7"],
    comments: [],
    createdAt: now - 7 * day,
  },
  {
    id: "p16", authorId: "e17", image: uri(REMOTE.barber[2]), category: "hair",
    caption: "Тейпер с переходом в текстуру наверху. Фактура вытянута на горячую укладку. Мужской зал — премиум-формат.",
    tags: ["barber", "fade", "Dubai"],
    likedBy: ["e5", "e8", "e12"], savedBy: [],
    comments: [],
    createdAt: now - 7.4 * day,
  },
  {
    id: "p17", authorId: "e20", image: uri(REMOTE.makeup[4]), category: "makeup",
    caption: "Свадебный макияж в формате no-makeup: полупрозрачное покрытие, нюдовые губы, акцент на ресницы.",
    tags: ["nomakeup", "свадьба"],
    likedBy: ["e1", "e7", "e16", "e22"], savedBy: ["e7", "e16"],
    comments: [{ id: "c17", authorId: "e22", text: "Очень нежно. Тон какой использовали?", at: now - 11 * h }],
    createdAt: now - 7.8 * day,
  },
  {
    id: "p18", authorId: "e22", image: uri(REMOTE.skin[2]), category: "skin",
    caption: "Лимфодренажный массаж лица. 30 минут — и контур лица становится отчётливым.",
    tags: ["массаж", "контур"],
    likedBy: ["e3", "e13"], savedBy: [],
    comments: [],
    createdAt: now - 8.2 * day,
  },
  {
    id: "p19", authorId: "e8", image: uri(REMOTE.hair[1]), category: "hair",
    caption: "Тёплый карамельный балаяж на длине. Холодный финиш — через тонировку 9.13 на пять минут.",
    tags: ["карамель", "balayage"],
    likedBy: ["e1", "e10", "e21"], savedBy: ["e21"],
    comments: [],
    createdAt: now - 9 * day,
  },
  {
    id: "p20", authorId: "e12", image: uri(REMOTE.barber[1]), category: "hair",
    caption: "Барбер-сессия для постоянника. Чистый мид-фейд с дизайнерским пробором. Вижу гостя раз в три недели.",
    tags: ["barber", "midfade"],
    likedBy: ["e5", "e17"], savedBy: [],
    comments: [],
    createdAt: now - 9.5 * day,
  },
  {
    id: "p21", authorId: "e18", image: uri(REMOTE.hair[6]), category: "hair",
    caption: "Air touch на каштановой базе. Лёгкий световой акцент по контуру лица. Минимальный ущерб.",
    tags: ["airtouch", "натурально"],
    likedBy: ["e2", "e10"], savedBy: [],
    comments: [],
    createdAt: now - 10 * day,
  },
  {
    id: "p22", authorId: "e19", image: uri(REMOTE.hair[4]), category: "hair",
    caption: "Мужская стрижка-каре. Длинный верх, текстура на пальцах, минимум продукта в укладке.",
    tags: ["мужскоекаре", "стрижка"],
    likedBy: ["e5", "e8", "e17"], savedBy: [],
    comments: [],
    createdAt: now - 10.5 * day,
  },
  {
    id: "p23", authorId: "e7", image: uri(REMOTE.makeup[5]), category: "makeup",
    caption: "Макияж под красную дорожку: бронзовая база, графитовая стрелка, бордовая помада с финишем сатин.",
    tags: ["redcarpet", "вечер"],
    likedBy: ["e1", "e20", "e16"], savedBy: ["e1", "e20"],
    comments: [],
    createdAt: now - 11 * day,
  },
  {
    id: "p24", authorId: "e6", image: uri(REMOTE.nails[1]), category: "nails",
    caption: "Длинная балерина с тонким золотым акцентом. На носке — три недели чистый блеск.",
    tags: ["балерина", "gold"],
    likedBy: ["e14", "e3"], savedBy: ["e14"],
    comments: [],
    createdAt: now - 11.5 * day,
  },
  {
    id: "p25", authorId: "e4", image: uri(REMOTE.brows[1]), category: "brows",
    caption: "Натуральный домик-изгиб для квадратного типа лица. Никакой агрессии — только лёгкая коррекция.",
    tags: ["брови", "форма"],
    likedBy: ["e7", "e16"], savedBy: [],
    comments: [],
    createdAt: now - 12 * day,
  },
  {
    id: "p26", authorId: "e1", image: uri(REMOTE.hair[5]), category: "hair",
    caption: "Свадебная укладка: голливудские локоны на тёплой меди. Финиш — лак средней фиксации, чтобы локон жил.",
    tags: ["свадьба", "локоны"],
    likedBy: ["e7", "e9", "e16", "e20"], savedBy: ["e7", "e9"],
    comments: [{ id: "c26", authorId: "e7", text: "Прическа — поэма. Локон лежит идеально.", at: now - 12 * h }],
    createdAt: now - 12.5 * day,
  },
  {
    id: "p27", authorId: "e16", image: uri(REMOTE.makeup[1]), category: "makeup",
    caption: "Макияж для редакционной съёмки в журнал. Контур, скульптура, влажный блик. Сделано за 25 минут.",
    tags: ["editorial", "shooting"],
    likedBy: ["e1", "e7", "e20"], savedBy: ["e20"],
    comments: [],
    createdAt: now - 13 * day,
  },
  {
    id: "p28", authorId: "e13", image: uri(REMOTE.skin[1]), category: "skin",
    caption: "Карбокситерапия для тонкой кожи вокруг глаз. Мягкий, без боли, заметный эффект уже после первой процедуры.",
    tags: ["косметология", "anti-age"],
    likedBy: ["e3", "e22"], savedBy: ["e3"],
    comments: [],
    createdAt: now - 13.5 * day,
  },
  {
    id: "p29", authorId: "e2", image: uri(REMOTE.hair[2]), category: "hair",
    caption: "Восстановление кератина после агрессивного окрашивания. Курс из трёх процедур, домашний уход параллельно.",
    tags: ["восстановление", "кератин"],
    likedBy: ["e1", "e10"], savedBy: ["e1"],
    comments: [],
    createdAt: now - 14 * day,
  },
  {
    id: "p30", authorId: "e15", image: uri(REMOTE.interior[2]), category: "skin",
    caption: "В пятницу запускаем APIA Academy — закрытая программа развития топ-мастеров. Подать заявку можно в личном профиле.",
    tags: ["academy", "обучение", "APIA"],
    likedBy: ["e1", "e2", "e3", "e4", "e7", "e9", "e16", "e17", "e20", "e22"], savedBy: ["e1", "e9", "e17"],
    comments: [
      { id: "c30a", authorId: "e9", text: "Подаю первой.", at: now - 14 * h },
      { id: "c30b", authorId: "e17", text: "Из Дубая тоже можно?", at: now - 13 * h },
      { id: "c30c", authorId: "e15", text: "Можно. Все регионы.", at: now - 12 * h },
    ],
    createdAt: now - 14.5 * day,
  },
];

export const COURSES_SEED: Course[] = [
  {
    id: "c_adapt",
    title: "Адаптация в APIA",
    description: "Путь нового мастера: ценности экосистемы, регламенты, первые смены и стандарты сервиса.",
    cover: uri(REMOTE.interior[0]), level: "Базовый", category: "Адаптация", reward: 400,
    lessons: [
      { id: "l1", title: "Видеоприветствие основателя", type: "video", duration: 8, description: "Философия APIA из первых уст." },
      { id: "l2", title: "Стандарты сервиса", type: "text", duration: 12, description: "Чёткие правила, как мы говорим, двигаемся, обслуживаем." },
      { id: "l3", title: "Чек-лист первой смены", type: "checklist", duration: 10, description: "11 пунктов, которые закрывает каждый новый мастер." },
      { id: "l4", title: "Голос бренда", type: "text", duration: 10, description: "Как звучит APIA в чате, в зале и на ресепшн." },
      { id: "l5", title: "Финальный тест адаптации", type: "test", duration: 15, description: "12 вопросов. Можно пересдать дважды." },
    ],
  },
  {
    id: "c_lux",
    title: "Сервис премиум-уровня",
    description: "Ритуалы встречи и сопровождения гостя, без которых APIA — не APIA.",
    cover: uri(REMOTE.interior[1]), level: "Базовый", category: "Сервис", reward: 350,
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
    cover: uri(REMOTE.interior[2]), level: "Продвинутый", category: "Продажи", reward: 500,
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
    description: "Авторская техника APIA: мягкие переходы, низкий ущерб, высокая себестоимость работы.",
    cover: uri(REMOTE.hair[0]), level: "Экспертный", category: "Парикмахерское", reward: 700,
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
    cover: uri(REMOTE.nails[0]), level: "Продвинутый", category: "Маникюр", reward: 550,
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
    cover: uri(REMOTE.brows[0]), level: "Продвинутый", category: "Брови", reward: 450,
    lessons: [
      { id: "l1", title: "Золотое сечение лица", type: "video", duration: 10, description: "Как читать пропорции." },
      { id: "l2", title: "Карта брови за 6 точек", type: "text", duration: 12, description: "Авторский метод APIA." },
      { id: "l3", title: "Моделирование пинцетом", type: "video", duration: 14, description: "Без потери натурального изгиба." },
      { id: "l4", title: "Тест", type: "test", duration: 10, description: "8 вопросов." },
    ],
  },
  {
    id: "c_makeup",
    title: "Макияж для премиум-гостя",
    description: "Дневной, вечерний и редакционный макияж под стандарты APIA: натуральная кожа, чистая графика, длинная носка.",
    cover: uri(REMOTE.makeup[0]), level: "Продвинутый", category: "Макияж", reward: 600,
    lessons: [
      { id: "l1", title: "Подбор тона под подсвет кожи", type: "video", duration: 12, description: "Как закрыть кожу, не убирая её." },
      { id: "l2", title: "Геометрия скульптуры", type: "video", duration: 14, description: "Без переусердствования." },
      { id: "l3", title: "Свадебный макияж: 8-часовая носка", type: "text", duration: 10, description: "Слой за слоем." },
      { id: "l4", title: "Редакционный макияж за 25 минут", type: "video", duration: 12, description: "Скоростной протокол." },
      { id: "l5", title: "Тест", type: "test", duration: 10, description: "7 вопросов + кейс." },
    ],
  },
  {
    id: "c_men",
    title: "Мужской зал: барберинг APIA",
    description: "Сухие срезы, фейды, бородинг и работа с фактурой. Уровень премиум-мужского зала.",
    cover: uri(REMOTE.barber[0]), level: "Продвинутый", category: "Парикмахерское", reward: 550,
    lessons: [
      { id: "l1", title: "Анатомия мужской головы", type: "text", duration: 10, description: "Линии, пропорции, рост волос." },
      { id: "l2", title: "Чистый фейд за 6 проходов", type: "video", duration: 16, description: "Пошаговая демонстрация." },
      { id: "l3", title: "Бородинг и моделирование", type: "video", duration: 12, description: "Как читать форму лица." },
      { id: "l4", title: "Работа с непослушной фактурой", type: "text", duration: 10, description: "Кудри, жёсткие стержни, рост против." },
      { id: "l5", title: "Тест", type: "test", duration: 10, description: "6 вопросов + кейс." },
    ],
  },
  {
    id: "c_skin",
    title: "Косметология: протокол сияния",
    description: "Авторский 4-этапный протокол перед мероприятием. Дешёвый по затратам, дорогой по эффекту.",
    cover: uri(REMOTE.skin[0]), level: "Экспертный", category: "Уход", reward: 650,
    lessons: [
      { id: "l1", title: "Диагностика кожи за 5 минут", type: "video", duration: 8, description: "На что смотреть до начала." },
      { id: "l2", title: "Ферментативный пилинг", type: "text", duration: 10, description: "Когда, как, кому подходит." },
      { id: "l3", title: "Лимфодренажный массаж лица", type: "video", duration: 14, description: "Техника без давления." },
      { id: "l4", title: "Финишная маска и SPF", type: "checklist", duration: 6, description: "5 точек контроля." },
      { id: "l5", title: "Тест", type: "test", duration: 10, description: "Теория + кейс." },
    ],
  },
  {
    id: "c_color_theory",
    title: "Колористика: глубокая теория",
    description: "Уровень для тех, кто работает с цветом каждый день и хочет перестать угадывать.",
    cover: uri(REMOTE.tools[0]), level: "Экспертный", category: "Парикмахерское", reward: 800,
    lessons: [
      { id: "l1", title: "Закон цветового круга", type: "video", duration: 14, description: "Не школьный — рабочий." },
      { id: "l2", title: "Подбор oxidant: матрица решений", type: "text", duration: 16, description: "Печатаем и вешаем у зеркала." },
      { id: "l3", title: "Тонирование: 18 рабочих формул", type: "text", duration: 18, description: "Холод, тепло, нейтраль." },
      { id: "l4", title: "Сложные кейсы и спасательные операции", type: "video", duration: 16, description: "Когда волосы сожгли до нас." },
      { id: "l5", title: "Экзамен", type: "test", duration: 25, description: "Кейсы и тонировочные расчёты." },
    ],
  },
  {
    id: "c_lash",
    title: "Стилист бровей и ресниц",
    description: "Долговременная укладка, ламинирование, подбор формы. Без агрессии, без желатина.",
    cover: uri(REMOTE.brows[2]), level: "Базовый", category: "Брови", reward: 400,
    lessons: [
      { id: "l1", title: "Анатомия волоса и ресницы", type: "text", duration: 9, description: "Чтобы не вредить." },
      { id: "l2", title: "Долговременная укладка бровей", type: "video", duration: 12, description: "Полный протокол." },
      { id: "l3", title: "Ламинирование ресниц", type: "video", duration: 14, description: "Скорость и качество." },
      { id: "l4", title: "Тест", type: "test", duration: 8, description: "Базовая теория." },
    ],
  },
  {
    id: "c_psychology",
    title: "Психология контакта с гостем",
    description: "Как читать гостя, держать дистанцию, работать со сложными запросами без выгорания мастера.",
    cover: uri(REMOTE.interior[0]), level: "Продвинутый", category: "Сервис", reward: 480,
    lessons: [
      { id: "l1", title: "Типы клиентов и их запросы", type: "video", duration: 12, description: "Четыре основных портрета." },
      { id: "l2", title: "Активное слушание", type: "text", duration: 10, description: "Как услышать настоящий запрос." },
      { id: "l3", title: "Конфликт без потери гостя", type: "video", duration: 14, description: "Сценарии и фразы." },
      { id: "l4", title: "Свои границы и эмоциональный ресурс", type: "text", duration: 10, description: "Чтобы оставаться в форме." },
      { id: "l5", title: "Тест", type: "test", duration: 10, description: "Кейсы." },
    ],
  },
  {
    id: "c_management",
    title: "Управление сменой: для администраторов",
    description: "Бриф, распределение записи, контроль сервиса, отчёт по итогам дня.",
    cover: uri(REMOTE.interior[1]), level: "Продвинутый", category: "Менеджмент", reward: 600,
    lessons: [
      { id: "l1", title: "Утренний бриф за 12 минут", type: "video", duration: 10, description: "Структура, которая работает." },
      { id: "l2", title: "Управление записью на день", type: "text", duration: 12, description: "Как не сломать загрузку." },
      { id: "l3", title: "Чек-лист закрытия смены", type: "checklist", duration: 8, description: "16 пунктов." },
      { id: "l4", title: "Отчёт руководителю", type: "text", duration: 10, description: "Что и в каком формате." },
      { id: "l5", title: "Тест", type: "test", duration: 12, description: "Кейсы." },
    ],
  },
  {
    id: "c_brand",
    title: "Голос бренда APIA в соцсетях",
    description: "Как мастеру публиковать работы, чтобы это работало на личный бренд и на бренд APIA.",
    cover: uri(REMOTE.makeup[2]), level: "Базовый", category: "Сервис", reward: 350,
    lessons: [
      { id: "l1", title: "Что такое голос APIA", type: "text", duration: 8, description: "Тон, ритм, словарь." },
      { id: "l2", title: "Фотография работы за 60 секунд", type: "video", duration: 10, description: "Свет, ракурс, кадрирование." },
      { id: "l3", title: "Подпись к публикации: формула", type: "text", duration: 8, description: "Что писать, чего избегать." },
      { id: "l4", title: "Чек-лист публикации", type: "checklist", duration: 6, description: "6 пунктов перед нажатием." },
      { id: "l5", title: "Тест", type: "test", duration: 8, description: "5 вопросов." },
    ],
  },
];

export const CHATS_SEED: Chat[] = [
  { id: "chat_company", kind: "company", title: "APIA HQ", subtitle: "Все мастера сети", members: 87, pinned: true },
  { id: "chat_msk", kind: "salon", title: "APIA Москва · Патриаршие", subtitle: "Команда салона", members: 14 },
  { id: "chat_msk2", kind: "salon", title: "APIA Москва · Третьяковская", subtitle: "Команда салона", members: 12 },
  { id: "chat_spb", kind: "salon", title: "APIA Санкт-Петербург", subtitle: "Команда салона", members: 16 },
  { id: "chat_sochi", kind: "salon", title: "APIA Сочи", subtitle: "Команда салона", members: 10 },
  { id: "chat_dxb", kind: "salon", title: "APIA Dubai Marina", subtitle: "Команда салона", members: 9 },
  { id: "chat_hair", kind: "specialty", title: "Парикмахеры и колористы", subtitle: "Закрытый клуб", members: 24 },
  { id: "chat_nails", kind: "specialty", title: "Мастера маникюра", subtitle: "Закрытый клуб", members: 14 },
  { id: "chat_makeup", kind: "specialty", title: "Визажисты", subtitle: "Закрытый клуб", members: 11 },
  { id: "chat_skin", kind: "specialty", title: "Косметологи", subtitle: "Закрытый клуб", members: 9 },
  { id: "chat_brows", kind: "specialty", title: "Бровисты", subtitle: "Закрытый клуб", members: 8 },
  { id: "dm_e1", kind: "dm", title: "София Орлова", subtitle: "Парикмахер-стилист", members: 2 },
  { id: "dm_e15", kind: "dm", title: "Алексей Тихомиров", subtitle: "Тренинг-менеджер", members: 2 },
];

export const MESSAGES_SEED: Record<string, Message[]> = {
  chat_company: [
    { id: "m1", chatId: "chat_company", authorId: "e15", text: "Команда, в субботу — съёмка для нового лукбука APIA. Просим всех мастеров, кто хочет участвовать, отметиться у Анны.", at: now - 12 * h, pinned: true },
    { id: "m2", chatId: "chat_company", authorId: "e7", text: "Запись по съёмке закрываю в пятницу в 18:00.", at: now - 11 * h },
    { id: "m3", chatId: "chat_company", authorId: "e2", text: "Готов. Записал двух гостей под фото.", at: now - 10 * h },
    { id: "m4", chatId: "chat_company", authorId: "e4", text: "С нашей стороны — три модели по бровям.", at: now - 9 * h },
    { id: "m4a", chatId: "chat_company", authorId: "e9", text: "Мы из Третьяковской дадим ещё две модели по короткому каре.", at: now - 8 * h },
    { id: "m4b", chatId: "chat_company", authorId: "e17", text: "Из Дубая шлём бэкстейдж видео — будет в общей подборке.", at: now - 7 * h },
    { id: "m4c", chatId: "chat_company", authorId: "e15", text: "Пятница 18:00 — запись закрыта. Всем участникам уйдёт деталка по понедельнику.", at: now - 5 * h },
  ],
  chat_msk: [
    { id: "m5", chatId: "chat_msk", authorId: "e1", text: "Утренний бриф в 9:30 — стандартно.", at: now - 8 * h },
    { id: "m6", chatId: "chat_msk", authorId: "e2", text: "Записан полный день, гость 12:00 — VIP, под рекомендацию основателя.", at: now - 7 * h },
    { id: "m7", chatId: "chat_msk", authorId: "e4", text: "Поняла, согласую сервис лично.", at: now - 6 * h },
    { id: "m7a", chatId: "chat_msk", authorId: "e7", text: "Гость 14:00 — макияж + волосы. Делаем синхронно с Софией.", at: now - 5 * h },
    { id: "m7b", chatId: "chat_msk", authorId: "e1", text: "Готова. Поставила инструмент.", at: now - 4 * h },
    { id: "m7c", chatId: "chat_msk", authorId: "e15", text: "После закрытия смены — короткая планёрка по KPI недели.", at: now - 1 * h },
  ],
  chat_msk2: [
    { id: "m_msk2_1", chatId: "chat_msk2", authorId: "e9", text: "Открытие нового кабинета — поздравляю команду! Бронь идёт активно.", at: now - 10 * h, pinned: true },
    { id: "m_msk2_2", chatId: "chat_msk2", authorId: "e10", text: "Завтра — VIP-гостья на полный день. Записываю на пятницу под балаяж.", at: now - 6 * h },
    { id: "m_msk2_3", chatId: "chat_msk2", authorId: "e14", text: "Кофе закончился, заказала на завтра.", at: now - 3 * h },
    { id: "m_msk2_4", chatId: "chat_msk2", authorId: "e22", text: "У меня окно в 16:00, могу взять процедуру.", at: now - 1 * h },
  ],
  chat_spb: [
    { id: "m8", chatId: "chat_spb", authorId: "e3", text: "Закрываю смену пораньше, остаются Лена и Мария.", at: now - 9 * h },
    { id: "m9", chatId: "chat_spb", authorId: "e6", text: "Принято.", at: now - 8 * h },
    { id: "m9a", chatId: "chat_spb", authorId: "e16", text: "На завтра у меня съёмка для журнала, уйду в 14:00.", at: now - 6 * h },
    { id: "m9b", chatId: "chat_spb", authorId: "e19", text: "Возьму твоего гостя в 15:30, если что.", at: now - 5 * h },
  ],
  chat_sochi: [
    { id: "m_so1", chatId: "chat_sochi", authorId: "e5", text: "Гости из Москвы записаны на пятницу. Барбер-сессия + укладка.", at: now - 11 * h },
    { id: "m_so2", chatId: "chat_sochi", authorId: "e8", text: "Готов. Поставил инструменты с утра.", at: now - 9 * h },
    { id: "m_so3", chatId: "chat_sochi", authorId: "e21", text: "У меня окно в 17:00 под колор-консультацию.", at: now - 4 * h },
  ],
  chat_dxb: [
    { id: "m_dx1", chatId: "chat_dxb", authorId: "e13", text: "Свадьба 14 числа — три гостьи на полный сервис. Подобрала команду.", at: now - 14 * h, pinned: true },
    { id: "m_dx2", chatId: "chat_dxb", authorId: "e17", text: "Беру жениха и шаферов. Бородинг + укладка.", at: now - 12 * h },
    { id: "m_dx3", chatId: "chat_dxb", authorId: "e13", text: "Передам деталки в личку. С отелем согласовали выездной формат.", at: now - 8 * h },
  ],
  chat_hair: [
    { id: "m10", chatId: "chat_hair", authorId: "e1", text: "Поделитесь, кто работает на новом oxidant 1.8 — впечатления?", at: now - 18 * h },
    { id: "m11", chatId: "chat_hair", authorId: "e2", text: "На тонкой структуре идеально, на жёстких волосах добавляю время.", at: now - 17 * h },
    { id: "m12", chatId: "chat_hair", authorId: "e8", text: "Только начал тестить, к выходным напишу разбор.", at: now - 16 * h },
    { id: "m12a", chatId: "chat_hair", authorId: "e10", text: "На седине — отличный результат, держит 6 недель.", at: now - 14 * h },
    { id: "m12b", chatId: "chat_hair", authorId: "e21", text: "У меня вопрос по перекрытию рыжего пигмента — кто решал на блонде?", at: now - 6 * h },
    { id: "m12c", chatId: "chat_hair", authorId: "e9", text: "Решала. Двойная тонировка, формулу скину в личку.", at: now - 4 * h },
  ],
  chat_nails: [
    { id: "m13", chatId: "chat_nails", authorId: "e6", text: "Закупка пилок — последний день сегодня. Кому нужно — скиньте список.", at: now - 14 * h },
    { id: "m14", chatId: "chat_nails", authorId: "e3", text: "Пять штук на 180 грит, спасибо.", at: now - 13 * h },
    { id: "m14a", chatId: "chat_nails", authorId: "e14", text: "Мне три на 100 и две на 240. И две новые цветовые палитры под зиму.", at: now - 10 * h },
  ],
  chat_makeup: [
    { id: "m_mk1", chatId: "chat_makeup", authorId: "e7", text: "Девочки, кто пробовал новый праймер с шёлком? Гостьи спрашивают.", at: now - 16 * h },
    { id: "m_mk2", chatId: "chat_makeup", authorId: "e16", text: "Да, держится на сухой коже отлично. На жирной — пересушивает.", at: now - 14 * h },
    { id: "m_mk3", chatId: "chat_makeup", authorId: "e20", text: "Согласна. Под смокинг — топ.", at: now - 13 * h },
  ],
  chat_skin: [
    { id: "m_sk1", chatId: "chat_skin", authorId: "e3", text: "Завоз новых сывороток — вторник. Кому передать пробники?", at: now - 20 * h },
    { id: "m_sk2", chatId: "chat_skin", authorId: "e13", text: "Дубаю две.", at: now - 18 * h },
    { id: "m_sk3", chatId: "chat_skin", authorId: "e22", text: "Москва возьмёт три.", at: now - 15 * h },
  ],
  chat_brows: [
    { id: "m_br1", chatId: "chat_brows", authorId: "e4", text: "Запись на мастер-класс по карте брови — четверг. Места почти закончились.", at: now - 22 * h, pinned: true },
    { id: "m_br2", chatId: "chat_brows", authorId: "e11", text: "Из Казани двоих регистрирую.", at: now - 20 * h },
  ],
  dm_e1: [
    { id: "m15", chatId: "dm_e1", authorId: "e1", text: "Привет! Видела вашу публикацию по балаяжу — какая база была?", at: now - 18 * h },
    { id: "m16", chatId: "dm_e1", authorId: "u_self", text: "Привет! 6.0 натуральный, выводила в три захода.", at: now - 17 * h },
    { id: "m17", chatId: "dm_e1", authorId: "e1", text: "Спасибо! В пятницу буду работать рядом — заходите на кофе.", at: now - 1 * h },
  ],
  dm_e15: [
    { id: "m_dm15_1", chatId: "dm_e15", authorId: "e15", text: "Подал заявку в APIA Academy?", at: now - 9 * h },
    { id: "m_dm15_2", chatId: "dm_e15", authorId: "u_self", text: "Подал. Жду ответ.", at: now - 8 * h },
    { id: "m_dm15_3", chatId: "dm_e15", authorId: "e15", text: "Хорошо. До конца недели придёт результат.", at: now - 4 * h },
  ],
};

export const CONTESTS_SEED: Contest[] = [
  {
    id: "ct_week",
    title: "Лучшая работа недели",
    description: "Опубликуйте свою лучшую работу с тегом #неделя. Победителя выбирает совет мастеров и руководитель направления.",
    cover: uri(REMOTE.hair[0]), prize: "30 000 ₽ + бонусный день к отпуску",
    reward: 500,
    participants: ["e1", "e3", "e7", "e9", "e16"],
    endsAt: now + 3 * day,
  },
  {
    id: "ct_month",
    title: "Топ-мастер месяца",
    description: "Учитывается выручка, рейтинг от гостей, активность в обучении и публикациях.",
    cover: uri(REMOTE.makeup[2]), prize: "Поездка на неделю в Париж — APIA отправляет за свой счёт",
    reward: 1500,
    participants: ["e1", "e2", "e4", "e5", "e9", "e15", "e17", "e20"],
    endsAt: now + 18 * day,
  },
  {
    id: "ct_adapt",
    title: "Адаптация без слабых мест",
    description: "Для сотрудников первого года — пройти все курсы адаптации и набрать максимум по сервису.",
    cover: uri(REMOTE.interior[0]), prize: "AirPods Pro + наставничество от Софии Орловой",
    reward: 800,
    participants: ["e8", "e7", "e21", "e18"],
    endsAt: now + 10 * day,
  },
  {
    id: "ct_color",
    title: "Колорист года",
    description: "Конкурс на лучшее сложное окрашивание. Принимаются работы, выполненные за последние 90 дней. Жюри — три топ-колориста APIA.",
    cover: uri(REMOTE.hair[2]), prize: "Учебный курс в Лондоне у Sassoon Academy",
    reward: 2000,
    participants: ["e2", "e10", "e18", "e21"],
    endsAt: now + 32 * day,
  },
  {
    id: "ct_brows",
    title: "Архитектура брови — кубок APIA",
    description: "Соревнование среди бровистов: классика, графика, и работа с проблемной формой. Три номинации.",
    cover: uri(REMOTE.brows[0]), prize: "100 000 ₽ + год доступа к закрытым мастер-классам",
    reward: 1200,
    participants: ["e4", "e11"],
    endsAt: now + 22 * day,
  },
  {
    id: "ct_makeup",
    title: "Макияж года: редакционная съёмка",
    description: "Победитель проводит макияж для обложки нашего следующего лукбука APIA.",
    cover: uri(REMOTE.makeup[3]), prize: "Гонорар + публикация в журнале",
    reward: 1500,
    participants: ["e7", "e16", "e20"],
    endsAt: now + 14 * day,
  },
  {
    id: "ct_team",
    title: "Команда сезона",
    description: "Командный конкурс между салонами APIA. Учитывается общая выручка, NPS гостей, скорость закрытия задач.",
    cover: uri(REMOTE.interior[1]), prize: "Корпоратив на двое суток в Сочи",
    reward: 700,
    participants: ["e1", "e2", "e3", "e4", "e6", "e9", "e10", "e13", "e14", "e15", "e17", "e22"],
    endsAt: now + 28 * day,
  },
  {
    id: "ct_publish",
    title: "Публикация месяца",
    description: "Мастер с самой активной и качественной лентой за месяц. Учитываются лайки, сохранения и комментарии.",
    cover: uri(REMOTE.makeup[4]), prize: "iPhone последней модели",
    reward: 1000,
    participants: ["e1", "e3", "e7", "e9", "e15"],
    endsAt: now + 8 * day,
  },
];

export const TRENDS_SEED: Trend[] = [
  { tag: "balayage", posts: 142, growth: 0.34 },
  { tag: "архитектура", posts: 96, growth: 0.21 },
  { tag: "nudes", posts: 88, growth: 0.18 },
  { tag: "вечер", posts: 74, growth: 0.12 },
  { tag: "свадьба", posts: 61, growth: 0.42 },
  { tag: "fade", posts: 55, growth: 0.09 },
  { tag: "косметология", posts: 48, growth: 0.28 },
  { tag: "academy", posts: 33, growth: 1.12 },
];

export const ACHIEVEMENTS_SEED: Achievement[] = [
  { id: "a_first_post", title: "Первая публикация", description: "Поделились первой работой в ленте.", icon: "image", reward: 50, threshold: 1 },
  { id: "a_ten_posts", title: "Художник", description: "Опубликовали 10 работ.", icon: "edit-3", reward: 200, threshold: 10 },
  { id: "a_first_course", title: "Старт обучения", description: "Прошли первый курс.", icon: "book", reward: 100, threshold: 1 },
  { id: "a_five_courses", title: "Эксперт APIA", description: "Завершили 5 курсов.", icon: "award", reward: 600, threshold: 5 },
  { id: "a_first_contest", title: "Игрок", description: "Подали заявку в первый конкурс.", icon: "flag", reward: 80, threshold: 1 },
  { id: "a_chat_active", title: "Голос команды", description: "Отправили 50 сообщений в общем чате.", icon: "message-circle", reward: 120, threshold: 50 },
  { id: "a_streak_week", title: "Неделя без перерыва", description: "Заходите в приложение 7 дней подряд.", icon: "zap", reward: 150, threshold: 7 },
  { id: "a_top_specialist", title: "Уровень: Специалист", description: "Достигли 1500 баллов.", icon: "star", reward: 300, threshold: 1500 },
  { id: "a_top_expert", title: "Уровень: Эксперт", description: "Достигли 4000 баллов.", icon: "trending-up", reward: 500, threshold: 4000 },
  { id: "a_top_master", title: "Топ-мастер APIA", description: "Достигли 8000 баллов.", icon: "crown", reward: 1000, threshold: 8000 },
];
