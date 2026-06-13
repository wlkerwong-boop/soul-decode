export type TopicCategory = '基础' | '实修' | '生活' | '全局';

export interface DharmaTopic {
  id: string;
  number: number;
  icon: string;
  title: string;
  subtitle: string;
  category: TopicCategory;
  description: string;
  details: string;
  keyPoints: string[];
  quote: string;
  relatedIds: string[];
}

// ── 分类颜色 ──────────────────────────────────────────
export const categoryColors: Record<TopicCategory, string> = {
  '基础': 'rgba(96, 165, 250, 0.15)',
  '实修': 'rgba(251, 146, 60, 0.15)',
  '生活': 'rgba(74, 222, 128, 0.15)',
  '全局': 'rgba(192, 132, 252, 0.15)',
};

export const categoryBorderColors: Record<TopicCategory, string> = {
  '基础': 'rgba(96, 165, 250, 0.3)',
  '实修': 'rgba(251, 146, 60, 0.3)',
  '生活': 'rgba(74, 222, 128, 0.3)',
  '全局': 'rgba(192, 132, 252, 0.3)',
};

export const categoryTextColors: Record<TopicCategory, string> = {
  '基础': '#60a5fa',
  '实修': '#fb923c',
  '生活': '#4ade80',
  '全局': '#c084fc',
};

