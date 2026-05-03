// Public-safe sample content. Real class photos, schedules, teacher names,
// room numbers, and activity details are intentionally anonymized before
// publishing this repository.

export const albums = [
  {
    id: 1,
    title: 'Sample Class Activity',
    featured: true,
    count: 1,
    date: '2026-03-01',
    updatedAt: '2026-05-03',
    cover: '/placeholders/class-archive.svg',
    coverWidth: 1280,
    coverHeight: 852,
    description: 'An anonymized sample record for the public repository.',
    recordedBy: 'Sample archive',
    location: 'Campus location',
    photos: [
      {
        src: '/placeholders/class-archive.svg',
        width: 1280,
        height: 852,
        caption: 'Placeholder image. Real class photos are kept outside the public repository.',
      },
    ],
  },
  {
    id: 2,
    title: 'Sample Campus Note',
    featured: true,
    count: 1,
    date: '2026-03-15',
    updatedAt: '2026-05-03',
    cover: '/placeholders/campus-note.svg',
    coverWidth: 900,
    coverHeight: 1200,
    description: 'An anonymized campus note that preserves structure without exposing private people or places.',
    recordedBy: 'Sample archive',
    location: 'Classroom A101',
    photos: [
      {
        src: '/placeholders/campus-note.svg',
        width: 900,
        height: 1200,
        caption: 'Placeholder image. Replace privately deployed media outside the public repo.',
      },
    ],
  },
  {
    id: 3,
    title: 'Sample Field Trip',
    featured: true,
    count: 1,
    date: '2026-04-01',
    updatedAt: '2026-05-03',
    cover: '/placeholders/field-trip.svg',
    coverWidth: 1280,
    coverHeight: 960,
    description: 'A public-safe sample activity entry using a non-person placeholder image.',
    recordedBy: 'Sample archive',
    location: 'Off-campus site',
    photos: [
      {
        src: '/placeholders/field-trip.svg',
        width: 1280,
        height: 960,
        caption: 'Placeholder image. Real field-trip photos require private permission.',
      },
    ],
  },
]

export const courseSchedule = [
  {
    day: 'Mon',
    slots: [
      {
        time: '08:00-09:35',
        course: 'Calculus',
        note: 'Teacher Name · Classroom A101 · 1-2',
      },
      {
        time: '10:00-11:35',
        course: 'French Language',
        note: 'Teacher Name · Classroom A102 · 3-4',
      },
      {
        time: '14:00-15:35',
        course: 'Linear Algebra',
        note: 'Teacher Name · Classroom A103 · 7-8',
      },
      {
        time: '16:00-17:35',
        course: 'Mathematical French',
        note: 'Teacher Name · Classroom A104 · 9-10',
      },
    ],
  },
  {
    day: 'Tue',
    slots: [
      {
        time: '08:00-09:35',
        course: 'Mathematical Analysis',
        note: 'Teacher Name · Classroom B101 · 1-2',
      },
      {
        time: '10:00-11:35',
        course: 'Academic English',
        note: 'Teacher Name · Classroom B102 · 3-4',
      },
      {
        time: '14:00-15:35',
        course: 'Python Programming',
        note: 'Teacher Name · Computer Lab · 7-8',
      },
      {
        time: '18:00-19:35',
        course: 'Career Seminar',
        note: 'Teacher Name · Lecture Hall · 11-12',
      },
    ],
  },
  {
    day: 'Wed',
    slots: [
      {
        time: '08:00-09:35',
        course: 'French Language',
        note: 'Teacher Name · Classroom C101 · 1-2',
      },
      {
        time: '10:00-11:35',
        course: 'Linear Algebra',
        note: 'Teacher Name · Classroom C102 · 3-4',
      },
      {
        time: '14:00-15:35',
        course: 'AI Foundations',
        note: 'Teacher Name · Classroom C103 · 7-8',
      },
      {
        time: '19:40-21:15',
        course: 'Culture Seminar',
        note: 'Teacher Name · Evening session',
      },
    ],
  },
  {
    day: 'Thu',
    slots: [
      {
        time: '08:00-09:35',
        course: 'French Language',
        note: 'Teacher Name · Classroom D101 · 1-2',
      },
      {
        time: '10:00-11:35',
        course: 'Mathematical Analysis',
        note: 'Teacher Name · Classroom D102 · 3-5',
      },
      {
        time: '14:00-15:35',
        course: 'French Writing',
        note: 'Teacher Name · Classroom D103 · 7-8',
      },
      {
        time: '16:00-17:35',
        course: 'Listening and Speaking',
        note: 'Teacher Name · Classroom D104 · 9-10',
      },
    ],
  },
  {
    day: 'Fri',
    slots: [
      {
        time: '08:00-09:35',
        course: 'Mathematical French',
        note: 'Teacher Name · Classroom E101 · 1-2',
      },
      {
        time: '10:00-11:35',
        course: 'Reading and Writing',
        note: 'Teacher Name · Classroom E102 · 3-4',
      },
      {
        time: '16:00-17:35',
        course: 'General Education',
        note: 'Teacher Name · Lecture Hall · 11-14',
      },
    ],
  },
  {
    day: 'Sat',
    slots: [
      {
        time: '08:00-09:35',
        course: 'Optional Workshop',
        note: 'Teacher Name · Classroom F101 · 1-2',
      },
      {
        time: '10:00-11:35',
        course: 'Problem Session',
        note: 'Teacher Name · Classroom F102 · 3-4',
      },
      {
        time: '16:00-17:35',
        course: 'Project Studio',
        note: 'Teacher Name · Classroom F103 · 9-10',
      },
    ],
  },
]