// ── 22 个主题数据 ──────────────────────────────────────
export const topics: DharmaTopic[] = [
  // ═══════════════ 基础篇 ═══════════════
  {
    id: 'self-and-no-self',
    number: 1,
    icon: '🪞',
    title: '自我与无我',
    subtitle: '区分自我与真实的自己，破除我见',
    category: '基础',
    description: '深入辨析"自我"与"真实的自己"的区别，破除对"我"的执着，认清自我是如何运作的，以及如何从自我模式中解脱出来。',
    details: '自我是我们在成长过程中构建的一套心理防御机制和身份认同，它让我们产生"我"的固定感。但真实的自己是流动的、开放的、具备无限可能性的生命本质。通过觉察自我的运作模式——它的恐惧、控制欲、防御机制，我们可以逐渐从自我认同中解脱，回归真实的生命状态。这是修行的起点，也是贯穿始终的核心课题。',
    keyPoints: ['自我与真实自己的区别', '自我的运作模式与伪装', '破除我见的实修方法', '从自我出发 vs 从身心如实出发', '对自我的持续警觉性', '自我在修行中的软性反抗', '如实面对自己的生命状态'],
    quote: '不要跟隨自我，而要跟隨自己。你只要把那個最基本的，先把它變成習慣——跟隨自己，而不要跟隨自我，你已經減少了人生許許多多的浪費。',
    relatedIds: ['impermanence-and-emptiness', 'mindfulness-and-concentration', 'wisdom-and-liberation'],
  },
  {
    id: 'impermanence-and-emptiness',
    number: 2,
    icon: '🌊',
    title: '无常与空性',
    subtitle: '观照万法无常、诸法无我的实相',
    category: '基础',
    description: '观照生命现象的不断变化与"无固定自性"的本质，从无常的实相出发重新理解一切存在。',
    details: '无常不是一种哲学观念，而是生命现象的事实。生命是不断变化的，是缘起和各种因缘聚合而起的现象，没有固定不变的主题。人们最大的无明在于认为自己是相对稳定、相对固定的。认识到无常不是消极的，恰恰是自由的开始——因为变化意味着一切皆有可能，生命的内在品质可以发生根本性的转变。',
    keyPoints: ['无常是生命的事实而非理论', '诸法无我的实相', '从无常的视角看问题', '无常与自由的关系', '超越对确定性的执着', '变化中把握生命方向', '观无常的实修方法'],
    quote: '生命是不斷變化的，而且是緣起和各種因緣聚合而起的一個現象，沒有固定不變的主體。你只要如是去觀照它，你就會發現就是這個樣子。',
    relatedIds: ['self-and-no-self', 'dependent-origination', 'karma-and-causes'],
  },
  {
    id: 'dependent-origination',
    number: 3,
    icon: '🕸️',
    title: '缘起与因果',
    subtitle: '十二缘起、因果法则的深入辨析',
    category: '基础',
    description: '深入十二缘起的内在逻辑链，理解因果法则如何在生命运作中展现，以及如何从缘起中解脱。',
    details: '缘起法则是佛法最核心的洞察——此有故彼有，此生故彼生。十二缘起（无明→行→识→名色→六入→触→受→爱→取→有→生→老死）揭示了生命轮回的内在机制。理解缘起不是为了让知识更丰富，而是为了找到解脱的突破口——在缘起链中哪里可以切断轮回。因果法则不是宿命论，而是对生命运作规律的如实认知。',
    keyPoints: ['十二缘起的内在逻辑', '缘起与空性的关系', '因果法则的如实认知', '在缘起链中寻找解脱', '缘起与自由意志', '因果与修行的关系', '从缘起看人生困境'],
    quote: '此有故彼有，此生故彼生。理解緣起不是為了讓知識更豐富，而是為了找到解脫的突破口——在緣起鏈中哪裡可以切斷輪迴。',
    relatedIds: ['karma-and-causes', 'self-and-no-self', 'wisdom-and-liberation'],
  },
  {
    id: 'karma-and-causes',
    number: 4,
    icon: '⚖️',
    title: '业力与因缘',
    subtitle: '业力运作与因缘果报的深入辨析',
    category: '基础',
    description: '辨析业力的本质——不是宿命论的惩罚，而是因果法则在生命中的自然运作，以及如何在当下转化业力。',
    details: '业力不是外在的审判或惩罚，而是身口意三业的惯性力量在生命中的自然呈现。每一个心念、每一句话、每一个行为都在编织业力的网络。但业力不是宿命——当下的觉知和正确的抉择可以改变业力的方向。关键在于：不是去消除业力（那是不可能的），而是通过修行转化与业力的关系，不再被业力驱动而身不由己。',
    keyPoints: ['业力的本质与运作机制', '业力与自由意志的关系', '如何在当下转化业力', '业力不是宿命论', '身口意三业的清净', '因缘果报的如实观', '从被动受报到主动转业'],
    quote: '業力不是宿命——當下的覺知和正確的抉擇可以改變業力的方向。關鍵在於不是去消除業力，而是通過修行轉化與業力的關係。',
    relatedIds: ['dependent-origination', 'self-and-no-self', 'practical-and-truth'],
  },
  {
    id: 'wisdom-and-liberation',
    number: 5,
    icon: '🪷',
    title: '智慧与解脱',
    subtitle: '般若智慧与究竟解脱',
    category: '基础',
    description: '从闻思修到般若智慧的开启，理解智慧的本质以及智慧如何导向究竟的解脱。',
    details: '智慧不是知识的堆砌，而是对生命实相的直接洞察。佛法中的智慧分三个层次：闻慧（从听闻而来）、思慧（通过理性思辨）、修慧（在实修中亲证）。真正的解脱不是逃避世间，而是通过般若智慧照见五蕴皆空，从烦恼和执着的根本束缚中自在。智慧与慈悲一体两面——没有智慧的大悲是盲目的，没有慈悲的智慧是干枯的。',
    keyPoints: ['闻思修三慧', '般若智慧的本质', '智慧与慈悲的关系', '从知识到亲证', '解脱的真实含义', '智慧在日常生活中的运用', '破除无明的过程'],
    quote: '智慧不是知識的堆砌，而是對生命實相的直接洞察。真正的解脫不是逃避世間，而是通過般若智慧照見諸法實相，從煩惱和執著的根本束縛中自在。',
    relatedIds: ['self-and-no-self', 'renunciation-and-liberation', 'meditation-and-samatha'],
  },
  {
    id: 'practical-and-truth',
    number: 20,
    icon: '🎯',
    title: '实事求是',
    subtitle: '实事求是的精神与方法',
    category: '基础',
    description: '实事求是不仅是治学态度，更是修行的核心精神——如实观照、如实面对、如实行动。',
    details: '实事求是是修行最根本的态度——面对自己生命真实的状况，不美化、不逃避、不自我欺骗。实事求是意味着：如实观照身心的实际状态，如实面对自己的局限和不足，如实评估修行的进展和障碍，以及在行动中根据实际情况做最有效的选择。这不是简单的"务实"，而是与"诸法实相"相应的生命态度。',
    keyPoints: ['如实观照的核心精神', '不美化不逃避的态度', '实事求是与修行', '如实面对自己的局限', '实事求是与诸法实相', '避免自我欺骗', '实事求是在生活中的运用'],
    quote: '實事求是是修行最根本的態度——面對自己生命真實的狀況，不美化、不逃避、不自我欺騙。這是與"諸法實相"相應的生命態度。',
    relatedIds: ['self-and-no-self', 'impermanence-and-emptiness', 'practice-methodology'],
  },

  // ═══════════════ 实修篇 ═══════════════
  {
    id: 'renunciation-and-liberation',
    number: 6,
    icon: '🧭',
    title: '出离心与解脱道',
    subtitle: '发起真正的出离心，走上解脱道',
    category: '实修',
    description: '发起真实出离心的意义与方法——出离不是逃离世间，而是从烦恼和执着的束缚中解脱。',
    details: '出离心不是厌世或逃避，而是对轮回本质的清醒认知后产生的解脱愿望。真正的出离心包含三个层次：出离恶道之苦（下士道）、出离轮回之乐（中士道）、出离自利之心（上士道）。没有真实的出离心，所有的修行都只是在世间法的层面打转，无法触及生命转化的核心。',
    keyPoints: ['出离心的真实含义', '出离心的三个层次', '从轮回中觉醒', '出离心与厌世的区别', '出离心推动精进', '解脱道的次第', '出离心在日常中的保持'],
    quote: '出離心不是厭世或逃避，而是對輪迴本質的清醒認知後產生的解脫願望。沒有真實的出離心，所有的修行都只是在世間法的層面打轉。',
    relatedIds: ['wisdom-and-liberation', 'practice-methodology', 'life-direction'],
  },
  {
    id: 'practice-methodology',
    number: 7,
    icon: '📐',
    title: '修行次第与方法论',
    subtitle: '5W3H2I框架、修行阶段与资粮',
    category: '实修',
    description: '系统化的修行方法论——5W3H2I框架、修行的阶段性目标和所需资粮的完整梳理。',
    details: '修行不是盲目的摸索，而是有方法、有次第、可验证的实践。5W3H2I框架提供了系统的思维工具：Why（为何修）、What（修什么）、Where（在哪里修）、When（何时修）、Who（与谁修）、How（如何修）、How much（修到什么程度）、How long（修多久）、Insight（见地）、Integration（融贯）。修行需要积累资粮——福德资粮和智慧资粮，二者如鸟之双翼，不可偏废。',
    keyPoints: ['5W3H2I修行框架', '修行阶段的清晰认知', '福德与智慧二资粮', '方法的正确抉择', '次第不可逾越', '可验证的修行标准', '避免盲修瞎练'],
    quote: '修行不是盲目的摸索，而是有方法、有次第、可驗證的實踐。5W3H2I框架提供了系統的思維工具，讓每一步都清晰可辨。',
    relatedIds: ['renunciation-and-liberation', 'meditation-and-samatha', 'practical-and-truth'],
  },
  {
    id: 'body-mind-observation',
    number: 8,
    icon: '🔍',
    title: '身心观察与转化',
    subtitle: '观身、观心、身心转化的实修方法',
    category: '实修',
    description: '通过对身心现象的持续观察，认识身心的真实运作机制，从而实现身心状态的转化。',
    details: '身心观察是修行的核心实践。通过对身体感受、情绪变化、念头生灭的持续观察，我们可以逐渐认识身心的真实运作机制。这种观察不是分析或评判，而是纯粹的觉知——像镜子一样照见一切现象的生灭。随着观察力的提升，我们开始看到身心现象的无常、苦、无我本质，从而自然地放下执着。身心转化的关键不在于"改变"什么，而在于"看清"什么。',
    keyPoints: ['持续的身心观察训练', '感受的扫描与觉知', '情绪的觉察与转化', '念头生灭的观照', '从观察到自然放下', '身心转化的关键', '觉知力的培养'],
    quote: '身心轉化的關鍵不在於"改變"什麼，而在於"看清"什麼。像鏡子一樣照見一切現象的生滅，自然就能從執著中解脫。',
    relatedIds: ['meditation-and-samatha', 'mindfulness-and-concentration', 'afflictions-transformation'],
  },
  {
    id: 'meditation-and-samatha',
    number: 9,
    icon: '🧘',
    title: '禅修与止观',
    subtitle: '禅修方法与止观实修指导',
    category: '实修',
    description: '止与观的完整实修指导——从安住到观察，从静定到智慧开启。',
    details: '禅修的核心是"止观"二门。止（Samatha）是让心安住于一个所缘上，培养定力和宁静；观（Vipassanā）是在定的基础上，运用觉知观察身心实相。止为观的基础，观为止的升华。在实修中，止观是一体两面——没有止的观是散乱的，没有观的止是沉寂的。闭关、行禅、坐禅等不同形式的禅修，都是为了训练这个止观的能力。',
    keyPoints: ['止与观的完整修法', '安住与觉知的训练', '闭关的实践指导', '行禅与坐禅的配合', '止观的平衡与融合', '禅修中的常见障碍', '从静定到智慧开启'],
    quote: '止是讓心安住，培養定力；觀是在定的基礎上，覺察身心實相。止為觀的基礎，觀為止的昇華，二者一體兩面，不可偏廢。',
    relatedIds: ['body-mind-observation', 'mindfulness-and-concentration', 'wisdom-and-liberation'],
  },
  {
    id: 'mindfulness-and-concentration',
    number: 10,
    icon: '🎯',
    title: '心法与专注力',
    subtitle: '心法运用与专注力训练',
    category: '实修',
    description: '心的本质与运作规律，专注力的系统训练方法，以及心法在修行中的核心地位。',
    details: '心是生命的主宰，一切修行归根到底是心的训练。未经过训练的心是散乱的、容易被境转的——它被情绪挟持、被外境操控、被习性牵引。专注力训练是修心的基础，通过持续地将心安住于一个所缘，逐渐培养心的稳定性和清晰度。心法不仅包括专注力的训练，还包括如何运用心——如何作意、如何转念、如何保持正知正念。',
    keyPoints: ['心的本质与运作', '专注力的系统训练', '正知正念的培养', '作意与转念的方法', '心是王，身是臣', '不为境转的定力', '从散乱到安住'],
    quote: '心是生命的主宰。未經過訓練的心是散亂的、容易被境轉的——它被情緒挾持、被外境操控、被習性牽引。一切修行歸根到底是心的訓練。',
    relatedIds: ['meditation-and-samatha', 'body-mind-observation', 'five-pacifications'],
  },
  {
    id: 'five-pacifications',
    number: 11,
    icon: '🪢',
    title: '五停心观与对治',
    subtitle: '五停心观等对治烦恼的法门',
    category: '实修',
    description: '五停心观的具体修法——针对不同烦恼习气的对治方法，以及如何善巧地运用法门。',
    details: '五停心观是佛教基础的对治修行法门：多贪众生修不净观、多瞋众生修慈悲观、多痴众生修缘起观、多慢众生修界差别观、多散众生修数息观。修行的艺术在于知道自己的"病"是什么，然后选择相应的"药"。但最终，所有的法门都是为了通向同一个目标——如实知见。',
    keyPoints: ['五停心观的具体修法', '贪瞋痴慢散的对治', '不净观与慈悲观', '缘起观与界差别观', '数息观的运用', '对症下药的修行智慧', '从对治法到究竟法'],
    quote: '修行的藝術在於知道自己的"病"是什麼，然後選擇相應的"藥"。五停心觀就是針對不同煩惱習氣的對治方法。',
    relatedIds: ['afflictions-transformation', 'mindfulness-and-concentration', 'body-mind-observation'],
  },
  {
    id: 'five-omnipresent-and-vijnana',
    number: 18,
    icon: '🧠',
    title: '遍行五者与唯识',
    subtitle: '遍行五者、唯识学的深入剖析',
    category: '实修',
    description: '唯识学核心概念"遍行五者"的深入剖析——触、作意、受、想、思，以及唯识学对生命运作的精细描述。',
    details: '遍行五者是唯识学中对心识运作的基本分析——触（根境识三者和合）、作意（引心向境）、受（领纳境界）、想（取像安名）、思（造作意志）。这五个心理要素在任何心念生起时都同时运作。唯识学提供了对生命最精细的心理学描述，帮助我们理解心识的运作机制，从而更精准地做功夫。',
    keyPoints: ['遍行五者的定义与运作', '心识运作的精细分析', '唯识学核心概念', '触作意受想思的关系', '唯识与修行的结合', '转识成智的修行路径', '唯识学在当代的意义'],
    quote: '遍行五者——觸、作意、受、想、思——在任何心念生起時都同時運作。唯識學提供了對生命最精細的心理學描述，幫助我們更精準地做功夫。',
    relatedIds: ['afflictions-transformation', 'mindfulness-and-concentration', 'body-mind-observation'],
  },
  {
    id: 'afflictions-transformation',
    number: 19,
    icon: '🔥',
    title: '烦恼与情绪转化',
    subtitle: '烦恼分类、情绪觉察与转化方法',
    category: '实修',
    description: '烦恼的本质与分类，情绪的觉察技巧，以及将烦恼转化为修行助缘的智慧方法。',
    details: '烦恼不是敌人，而是修行的增上缘。关键在于认识烦恼的生起机制——贪、瞋、痴、慢、疑、不正见六根本烦恼，以及随烦恼的运作方式。通过对烦恼的如实观察，我们不再被烦恼控制，而是能够将烦恼转化为觉知的燃料。每一次烦恼生起，都是观照无常、无我的机会。',
    keyPoints: ['六根本烦恼的辨析', '烦恼生起的机制', '情绪的觉察技巧', '烦恼转为道用', '不压制不放纵的态度', '烦恼与菩提的关系', '情绪转化的实修方法'],
    quote: '煩惱不是敵人，而是修行的增上緣。每一次煩惱生起，都是觀照無常、無我的機會。關鍵在於認識煩惱的生起機制，不被它控制。',
    relatedIds: ['five-pacifications', 'body-mind-observation', 'five-omnipresent-and-vijnana'],
  },

  // ═══════════════ 生活篇 ═══════════════
  {
    id: 'education-and-parenting',
    number: 12,
    icon: '👨‍👩‍👧‍👦',
    title: '教育与亲子沟通',
    subtitle: '家庭教育、亲子关系与沟通艺术',
    category: '生活',
    description: '以佛法智慧指导家庭教育——如何培养孩子健康的自我认知、情绪能力和独立人格。',
    details: '教育的本质是帮助生命成长。在家庭教育中，最重要的是培养孩子的觉知力和人格独立性，而不是仅仅关注技能和成绩。亲子沟通的艺术在于：尊重孩子的独立性，允许孩子表达真实的想法和情绪，不把自己的期望强加给孩子。真正的教育是"无求"的——不期待孩子成为自己想象中的样子，而是帮助孩子成为最好的自己。',
    keyPoints: ['教育的本质是帮助生命成长', '培养孩子的觉知力', '允许情绪表达的重要性', '不把期望强加给孩子', '亲子沟通的艺术', '「无求」的教育态度', '培养独立人格'],
    quote: '真正的教育是"無求"的——不期待孩子成為自己想像中的樣子，而是幫助孩子成為最好的自己。教育的本質是幫助生命成長。',
    relatedIds: ['relationship-and-family', 'life-direction', 'five-relationships'],
  },
  {
    id: 'relationship-and-family',
    number: 13,
    icon: '💞',
    title: '关系与家庭',
    subtitle: '人际关系、家庭关系与情感连接',
    category: '生活',
    description: '运用佛法智慧理解和经营人际关系——从自我中心到真心连接，从情感依赖到自在相处。',
    details: '所有关系问题的根源都在于"我执"——我们总是从自我的角度出发要求对方，在关系中计较得失。真正健康的关系是建立在觉知和慈悲的基础上的——不控制、不依赖、不期待。家庭是最真实的修行道场，在朝夕相处中观照自己的习气，在矛盾冲突中练习放下我执。',
    keyPoints: ['关系问题的根源在我执', '从自我中心到真心连接', '不控制不依赖的相处', '家庭是最真实的道场', '在关系中修慈悲', '放下对关系的期待', '自在的人际艺术'],
    quote: '所有關係問題的根源都在於"我執"——我們總是從自我的角度出發要求對方。真正健康的關係是建立在覺知和慈悲的基礎上的。',
    relatedIds: ['education-and-parenting', 'afflictions-transformation', 'five-relationships'],
  },
  {
    id: 'health-and-wellness',
    number: 14,
    icon: '💪',
    title: '身心健康',
    subtitle: '身心健康、疾病调理与养生',
    category: '生活',
    description: '身心一体的健康观——身体训练与心理训练并重，从佛法智慧中汲取养生之道。',
    details: '身心是一体的——身体的状态影响心理，心理的状态也影响身体。真正的健康不是靠外在的医疗手段维持，而是通过身心双修达到的内在平衡。修行本身就包含了对身体的调理——正确的坐姿、行禅、呼吸法、饮食调整。心是王，身是臣，心理的健康比身体的健康更为根本，但二者不可偏废。',
    keyPoints: ['身心一体的健康观', '心理训练对身体的影向', '修行中的身体调理', '健康的生活方式', '疾病中的修行', '养生与修行的结合', '身心平衡的智慧'],
    quote: '心是王，身是臣。真正的健康不是靠外在的醫療手段維持，而是通過身心雙修達到的內在平衡。二者不可偏廢。',
    relatedIds: ['body-mind-observation', 'life-practice-work', 'relationship-and-family'],
  },
  {
    id: 'life-direction',
    number: 15,
    icon: '🧭',
    title: '人生选择与方向',
    subtitle: '人生选择、方向定位与决策',
    category: '生活',
    description: '如何基于佛法智慧做出人生重大选择——从迷茫到清晰，从被动到主动掌控人生方向。',
    details: '人生充满了选择，而选择的根本在于你是否清楚自己真正想要什么。大多数人被社会的期望、家庭的压力、自我的恐惧所驱动，做出的选择往往不是自己真正想要的。佛法智慧帮助我们回归生命本质来审视选择——不再以"得到什么"为标准，而是以"成为什么"为准绳。清晰的人生方向来自于对生命本质的深刻理解和对自身因缘的如实评估。',
    keyPoints: ['从迷茫到清晰的路径', '选择的内在标准', '不被外界期望绑架', '以成为什么为准绳', '如实评估自身因缘', '主动掌控人生方向', '选择与修行结合'],
    quote: '選擇的根本在於你是否清楚自己真正想要什麼。佛法智慧幫助我們回歸生命本質來審視選擇——不再以"得到什麼"為標準，而是以"成為什麼"為準繩。',
    relatedIds: ['renunciation-and-liberation', 'role-model-and-aspiration', 'life-practice-work'],
  },
  {
    id: 'life-practice-work',
    number: 22,
    icon: '🏢',
    title: '生活修行与工作事业',
    subtitle: '如何将修行融入生活和工作',
    category: '生活',
    description: '修行不离生活——如何在日常工作和生活中保持觉知，将修行转化为可落地的日常实践。',
    details: '修行不是在庙里才做的事，而是在每一个当下——洗碗、做饭、工作、与人交流——都可以是修行。将修行融入生活的关键是保持持续的觉知，无论做什么都带着正知正念。工作不仅是谋生的手段，更是修行的道场——在做事中训练专注力，在与人合作中修慈悲，在商业决策中运用智慧。',
    keyPoints: ['修行融入日常生活', '工作中的觉知训练', '生活即是道场', '正念做每一件事', '工作与修行的结合', '商业决策中的智慧', '日常实践的可行性'],
    quote: '修行不是在廟裡才做的事，而是在每一個當下——洗碗、做飯、工作、與人交流——都可以是修行。生活即是道場。',
    relatedIds: ['practice-methodology', 'life-direction', 'mindfulness-and-concentration'],
  },

  // ═══════════════ 全局篇 ═══════════════
  {
    id: 'five-relationships',
    number: 16,
    icon: '🌐',
    title: '五大关系框架',
    subtitle: '人与自身/他人/社会/自然/组织的关系',
    category: '全局',
    description: '系统性的人生关系框架——处理好与自身、他人、社会、自然、组织五大维度的关系。',
    details: '人生本质上是一张关系网络。五大关系框架提供了一个系统性的视角来审视生命中的各种关系：1）与自身的关系——自我认知与内在和谐；2）与他人的关系——家庭、朋友、同事的连接；3）与社会的关系——社会责任与价值贡献；4）与自然的关系——天人合一与生态意识；5）与组织的关系——企业与制度中的定位。这五大关系的平衡与和谐，是幸福人生的基础。',
    keyPoints: ['五大关系的系统性', '与自身的关系', '与他人的关系', '与社会的关系', '与自然的关系', '与组织的关系', '关系平衡的艺术'],
    quote: '人生本質上是一張關係網絡。五大關係框架提供了一個系統性的視角來審視生命——這五大關係的平衡與和諧，是幸福人生的基礎。',
    relatedIds: ['relationship-and-family', 'education-and-parenting', 'life-practice-work'],
  },
  {
    id: 'era-crisis-and-survival',
    number: 17,
    icon: '⚠️',
    title: '时代危机与生存准备',
    subtitle: '时代危机、AI冲击与生存准备',
    category: '全局',
    description: '面对AI时代和社会变革的深刻判断——修行者如何在时代洪流中立足、应变与超越。',
    details: '当前时代面临多重危机：AI对劳动的替代、价值观的混乱、环境与资源的压力、精神健康的普遍恶化。真正的修行者需要有清醒的时代判断，既不盲目乐观也不消极悲观，而是基于对生命本质的理解做出最合理的应对。修行的智慧恰恰是应对时代变革的最深层力量——当外在的确定性不断崩塌时，内在的觉知和定力是最可靠的依怙。',
    keyPoints: ['时代危机的本质判断', 'AI时代的应对策略', '修行者的时代视角', '外在变化与内在稳定', '生存准备的核心', '危机中的修行机遇', '觉醒的时代责任'],
    quote: '當外在的確定性不斷崩塌時，內在的覺知和定力是最可靠的依怙。修行的智慧恰恰是應對時代變革的最深層力量。',
    relatedIds: ['life-direction', 'role-model-and-aspiration', 'five-relationships'],
  },
  {
    id: 'role-model-and-aspiration',
    number: 21,
    icon: '⭐',
    title: '榜样选择与人生志向',
    subtitle: '榜样选择与人生志向的确定',
    category: '全局',
    description: '选择真正值得效仿的人生榜样，确立超越世俗意义的人生志向，以榜样的力量推动生命升华。',
    details: '榜样的力量是巨大的——你所选择效仿的人，决定了你将成为什么样的人。真正的榜样不是世俗意义上的成功者，而是生命品质已经得到升华的人——那些在觉知、慈悲、智慧上有所成就的人。人生志向的确立不是头脑中的冲动决定，而是基于对生命本质的深刻理解后的自然选择。榜样的选择和志向的确立，是人生最重要的战略决策。',
    keyPoints: ['榜样的决定性力量', '如何选择真正的人生榜样', '超越世俗的人生志向', '志向与修行结合', '榜样的智慧与慈悲', '从效仿到超越', '人生最重大的战略决策'],
    quote: '你所選擇效仿的人，決定了你將成為什麼樣的人。榜樣的選擇和志向的確立，是人生最重要的戰略決策。',
    relatedIds: ['life-direction', 'renunciation-and-liberation', 'wisdom-and-liberation'],
  },
];

// ── 分类信息 ──────────────────────────────────────────
export const categoryInfo = {
  '基础': {
    title: '基础篇',
    description: '佛法核心见地——认识生命实相的基础教法',
    icon: '📖',
    count: 6,
  },
  '实修': {
    title: '实修篇',
    description: '实修方法与次第——将见地转化为实际功夫',
    icon: '🧘',
    count: 8,
  },
  '生活': {
    title: '生活篇',
    description: '佛法在生活中的运用——修行不离世间',
    icon: '🏠',
    count: 5,
  },
  '全局': {
    title: '全局篇',
    description: '系统性视野——关系、时代、志向的全景透视',
    icon: '🌐',
    count: 3,
  },
};

// ── 金句池 ──────────────────────────────────────────
export const wisdomQuotes: { text: string; source: string }[] = [
  { text: '不要跟隨自我，而要跟隨自己。你只要把最基本的先變成習慣——跟隨自己，而不要跟隨自我，你已經減少了人生許許多多的浪費。', source: '寂如师·自我与无我' },
  { text: '生命是不斷變化的，是緣起和各種因緣聚合而起的現象。你只要如是去觀照，你就會發現就是這個樣子。', source: '寂如师·无常与空性' },
  { text: '修行不是盲目的摸索，而是有方法、有次第、可驗證的實踐。5W3H2I框架讓每一步都清晰可辨。', source: '寂如师·修行次第' },
  { text: '當外在的確定性不斷崩塌時，內在的覺知和定力是最可靠的依怙。', source: '寂如师·时代危机' },
  { text: '煩惱不是敵人，而是修行的增上緣。每一次煩惱生起，都是觀照無常、無我的機會。', source: '寂如师·烦恼与情绪' },
  { text: '教育不是培養孩子成為你想要的樣子，而是幫助孩子成為最好的自己。', source: '寂如师·教育与亲子' },
  { text: '心是王，身是臣。一切修行歸根到底是心的訓練。', source: '寂如师·心法与专注力' },
  { text: '實事求是是修行最根本的態度——不美化、不逃避、不自我欺騙。', source: '寂如师·实事求是' },
  { text: '所有關係問題的根源都在於"我執"。真正健康的關係是建立在覺知和慈悲的基礎上。', source: '寂如师·关系与家庭' },
  { text: '修行不是在廟裡才做的事，而是在每一個當下——生活即是道場。', source: '寂如师·生活修行' },
  { text: '你所選擇效仿的人，決定了你將成為什麼樣的人。榜樣的選擇是人生最重要的戰略決策。', source: '寂如师·榜样选择' },
  { text: '身心轉化的關鍵不在於"改變"什麼，而在於"看清"什麼。', source: '寂如师·身心观察' },
  { text: '出離心不是厭世或逃避，而是對輪迴本質的清醒認知後產生的解脫願望。', source: '寂如师·出离心' },
  { text: '智慧的關鍵不是知識的堆砌，而是對生命實相的直接洞察。', source: '寂如师·智慧与解脱' },
  { text: '人生本質上是一張關係網絡。五大關係的平衡與和諧，是幸福人生的基礎。', source: '寂如师·五大关系' },
];

// ── 帮助函数 ──────────────────────────────────────────
export function getTopicById(id: string): DharmaTopic | undefined {
  return topics.find(t => t.id === id);
}

export function getTopicsByCategory(category: TopicCategory): DharmaTopic[] {
  return topics.filter(t => t.category === category);
}

export function getRelatedTopics(topic: DharmaTopic): DharmaTopic[] {
  return topic.relatedIds
    .map(id => getTopicById(id))
    .filter((t): t is DharmaTopic => t !== undefined);
}