export const classProfile = {
  campus: '中国人民大学中法学院（苏州）',
  name: 'Anonymized Mathematics Cohort',
  slogan: '数学与法语并修，课程与记忆并存。',
  vision: 'This public version keeps the product structure while replacing private class records with sample content.',
  keywords: ['Anonymized cohort', 'Mathematics', 'French', 'Public-safe sample'],
  intro: [
    'This public repository uses anonymized sample course, album, and archive data. The real deployed class content is kept outside GitHub unless explicit permission is confirmed.',
    'The structure still demonstrates the product idea: a lightweight class knowledge hub with schedules, albums, resources, and collaboration workflows.',
  ],
}

export const dailyTheoremNotes = [
  {
    title: 'Bolzano-Weierstrass',
    prelude: '有界实数列必有收敛子列。',
    displayExpression: '(\\exists M>0\\;\\forall n\\in\\mathbb{N},\\ |x_n|\\le M)\\ \\Longrightarrow\\ \\exists x\\in\\mathbb{R},\\ \\exists\\, n_1<n_2<\\cdots,\\ x_{n_k}\\to x',
    fallback: '(exists M > 0, forall n, |x_n| <= M) => exists x in R and n_1 < n_2 < ... such that x_(n_k) -> x',
    note: '此处写的是实数列版本；有限维欧氏空间中有对应表述。',
  },
  {
    title: 'Cauchy 判别准则',
    prelude: '在实数域中，收敛与 Cauchy 性等价。',
    displayExpression: 'x_n\\to x\\in\\mathbb{R}\\ \\Longleftrightarrow\\ \\forall \\varepsilon>0\\ \\exists N\\ \\forall m,n\\ge N,\\ |x_m-x_n|<\\varepsilon',
    fallback: 'x_n converges in R iff for every epsilon > 0 there exists N such that m,n >= N implies |x_m-x_n| < epsilon',
    note: '这里用到的是实数域的完备性。',
  },
  {
    title: 'Lagrange 中值定理',
    prelude: '闭区间上连续、开区间上可导时，平均变化率在某点由导数实现。',
    displayExpression: 'f\\in C[a,b],\\ f\\in C^1(a,b)\\ \\Longrightarrow\\ \\exists \\xi\\in(a,b),\\ f\'(\\xi)=\\frac{f(b)-f(a)}{b-a}',
    fallback: 'f continuous on [a,b] and differentiable on (a,b) => exists xi in (a,b) with f\'(xi) = (f(b)-f(a))/(b-a)',
    note: '这里只写一元函数情形。',
  },
  {
    title: '秩-零空间定理',
    prelude: '有限维线性映射中，核与像的维数之和等于定义域维数。',
    displayExpression: '\\dim\\ker T + \\dim\\operatorname{Im} T = \\dim V',
    fallback: 'dim Ker(T) + dim Im(T) = dim V',
    note: '矩阵情形即 rank(A) + nullity(A) = n。',
  },
  {
    title: '实对称矩阵谱定理',
    prelude: '实对称矩阵可以正交对角化。',
    displayExpression: 'A=A^{\\mathsf T}\\ \\Longrightarrow\\ \\exists Q\\text{ orthogonal},\\ Q^{\\mathsf T}AQ=\\operatorname{diag}(\\lambda_1,\\dots,\\lambda_n)',
    fallback: 'A = A^T => exists orthogonal Q such that Q^T A Q is diagonal',
    note: '其特征值全为实数。',
  },
  {
    title: 'Bayes 公式',
    prelude: '条件概率换向时，公式写作如下。',
    displayExpression: 'P(B)>0\\ \\Longrightarrow\\ P(A\\mid B)=\\frac{P(B\\mid A)P(A)}{P(B)}',
    fallback: 'P(B) > 0 => P(A|B) = P(B|A)P(A)/P(B)',
    note: '条件是 P(B) 不为零。',
  },
  {
    title: '大数定律',
    prelude: '独立同分布且期望存在时，样本均值趋向共同期望。',
    displayExpression: '\\overline{X}_n\\to \\mathbb{E}[X_1]',
    fallback: 'Xbar_n -> E[X_1]',
    note: '这里故意只写常见表述，不区分弱式与强式。',
  },
  {
    title: 'Heine-Borel 定理',
    prelude: '在欧氏空间中，紧致与闭且有界等价。',
    displayExpression: 'K\\subset\\mathbb{R}^n\\ \\Longrightarrow\\ K\\text{ compact}\\ \\Longleftrightarrow\\ K\\text{ is closed and bounded}',
    fallback: 'For K subset of R^n, K is compact iff K is closed and bounded',
    note: '这里只写欧氏空间版本；一般度量空间中闭有界不必紧。',
  },
  {
    title: '微积分基本定理',
    prelude: '连续函数的积分函数可导，并把原函数恢复出来。',
    displayExpression: 'F(x)=\\int_a^x f(t)\\,dt\\ \\Longrightarrow\\ F\'(x)=f(x)',
    fallback: 'If F(x) = integral from a to x of f(t)dt, then F\'(x) = f(x)',
    note: '通常要求 f 在区间上连续。',
  },
  {
    title: 'Taylor 公式',
    prelude: '局部可导信息可以展开成有限阶多项式与余项。',
    displayExpression: 'f(x)=\\sum_{k=0}^{n}\\frac{f^{(k)}(a)}{k!}(x-a)^k+\\frac{f^{(n+1)}(\\xi)}{(n+1)!}(x-a)^{n+1}',
    fallback: 'f(x) = sum from k=0 to n of f^(k)(a)(x-a)^k/k! + remainder',
    note: '这里写的是 Lagrange 余项形式，且 \\xi 介于 a 与 x 之间。',
  },
  {
    title: 'Cauchy-Schwarz 不等式',
    prelude: '内积空间中，内积绝对值不超过范数乘积。',
    displayExpression: '|\\langle x,y\\rangle|\\le\\|x\\|\\,\\|y\\|',
    fallback: '|<x,y>| <= ||x|| ||y||',
    note: '等号成立当且仅当两个向量线性相关。',
  },
  {
    title: 'Gram-Schmidt 正交化',
    prelude: '线性无关向量组可以被整理成正交规范组。',
    displayExpression: 'v_k=u_k-\\sum_{j=1}^{k-1}\\langle u_k,e_j\\rangle e_j,\\qquad e_k=\\frac{v_k}{\\|v_k\\|}',
    fallback: 'v_k = u_k - sum <u_k,e_j>e_j, e_k = v_k / ||v_k||',
    note: '前提是每一步得到的 v_k 都不为零，也即原向量组线性无关。',
  },
  {
    title: 'Cayley-Hamilton 定理',
    prelude: '方阵满足自己的特征多项式。',
    displayExpression: 'p_A(\\lambda)=\\det(\\lambda I-A)\\ \\Longrightarrow\\ p_A(A)=0',
    fallback: 'If p_A(lambda) = det(lambda I - A), then p_A(A) = 0',
    note: '这是把特征多项式中的标量变量代回矩阵本身。',
  },
  {
    title: '奇异值分解',
    prelude: '任意实矩阵都可以分解成两个正交矩阵与一个非负对角矩阵。',
    displayExpression: 'A\\in\\mathbb{R}^{m\\times n}\\ \\Longrightarrow\\ \\exists U,V\\text{ orthogonal},\\ A=U\\Sigma V^{\\mathsf T}',
    fallback: 'For real matrix A, there exist orthogonal U,V with A = U Sigma V^T',
    note: '对角阵 \\Sigma 的对角元就是奇异值。',
  },
  {
    title: '正交投影定理',
    prelude: '内积空间中的向量可唯一拆成子空间部分与正交补部分。',
    displayExpression: 'x\\in V,\\ W\\subset V\\ \\Longrightarrow\\ \\exists!\\ p\\in W,\\ z\\in W^\\perp,\\ x=p+z',
    fallback: 'For x in V and subspace W, there exist unique p in W and z in W^perp with x = p + z',
    note: '有限维欧氏空间里，这就是“最近点”存在且唯一的原因。',
  },
  {
    title: 'Markov 不等式',
    prelude: '非负随机变量取到大值的概率可以由期望控制。',
    displayExpression: 'X\\ge0,\\ a>0\\ \\Longrightarrow\\ \\mathbb{P}(X\\ge a)\\le\\frac{\\mathbb{E}[X]}{a}',
    fallback: 'If X >= 0 and a > 0, then P(X >= a) <= E[X]/a',
    note: '这是许多概率上界估计的起点。',
  },
  {
    title: 'Chebyshev 不等式',
    prelude: '随机变量偏离均值的概率可由方差估计。',
    displayExpression: '\\mathbb{P}(|X-\\mu|\\ge\\varepsilon)\\le\\frac{\\operatorname{Var}(X)}{\\varepsilon^2}',
    fallback: 'P(|X - mu| >= epsilon) <= Var(X) / epsilon^2',
    note: '这里假定方差存在，且 \\varepsilon>0。',
  },
  {
    title: '全期望公式',
    prelude: '先做条件期望，再取一次期望，回到原期望。',
    displayExpression: '\\mathbb{E}[X]=\\mathbb{E}(\\mathbb{E}[X\\mid Y])',
    fallback: 'E[X] = E(E[X | Y])',
    note: '也常被称作 tower property 或 iterated expectation。',
  },
  {
    title: 'Jensen 不等式',
    prelude: '凸函数作用在期望上，不超过期望作用在凸函数上。',
    displayExpression: '\\varphi\\text{ convex}\\ \\Longrightarrow\\ \\varphi(\\mathbb{E}[X])\\le\\mathbb{E}[\\varphi(X)]',
    fallback: 'If phi is convex, then phi(E[X]) <= E[phi(X)]',
    note: '凹函数时不等号方向相反。',
  },
  {
    title: '中心极限定理',
    prelude: '独立同分布和有限方差下，标准化和趋近正态分布。',
    displayExpression: '\\frac{S_n-n\\mu}{\\sigma\\sqrt n}\\ \\Longrightarrow\\ \\mathcal{N}(0,1)',
    fallback: '(S_n - n mu) / (sigma sqrt n) converges in distribution to N(0,1)',
    note: '这里只写最经典的 i.i.d. 版本。',
  },
  {
    title: 'Banach 不动点定理',
    prelude: '压缩映射在完备度量空间中有唯一不动点。',
    displayExpression: 'd(Tx,Ty)\\le q\\,d(x,y),\\ 0<q<1\\ \\Longrightarrow\\ \\exists!\\ x^*,\\ Tx^*=x^*',
    fallback: 'If d(Tx,Ty) <= q d(x,y) with 0<q<1, then there exists a unique fixed point x*',
    note: '反复迭代 x_{n+1}=Tx_n 会收敛到这个不动点。',
  },
  {
    title: 'Fubini 定理',
    prelude: '在可积条件下，二重积分可以分步进行。',
    displayExpression: '\\int_{X\\times Y}f\\,d(\\mu\\times\\nu)=\\int_X\\left(\\int_Y f(x,y)\\,d\\nu(y)\\right)d\\mu(x)',
    fallback: 'Integral over XxY of f equals iterated integrals when f is integrable',
    note: 'Tonelli 定理处理非负函数，Fubini 定理处理绝对可积情形。',
  },
  {
    title: '逆函数定理',
    prelude: '导数可逆时，局部上存在可微逆映射。',
    displayExpression: '\\det Df(a)\\ne0\\ \\Longrightarrow\\ f\\text{ is locally invertible near }a',
    fallback: 'If det Df(a) != 0, then f is locally invertible near a',
    note: '这里只写多元情形的核心结论，不展开光滑性细节。',
  },
  {
    title: 'Lax-Milgram 定理',
    prelude: 'Hilbert 空间上的强制双线性型保证弱解存在唯一。',
    displayExpression: 'a(\\cdot,\\cdot)\\text{ coercive and continuous}\\ \\Longrightarrow\\ \\forall f\\in H^*,\\ \\exists!u\\in H,\\ a(u,v)=f(v)',
    fallback: 'If a is coercive and continuous, then for every f in H* there exists a unique u with a(u,v)=f(v)',
    note: '这是偏微分方程弱解理论中的基础工具之一。',
  },
]

export const dailyFrenchPhrases = [
  {
    title: 'Meditation du jour',
    text: 'Ce que l’on nomme avec justesse commence déjà à devenir pensable.',
    note: '一件事一旦被准确命名，也就开始变得可以思考。',
  },
  {
    title: 'Meditation du jour',
    text: 'La rigueur ne ferme pas le monde; elle lui donne un contour.',
    note: '严谨并不封闭世界，它只是给世界以轮廓。',
  },
  {
    title: 'Meditation du jour',
    text: 'Apprendre, c’est consentir à n’aller ni trop vite ni trop loin.',
    note: '学习意味着接受步伐不必太快，目光也不必越界。',
  },
  {
    title: 'Meditation du jour',
    text: 'Une mémoire commune se forme par des gestes d’abord imperceptibles.',
    note: '共同的记忆，往往先由几乎看不见的举动积成。',
  },
  {
    title: 'Meditation du jour',
    text: 'Ce qui demeure n’est pas le bruit du jour, mais sa juste mesure.',
    note: '最终留下的不是一日的喧响，而是它恰当的分寸。',
  },
  {
    title: 'Meditation du jour',
    text: 'Penser ensemble n’abolit pas les distances; cela leur donne une forme habitable.',
    note: '共同思考并不消除距离，只是让距离变得可以栖居。',
  },
  {
    title: 'Meditation du jour',
    text: 'Une langue nouvelle n’efface pas la première; elle élargit le silence entre les mots.',
    note: '新的语言并不抹去旧的语言，它只是扩展词与词之间的沉静。',
  },
  {
    title: 'Meditation du jour',
    text: 'On lit parfois plus loin dans une marge que dans une proclamation.',
    note: '有时页边比宣言更能把人带向深处。',
  },
  {
    title: 'Meditation du jour',
    text: 'La preuve et la phrase demandent souvent la même pudeur.',
    note: '证明与句子，常常要求同一种节制。',
  },
  {
    title: 'Meditation du jour',
    text: 'Ce qui se cherche longtemps apprend à tenir debout sans éclat.',
    note: '久寻之物，往往学会在不喧哗中站稳。',
  },
  {
    title: 'Meditation du jour',
    text: 'Habiter une question vaut parfois plus que la résoudre trop vite.',
    note: '有时栖身于一个问题，比过早求解更重要。',
  },
  {
    title: 'Meditation du jour',
    text: 'Entre deux preuves, il y a aussi une manière d’être au monde.',
    note: '在两则证明之间，也藏着一种与世界相处的方式。',
  },
  {
    title: 'Meditation du jour',
    text: 'Toute clarté véritable laisse encore une part d’ombre à méditer.',
    note: '真正的明晰，仍会留下值得沉思的阴影。',
  },
  {
    title: 'Meditation du jour',
    text: 'Ce qu’un groupe apprend ensemble ne se réduit jamais à la somme des cours.',
    note: '一群人共同学到的东西，从不只是课程的总和。',
  },
  {
    title: 'Meditation du jour',
    text: 'Il faut parfois ralentir pour que la pensée retrouve son poids.',
    note: '有时必须放慢，思想才会重新获得重量。',
  },
  {
    title: 'Meditation du jour',
    text: 'Une page sobre laisse au lecteur la part décisive du travail.',
    note: '克制的一页，总会把最关键的一部分工作留给读者。',
  },
  {
    title: 'Meditation du jour',
    text: 'Ce qui oriente vraiment une lecture n’est pas l’abondance, mais la coupe juste.',
    note: '真正引导阅读的，不是丰盛本身，而是恰当的取舍。',
  },
  {
    title: 'Meditation du jour',
    text: 'Lire, c’est aussi apprendre à distinguer ce qui éclaire de ce qui encombre.',
    note: '阅读也意味着学会分辨：什么在照亮，什么只是在堆积。',
  },
  {
    title: 'Meditation du jour',
    text: 'Une idée n’entre pas toujours par la porte principale; parfois elle vient du blanc voisin.',
    note: '观念并不总从正文进入；有时它从旁边的留白悄然抵达。',
  },
  {
    title: 'Meditation du jour',
    text: 'On ne retient bien que ce qui a trouvé en nous un espace assez simple.',
    note: '真正留下来的，往往是那些在心里找到简洁位置的东西。',
  },
  {
    title: 'Meditation du jour',
    text: 'Une bibliotheque utile ne promet rien; elle dispose seulement des rencontres possibles.',
    note: '一间有用的书架并不许诺什么，它只是安静地摆好可能的相遇。',
  },
  {
    title: 'Meditation du jour',
    text: 'Ce qui aide vraiment un esprit n’est pas l’empressement, mais la justesse du pas.',
    note: '真正帮助一个人进入思考的，往往不是催促，而是步子恰到好处。',
  },
  {
    title: 'Meditation du jour',
    text: 'Une classe se reconnaît aussi à la manière dont elle garde trace de ses jours ordinaires.',
    note: '一个班级，也会在它如何保存平常日子的痕迹中被辨认出来。',
  },
  {
    title: 'Meditation du jour',
    text: 'Lire lentement n’est pas perdre du temps; c’est rendre le temps habitable.',
    note: '慢读不是浪费时间，而是把时间整理成可以停留的样子。',
  },
  {
    title: 'Meditation du jour',
    text: 'Une démonstration claire ne triomphe pas; elle invite simplement l’esprit à la suivre.',
    note: '一则清楚的证明并不炫耀，它只是邀请人把思路跟下去。',
  },
  {
    title: 'Meditation du jour',
    text: 'On progresse souvent par retours calmes, bien plus que par élans spectaculaires.',
    note: '人常常靠平静的回返前进，而不主要靠那些声势浩大的冲刺。',
  },
  {
    title: 'Meditation du jour',
    text: 'Un bon mot ne remplace pas l’effort; il rend seulement l’effort plus pensable.',
    note: '一句好话并不能代替用功，但它能让用功这件事变得更可理解。',
  },
  {
    title: 'Meditation du jour',
    text: 'Il faut parfois une page très sobre pour laisser apparaître ce qui compte.',
    note: '有时正是足够素净的一页，才能让真正重要的东西慢慢显出来。',
  },
  {
    title: 'Meditation du jour',
    text: 'Toute mémoire commune commence par quelques notations que personne ne croit décisives.',
    note: '所有共同记忆，往往都始于一些当时没人觉得重要的小小记载。',
  },
  {
    title: 'Meditation du jour',
    text: 'Entre apprendre et retenir, il y a l’art discret de revenir.',
    note: '在学会与记住之间，隔着一门安静而重要的技艺，叫做反复回来。',
  },
  {
    title: 'Meditation du jour',
    text: 'La précision n’appauvrit pas la pensée; elle l’empêche seulement de se dissiper.',
    note: '精确并不会让思想贫乏，它只是防止思想无端散失。',
  },
  {
    title: 'Meditation du jour',
    text: 'Ce qu’on partage durablement n’est pas toujours un événement, mais souvent une cadence.',
    note: '真正能长久分享的，不总是某个事件，更多时候是一种共同的节奏。',
  },
  {
    title: 'Meditation du jour',
    text: 'Une ressource bien classée économise non seulement du temps, mais aussi du découragement.',
    note: '一份整理得好的资源，节省的不只是时间，也是在节省沮丧。',
  },
  {
    title: 'Meditation du jour',
    text: 'Comprendre ne consiste pas à aller plus vite, mais à laisser chaque idée prendre place.',
    note: '理解不在于更快，而在于让每个观念各得其位。',
  },
  {
    title: 'Meditation du jour',
    text: 'Une difficulté bien regardée devient souvent une porte plutôt qu’un mur.',
    note: '一个问题只要被认真看清，往往会从墙变成门。',
  },
  {
    title: 'Meditation du jour',
    text: 'Ce qu’on répète avec patience cesse peu à peu d’être étranger.',
    note: '耐心反复的东西，会一点点不再陌生。',
  },
  {
    title: 'Meditation du jour',
    text: 'La pensée gagne en netteté quand le geste d’apprendre devient régulier.',
    note: '当学习的动作变得稳定，思路也会逐渐清明。',
  },
  {
    title: 'Meditation du jour',
    text: 'Il existe une fraternité discrète entre ceux qui cherchent longtemps la même vérité.',
    note: '长久寻找同一种真理的人之间，自有一种安静的同伴关系。',
  },
  {
    title: 'Meditation du jour',
    text: 'Un théorème n’abrège pas le monde; il en révèle seulement une économie plus profonde.',
    note: '定理不是缩短世界，而是显出世界更深的一种节律。',
  },
  {
    title: 'Meditation du jour',
    text: 'On ne revient jamais tout à fait au même texte: c’est aussi nous qui avons changé.',
    note: '人不会真正回到同一页文字，因为回来时自己也已改变。',
  },
  {
    title: 'Meditation du jour',
    text: 'La mémoire travaille mieux quand elle n’est pas pressée de prouver qu’elle retient.',
    note: '记忆在不急着证明自己记住时，反而工作得更好。',
  },
  {
    title: 'Meditation du jour',
    text: 'Ce qui paraît austère au premier abord devient parfois hospitalier à force d’attention.',
    note: '初看严峻的东西，常因久久注视而显出可亲。',
  },
  {
    title: 'Meditation du jour',
    text: 'Étudier ensemble, c’est partager non seulement des réponses, mais une manière de tenir.',
    note: '一起学习分享的不只是答案，还有一种共同坚持的方式。',
  },
  {
    title: 'Meditation du jour',
    text: 'Toute vraie méthode commence par une modestie devant ce qu’on ne sait pas encore.',
    note: '真正的方法，总从对未知的一点谦逊开始。',
  },
  {
    title: 'Meditation du jour',
    text: 'Il y a des jours où l’on n’avance qu’en ordre intérieur, et cela compte aussi.',
    note: '有些日子看似没走远，其实只是在整理内在秩序，这也算前进。',
  },
  {
    title: 'Meditation du jour',
    text: 'La justesse d’une phrase peut parfois rouvrir le courage d’apprendre.',
    note: '一句恰当的话，有时会重新打开继续学习的勇气。',
  },
  {
    title: 'Meditation du jour',
    text: 'Penser clairement demande moins de brillant que de fidélité.',
    note: '清楚地思考，靠的往往不是耀眼，而是持守。',
  },
  {
    title: 'Meditation du jour',
    text: 'Les connaissances s’assemblent vraiment quand elles trouvent une forme de voisinage.',
    note: '知识真正能聚拢，是在它们彼此找到邻近关系的时候。',
  },
  {
    title: 'Meditation du jour',
    text: 'On s’égare moins dans l’étude quand on sait nommer ce que l’on cherche.',
    note: '学习里不至太迷路，是因为知道自己究竟在找什么。',
  },
  {
    title: 'Meditation du jour',
    text: 'Une classe devient un lieu quand les efforts solitaires commencent à se reconnaître.',
    note: '当各自的用功开始彼此辨认，一个班级才真正成为场所。',
  },
  {
    title: 'Meditation du jour',
    text: 'Le silence d’une bibliothèque n’est pas vide; il contient des promesses de reprise.',
    note: '图书馆的安静并不空，它含着许多等待再度展开的可能。',
  },
  {
    title: 'Meditation du jour',
    text: 'Ce que nous comprenons aujourd’hui éclaire souvent une patience plus ancienne.',
    note: '今天理解的东西，常在照亮更早以前的耐心。',
  },
  {
    title: 'Meditation du jour',
    text: 'Apprendre une langue, c’est aussi découvrir un autre rythme pour la précision.',
    note: '学一门语言，也是在发现另一种通往精确的节奏。',
  },
]
