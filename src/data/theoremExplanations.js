// Bilingual proof sketches for each daily theorem.
//
// Each entry is a SHORT, NUMBERED list of steps (zh / fr arrays) rather than a
// single dense paragraph — the home page renders them as ①②③④ so a reader can
// follow the argument one move at a time. Math fragments are wrapped in single-
// dollar markers (e.g. `$\xi$`) and pre-rendered to HTML by KaTeX at build time
// via scripts/render-theorems.mjs (the browser never loads KaTeX). Plain prose
// is HTML-escaped before insertion.
//
// The keys below match the `title` field in
// src/data/dailyTheoremNotes.generated.js (sourced from src/data/siteContent.js).
// Strings use String.raw so LaTeX backslashes can be written naturally.
//
// The generator accepts a step array OR a legacy single string per language, so
// adding/splitting steps is safe.

export const theoremExplanations = {
  'Bolzano-Weierstrass': {
    zh: [
      String.raw`把整个有界数列关进一个长度为 $2M$ 的闭区间。`,
      String.raw`每次将当前区间二等分，保留含无穷多项的那一半，得到一列长度趋于零的闭区间套。`,
      String.raw`由完备性公理，这列闭区间套出唯一公共点 $x$。`,
      String.raw`在每一段里各取原数列的一项，这些项构成收敛到 $x$ 的子列。`,
    ],
    fr: [
      String.raw`On enferme toute la suite bornée dans un intervalle fermé de longueur $2M$.`,
      String.raw`À chaque étape on coupe l'intervalle en deux et on garde la moitié contenant une infinité de termes : les intervalles emboîtés ont une longueur qui tend vers zéro.`,
      String.raw`Par la propriété des segments emboîtés, il reste un unique point commun $x$.`,
      String.raw`On choisit un terme dans chaque segment : ils forment une sous-suite qui converge vers $x$.`,
    ],
  },

  'Cauchy 判别准则': {
    zh: [
      String.raw`易方向：收敛数列显然是 Cauchy 列。`,
      String.raw`难方向先证 Cauchy 列有界，于是由 Bolzano-Weierstrass 取出收敛子列 $x_{n_k}\to x$。`,
      String.raw`再用 Cauchy 性把整列拉向同一极限：对足够大的 $n$ 有 $|x_n-x_{n_k}|<\varepsilon$。`,
      String.raw`结合 $|x_{n_k}-x|<\varepsilon$，得 $x_n\to x$，故 Cauchy 列必收敛。`,
    ],
    fr: [
      String.raw`Sens facile : toute suite convergente est de Cauchy.`,
      String.raw`Sens difficile : une suite de Cauchy est bornée, donc Bolzano-Weierstrass en extrait une sous-suite convergente $x_{n_k}\to x$.`,
      String.raw`La propriété de Cauchy ramène toute la suite vers la même limite : pour $n$ grand, $|x_n-x_{n_k}|<\varepsilon$.`,
      String.raw`Avec $|x_{n_k}-x|<\varepsilon$, on conclut $x_n\to x$ : toute suite de Cauchy converge.`,
    ],
  },

  'Lagrange 中值定理': {
    zh: [
      String.raw`构造辅助函数 $g(x)=f(x)-L(x)$，其中 $L$ 是连接两端点 $(a,f(a))$ 与 $(b,f(b))$ 的弦。`,
      String.raw`此时 $g(a)=g(b)$，满足 Rolle 定理的条件。`,
      String.raw`于是存在 $\xi\in(a,b)$ 使 $g'(\xi)=0$。`,
      String.raw`代回整理即得 $f'(\xi)=\dfrac{f(b)-f(a)}{b-a}$：全局平均斜率被某一点的瞬时斜率取到。`,
    ],
    fr: [
      String.raw`On introduit la fonction auxiliaire $g(x)=f(x)-L(x)$, où $L$ est la corde reliant $(a,f(a))$ et $(b,f(b))$.`,
      String.raw`Alors $g(a)=g(b)$, ce qui place dans les hypothèses du théorème de Rolle.`,
      String.raw`Il existe donc $\xi\in(a,b)$ tel que $g'(\xi)=0$.`,
      String.raw`En réécrivant : $f'(\xi)=\dfrac{f(b)-f(a)}{b-a}$ — la pente moyenne globale est atteinte ponctuellement.`,
    ],
  },

  '秩-零空间定理': {
    zh: [
      String.raw`取核 $\ker T$ 的一组基 $e_1,\dots,e_k$。`,
      String.raw`把它扩充成整个 $V$ 的基 $e_1,\dots,e_k,e_{k+1},\dots,e_n$。`,
      String.raw`验证像 $T(e_{k+1}),\dots,T(e_n)$ 线性无关且张成 $\operatorname{Im} T$，故 $\dim\operatorname{Im} T=n-k$。`,
      String.raw`两式相加：$\dim\ker T+\dim\operatorname{Im} T=k+(n-k)=\dim V$。`,
    ],
    fr: [
      String.raw`On part d'une base $e_1,\dots,e_k$ du noyau $\ker T$.`,
      String.raw`On la complète en une base $e_1,\dots,e_k,e_{k+1},\dots,e_n$ de $V$ tout entier.`,
      String.raw`On vérifie que $T(e_{k+1}),\dots,T(e_n)$ sont libres et engendrent $\operatorname{Im} T$, d'où $\dim\operatorname{Im} T=n-k$.`,
      String.raw`En additionnant : $\dim\ker T+\dim\operatorname{Im} T=k+(n-k)=\dim V$.`,
    ],
  },

  '实对称矩阵谱定理': {
    zh: [
      String.raw`关键事实一：实对称阵的特征值都是实数。`,
      String.raw`关键事实二：不同特征值对应的特征向量自动正交。`,
      String.raw`对最大特征值取单位特征向量 $v_1$，再把 $A$ 限制在 $v_1^\perp$ 上（仍对称），归纳构造出正交单位特征向量 $v_1,\dots,v_n$。`,
      String.raw`以它们为列拼成正交阵 $Q$，即得 $Q^{\top} A Q=\operatorname{diag}(\lambda_1,\dots,\lambda_n)$。`,
    ],
    fr: [
      String.raw`Fait clé 1 : les valeurs propres d'une matrice réelle symétrique sont réelles.`,
      String.raw`Fait clé 2 : les vecteurs propres associés à des valeurs propres distinctes sont orthogonaux.`,
      String.raw`On choisit un vecteur unitaire $v_1$ pour la plus grande valeur propre, on restreint $A$ à $v_1^\perp$ (encore symétrique) et on récidive : on obtient une base orthonormée de vecteurs propres $v_1,\dots,v_n$.`,
      String.raw`En les empilant en colonnes d'une matrice orthogonale $Q$ : $Q^{\top} A Q=\operatorname{diag}(\lambda_1,\dots,\lambda_n)$.`,
    ],
  },

  'Bayes 公式': {
    zh: [
      String.raw`对同一交事件用两次条件概率定义：$P(A\cap B)=P(A\mid B)\,P(B)$ 且 $P(A\cap B)=P(B\mid A)\,P(A)$。`,
      String.raw`令两式相等：$P(A\mid B)\,P(B)=P(B\mid A)\,P(A)$。`,
      String.raw`当 $P(B)>0$ 时两边除以 $P(B)$。`,
      String.raw`即得 $P(A\mid B)=\dfrac{P(B\mid A)\,P(A)}{P(B)}$：同一交事件的两种切法互相校准。`,
    ],
    fr: [
      String.raw`On exprime la même intersection de deux façons : $P(A\cap B)=P(A\mid B)\,P(B)$ et $P(A\cap B)=P(B\mid A)\,P(A)$.`,
      String.raw`On égale les deux : $P(A\mid B)\,P(B)=P(B\mid A)\,P(A)$.`,
      String.raw`Si $P(B)>0$, on divise par $P(B)$.`,
      String.raw`D'où $P(A\mid B)=\dfrac{P(B\mid A)\,P(A)}{P(B)}$ : deux conditionnements de la même intersection se calibrent.`,
    ],
  },

  '大数定律': {
    zh: [
      String.raw`弱形式：方差有限时，样本均值的方差 $\operatorname{Var}(\bar X_n)=\sigma^2/n\to 0$。`,
      String.raw`由 Chebyshev 不等式，$\bar X_n$ 在概率意义下趋近 $\mu$。`,
      String.raw`强形式需要更细的工具（Kolmogorov 三级数定理、Etemadi 截断法）。`,
      String.raw`但核心一致：控制 $\bar X_n$ 的涨落幅度，使其终将小于任何固定的 $\varepsilon$。`,
    ],
    fr: [
      String.raw`Forme faible : à variance finie, la variance de la moyenne empirique $\operatorname{Var}(\bar X_n)=\sigma^2/n\to 0$.`,
      String.raw`L'inégalité de Tchebychev donne alors la convergence en probabilité vers $\mu$.`,
      String.raw`La forme forte exige des outils plus fins (trois séries de Kolmogorov, troncature d'Etemadi).`,
      String.raw`Le cœur reste le même : maîtriser les fluctuations de $\bar X_n$ pour qu'elles passent sous tout $\varepsilon$ fixé.`,
    ],
  },

  'Heine-Borel 定理': {
    zh: [
      String.raw`目标：在 $\mathbb{R}^n$ 中，集合紧致 $\Leftrightarrow$ 闭且有界。`,
      String.raw`「闭且有界 $\Rightarrow$ 紧」：先用反复二分证明闭长方体紧，再注意紧集的闭子集仍紧。`,
      String.raw`「紧 $\Rightarrow$ 闭且有界」：紧集的极限点逃不出去故为闭；由开覆盖 $\bigcup_n B(0,n)$ 立得有界。`,
      String.raw`注意此等价仅在欧氏空间成立；一般度量空间须改用「完备 + 全有界」。`,
    ],
    fr: [
      String.raw`Objectif : dans $\mathbb{R}^n$, compact $\Leftrightarrow$ fermé et borné.`,
      String.raw`« Fermé borné $\Rightarrow$ compact » : on montre d'abord qu'un pavé fermé est compact (dichotomie d'un recouvrement), puis qu'un fermé inclus dans un compact est compact.`,
      String.raw`« Compact $\Rightarrow$ fermé borné » : les points limites restent dans le compact (fermé), et le recouvrement $\bigcup_n B(0,n)$ donne le borné.`,
      String.raw`Cette équivalence ne vaut qu'en espace euclidien ; ailleurs il faut « complet et totalement borné ».`,
    ],
  },

  '微积分基本定理': {
    zh: [
      String.raw`定义积分上限函数 $F(x)=\int_a^x f(t)\,dt$。`,
      String.raw`写出差商 $\dfrac{F(x+h)-F(x)}{h}=\dfrac{1}{h}\int_x^{x+h} f$。`,
      String.raw`由 $f$ 在 $x$ 处连续，被积值在小区间内逼近 $f(x)$，故差商当 $h\to 0$ 时取极限 $f(x)$。`,
      String.raw`于是 $F'(x)=f(x)$：先积分再求导，恰好还原 $f$。`,
    ],
    fr: [
      String.raw`On définit la primitive $F(x)=\int_a^x f(t)\,dt$.`,
      String.raw`On forme le taux d'accroissement $\dfrac{F(x+h)-F(x)}{h}=\dfrac{1}{h}\int_x^{x+h} f$.`,
      String.raw`Par continuité de $f$ en $x$, l'intégrande est proche de $f(x)$ sur le petit intervalle, donc le taux tend vers $f(x)$ quand $h\to 0$.`,
      String.raw`Ainsi $F'(x)=f(x)$ : dériver après avoir intégré restitue $f$.`,
    ],
  },

  'Taylor 公式': {
    zh: [
      String.raw`设余项 $R(x)=f(x)-P_n(x)$，其中 $P_n$ 是 $a$ 处的 $n$ 次 Taylor 多项式。`,
      String.raw`则 $R$ 在 $a$ 处的前 $n$ 阶导数全为零。`,
      String.raw`对辅助函数 $g(t)=R(t)-R(x)\left(\dfrac{t-a}{x-a}\right)^{n+1}$ 反复应用 Cauchy 中值定理。`,
      String.raw`即得 Lagrange 余项 $R(x)=\dfrac{f^{(n+1)}(\xi)\,(x-a)^{n+1}}{(n+1)!}$。`,
    ],
    fr: [
      String.raw`On pose le reste $R(x)=f(x)-P_n(x)$, où $P_n$ est le polynôme de Taylor de degré $n$ en $a$.`,
      String.raw`Les dérivées de $R$ jusqu'à l'ordre $n$ s'annulent en $a$.`,
      String.raw`On applique de façon répétée le théorème de Cauchy à $g(t)=R(t)-R(x)\left(\dfrac{t-a}{x-a}\right)^{n+1}$.`,
      String.raw`On obtient le reste de Lagrange $R(x)=\dfrac{f^{(n+1)}(\xi)\,(x-a)^{n+1}}{(n+1)!}$.`,
    ],
  },

  'Cauchy-Schwarz 不等式': {
    zh: [
      String.raw`考察二次函数 $t\mapsto\|x+t y\|^2=\|y\|^2 t^2+2\langle x,y\rangle t+\|x\|^2$。`,
      String.raw`它处处非负，故判别式 $\le 0$：$4\langle x,y\rangle^2-4\,\|x\|^2\,\|y\|^2\le 0$。`,
      String.raw`整理即得 $|\langle x,y\rangle|\le\|x\|\cdot\|y\|$。`,
      String.raw`等号成立当且仅当 $x+t y=0$ 有实根，即 $x,y$ 共线。`,
    ],
    fr: [
      String.raw`On étudie la fonction quadratique $t\mapsto\|x+t y\|^2=\|y\|^2 t^2+2\langle x,y\rangle t+\|x\|^2$.`,
      String.raw`Elle est partout positive, donc son discriminant est négatif : $4\langle x,y\rangle^2-4\,\|x\|^2\,\|y\|^2\le 0$.`,
      String.raw`En réarrangeant : $|\langle x,y\rangle|\le\|x\|\cdot\|y\|$.`,
      String.raw`Égalité ssi $x+t y=0$ admet une racine réelle, c'est-à-dire ssi $x$ et $y$ sont colinéaires.`,
    ],
  },

  'Gram-Schmidt 正交化': {
    zh: [
      String.raw`逐个处理 $u_k$：先减去它在已构造方向上的投影，$v_k=u_k-\sum_{j<k}\langle u_k,e_j\rangle\,e_j$。`,
      String.raw`再单位化 $e_k=v_k/\|v_k\|$。`,
      String.raw`归纳验证：$e_k$ 与之前所有 $e_j$ 正交，且 $e_1,\dots,e_k$ 与 $u_1,\dots,u_k$ 张成同一子空间。`,
      String.raw`$u_k$ 线性无关保证每个 $v_k\ne 0$，过程不中断。`,
    ],
    fr: [
      String.raw`On traite les $u_k$ un par un : on retire ses projections sur les directions déjà obtenues, $v_k=u_k-\sum_{j<k}\langle u_k,e_j\rangle\,e_j$.`,
      String.raw`Puis on normalise $e_k=v_k/\|v_k\|$.`,
      String.raw`Par récurrence : $e_k$ est orthogonal à tous les $e_j$ précédents et $e_1,\dots,e_k$ engendrent le même sous-espace que $u_1,\dots,u_k$.`,
      String.raw`L'indépendance des $u_k$ garantit $v_k\ne 0$ : le procédé ne s'interrompt pas.`,
    ],
  },

  'Cayley-Hamilton 定理': {
    zh: [
      String.raw`先在可对角化矩阵上验证：对角阵直接代入特征多项式即得 $p_A(A)=0$。`,
      String.raw`注意可对角化矩阵在 $M_n(\mathbb{C})$ 中稠密。`,
      String.raw`而 $A\mapsto p_A(A)$ 是 $A$ 的多项式（连续）函数，在稠密集上为零就处处为零。`,
      String.raw`故结论在代数闭域 $\mathbb{C}$ 上成立，再限制回 $\mathbb{R}$ 即可。`,
    ],
    fr: [
      String.raw`On vérifie d'abord sur les matrices diagonalisables : sur une matrice diagonale, $p_A(A)=0$ par calcul direct.`,
      String.raw`Or les diagonalisables sont denses dans $M_n(\mathbb{C})$.`,
      String.raw`Et $A\mapsto p_A(A)$ est polynomiale (donc continue) en $A$ : nulle sur un dense, elle est nulle partout.`,
      String.raw`Le résultat vaut sur le corps algébriquement clos $\mathbb{C}$, puis se redescend sur $\mathbb{R}$.`,
    ],
  },

  '奇异值分解': {
    zh: [
      String.raw`考察对称半正定阵 $A^{\top} A$。`,
      String.raw`由谱定理它有正交特征基 $v_1,\dots,v_n$，特征值记作 $\sigma_i^2\ge 0$。`,
      String.raw`令 $\sigma_i=\sqrt{\lambda_i}$，并对 $\sigma_i>0$ 定义 $u_i=A v_i/\sigma_i$，则 $u_i$ 单位正交。`,
      String.raw`把这些向量拼成列即得 $A=U\Sigma V^{\top}$：任意矩阵都分解为「旋转·拉伸·旋转」。`,
    ],
    fr: [
      String.raw`On étudie la matrice symétrique semi-définie positive $A^{\top} A$.`,
      String.raw`Par le théorème spectral, elle a une base orthonormée de vecteurs propres $v_1,\dots,v_n$, de valeurs propres notées $\sigma_i^2\ge 0$.`,
      String.raw`On pose $\sigma_i=\sqrt{\lambda_i}$ et, pour $\sigma_i>0$, $u_i=A v_i/\sigma_i$ : les $u_i$ sont orthonormés.`,
      String.raw`En empilant ces vecteurs en colonnes : $A=U\Sigma V^{\top}$, soit « rotation · dilatation · rotation ».`,
    ],
  },

  '正交投影定理': {
    zh: [
      String.raw`在有限维子空间 $W$ 上最小化 $\|x-w\|^2$。`,
      String.raw`由完备性与凸性，最近点 $p\in W$ 存在且唯一。`,
      String.raw`一阶最优性条件给出残差 $z=x-p$ 与 $W$ 中每个向量正交，即 $z\in W^\perp$。`,
      String.raw`于是分解 $x=p+z$（$p\in W,\ z\in W^\perp$）唯一。`,
    ],
    fr: [
      String.raw`On minimise $\|x-w\|^2$ sur le sous-espace de dimension finie $W$.`,
      String.raw`Par complétude et convexité, le point le plus proche $p\in W$ existe et est unique.`,
      String.raw`La condition d'optimalité du premier ordre rend le résidu $z=x-p$ orthogonal à tout vecteur de $W$, donc $z\in W^\perp$.`,
      String.raw`La décomposition $x=p+z$ ($p\in W,\ z\in W^\perp$) est alors unique.`,
    ],
  },

  'Markov 不等式': {
    zh: [
      String.raw`设 $X\ge 0$ 且阈值 $a>0$。`,
      String.raw`在事件 $\{X\ge a\}$ 上有 $X\ge a$，故 $\mathbb{E}[X]\ge a\cdot P(X\ge a)$。`,
      String.raw`两边除以 $a$ 即得 $P(X\ge a)\le\dfrac{\mathbb{E}[X]}{a}$。`,
      String.raw`这是用全局平均控制尾部概率最朴素的工具，几乎所有集中不等式都由它出发。`,
    ],
    fr: [
      String.raw`Soit $X\ge 0$ et un seuil $a>0$.`,
      String.raw`Sur l'événement $\{X\ge a\}$ on a $X\ge a$, d'où $\mathbb{E}[X]\ge a\cdot P(X\ge a)$.`,
      String.raw`En divisant par $a$ : $P(X\ge a)\le\dfrac{\mathbb{E}[X]}{a}$.`,
      String.raw`C'est l'outil le plus élémentaire pour borner une queue par une moyenne ; presque toutes les inégalités de concentration en découlent.`,
    ],
  },

  'Chebyshev 不等式': {
    zh: [
      String.raw`对非负变量 $Y=(X-\mu)^2$ 套用 Markov 不等式。`,
      String.raw`得 $P(|X-\mu|\ge k\sigma)=P(Y\ge k^2\sigma^2)\le\dfrac{\mathbb{E}[Y]}{k^2\sigma^2}$。`,
      String.raw`注意 $\mathbb{E}[Y]=\operatorname{Var}(X)=\sigma^2$。`,
      String.raw`故 $P(|X-\mu|\ge k\sigma)\le\dfrac{1}{k^2}$：偏离均值 $k$ 倍标准差的概率最多 $1/k^2$。`,
    ],
    fr: [
      String.raw`On applique l'inégalité de Markov à la variable positive $Y=(X-\mu)^2$.`,
      String.raw`On obtient $P(|X-\mu|\ge k\sigma)=P(Y\ge k^2\sigma^2)\le\dfrac{\mathbb{E}[Y]}{k^2\sigma^2}$.`,
      String.raw`Or $\mathbb{E}[Y]=\operatorname{Var}(X)=\sigma^2$.`,
      String.raw`Donc $P(|X-\mu|\ge k\sigma)\le\dfrac{1}{k^2}$ : s'écarter de $k$ écarts-types arrive au plus avec probabilité $1/k^2$.`,
    ],
  },

  '全期望公式': {
    zh: [
      String.raw`展开外层期望：$\mathbb{E}[\mathbb{E}[X\mid Y]]=\int \mathbb{E}[X\mid Y=y]\,f_Y(y)\,dy$。`,
      String.raw`再展开内层条件期望，得双重积分 $\iint x\,f_{X\mid Y}(x\mid y)\,f_Y(y)\,dx\,dy$。`,
      String.raw`由 $f_{X,Y}=f_{X\mid Y}\,f_Y$ 重组被积函数。`,
      String.raw`即还原成 $\iint x\,f_{X,Y}(x,y)\,dx\,dy=\mathbb{E}[X]$：先按 $Y$ 分层平均，再对 $Y$ 平均。`,
    ],
    fr: [
      String.raw`On développe l'espérance externe : $\mathbb{E}[\mathbb{E}[X\mid Y]]=\int \mathbb{E}[X\mid Y=y]\,f_Y(y)\,dy$.`,
      String.raw`On développe l'espérance conditionnelle interne, d'où l'intégrale double $\iint x\,f_{X\mid Y}(x\mid y)\,f_Y(y)\,dx\,dy$.`,
      String.raw`Comme $f_{X,Y}=f_{X\mid Y}\,f_Y$, on recompose l'intégrande.`,
      String.raw`On retrouve $\iint x\,f_{X,Y}(x,y)\,dx\,dy=\mathbb{E}[X]$ : moyenner par couches selon $Y$, puis moyenner sur $Y$.`,
    ],
  },

  'Jensen 不等式': {
    zh: [
      String.raw`设 $\varphi$ 凸，$X$ 为随机变量。`,
      String.raw`在点 $\mathbb{E}[X]$ 处取 $\varphi$ 的支撑线 $\ell(t)=at+b$，使 $\varphi(t)\ge\ell(t)$ 处处成立。`,
      String.raw`代入 $t=X$ 后两边求期望：$\mathbb{E}[\varphi(X)]\ge a\cdot\mathbb{E}[X]+b=\ell(\mathbb{E}[X])$。`,
      String.raw`支撑线在 $\mathbb{E}[X]$ 处恰与 $\varphi$ 相切，故 $\ell(\mathbb{E}[X])=\varphi(\mathbb{E}[X])$，得 $\mathbb{E}[\varphi(X)]\ge\varphi(\mathbb{E}[X])$。`,
    ],
    fr: [
      String.raw`Soit $\varphi$ convexe et $X$ une variable aléatoire.`,
      String.raw`Au point $\mathbb{E}[X]$, on prend une droite d'appui $\ell(t)=at+b$ de $\varphi$, avec $\varphi(t)\ge\ell(t)$ partout.`,
      String.raw`En posant $t=X$ et en prenant l'espérance : $\mathbb{E}[\varphi(X)]\ge a\cdot\mathbb{E}[X]+b=\ell(\mathbb{E}[X])$.`,
      String.raw`La droite d'appui touche $\varphi$ en $\mathbb{E}[X]$, donc $\ell(\mathbb{E}[X])=\varphi(\mathbb{E}[X])$ : $\mathbb{E}[\varphi(X)]\ge\varphi(\mathbb{E}[X])$.`,
    ],
  },

  '中心极限定理': {
    zh: [
      String.raw`对独立同分布、方差有限的 $X_i$，记标准化和 $S_n=\dfrac{X_1+\cdots+X_n-n\mu}{\sigma\sqrt{n}}$。`,
      String.raw`其特征函数为 $\phi_n(t)=\big[\phi\big(t/(\sigma\sqrt{n})\big)\big]^n$。`,
      String.raw`Taylor 展开 $\phi(t/(\sigma\sqrt{n}))\approx 1-t^2/(2n)+o(1/n)$，取 $n\to\infty$ 的极限得 $e^{-t^2/2}$。`,
      String.raw`这正是 $\mathcal{N}(0,1)$ 的特征函数，由 Lévy 连续性定理推出依分布收敛。`,
    ],
    fr: [
      String.raw`Pour des $X_i$ iid à variance finie, on standardise la somme $S_n=\dfrac{X_1+\cdots+X_n-n\mu}{\sigma\sqrt{n}}$.`,
      String.raw`Sa fonction caractéristique est $\phi_n(t)=\big[\phi\big(t/(\sigma\sqrt{n})\big)\big]^n$.`,
      String.raw`Un développement de Taylor donne $\phi(t/(\sigma\sqrt{n}))\approx 1-t^2/(2n)+o(1/n)$, dont la limite est $e^{-t^2/2}$.`,
      String.raw`C'est la fonction caractéristique de $\mathcal{N}(0,1)$ : le théorème de continuité de Lévy donne la convergence en loi.`,
    ],
  },

  'Banach 不动点定理': {
    zh: [
      String.raw`设 $T$ 在完备度量空间 $X$ 上 $q$-Lipschitz 且 $q<1$；任取 $x_0$，迭代 $x_{n+1}=T(x_n)$。`,
      String.raw`则 $d(x_{n+1},x_n)\le q^n\,d(x_1,x_0)$，几何级数可和，故 $(x_n)$ 是 Cauchy 列。`,
      String.raw`由完备性 $(x_n)$ 收敛到某 $x^*$，再由 $T$ 连续得 $T(x^*)=x^*$。`,
      String.raw`唯一性：两个不动点之间的距离 $\le q\times$ 自身，只能为零。`,
    ],
    fr: [
      String.raw`Soit $T$ une application $q$-Lipschitz sur un espace complet $X$ avec $q<1$ ; à partir de $x_0$, on itère $x_{n+1}=T(x_n)$.`,
      String.raw`Alors $d(x_{n+1},x_n)\le q^n\,d(x_1,x_0)$ : la série géométrique converge, donc $(x_n)$ est de Cauchy.`,
      String.raw`Par complétude, $(x_n)$ converge vers $x^*$, et la continuité de $T$ donne $T(x^*)=x^*$.`,
      String.raw`Unicité : la distance entre deux points fixes serait majorée par $q$ fois elle-même, donc nulle.`,
    ],
  },

  'Fubini 定理': {
    zh: [
      String.raw`设乘积空间 $\sigma$-有限，且 $f\ge 0$ 或 $\int|f|\,d(\mu\otimes\nu)<\infty$。`,
      String.raw`结论：二重积分等于两种顺序的累次积分。`,
      String.raw`证明先在指示函数、简单函数上验证（借助单调类定理）。`,
      String.raw`再用单调收敛 / 控制收敛定理拓展到一般非负或可积 $f$。`,
    ],
    fr: [
      String.raw`On suppose l'espace produit $\sigma$-fini, et $f\ge 0$ ou $\int|f|\,d(\mu\otimes\nu)<\infty$.`,
      String.raw`Conclusion : l'intégrale double égale les intégrales itérées dans les deux ordres.`,
      String.raw`On le vérifie d'abord sur les indicatrices et fonctions étagées (théorème des classes monotones).`,
      String.raw`On étend ensuite aux $f$ positives ou intégrables par convergence monotone / dominée.`,
    ],
  },

  '逆函数定理': {
    zh: [
      String.raw`设 $f:\mathbb{R}^n\to\mathbb{R}^n$ 在 $a$ 处 $C^1$ 且 $Df(a)$ 可逆。`,
      String.raw`把解方程 $f(x)=y$ 化为映射 $T(x)=x-Df(a)^{-1}(f(x)-y)$ 的不动点问题。`,
      String.raw`当 $x$ 靠近 $a$ 时 $T$ 是压缩映射，由 Banach 不动点定理有唯一不动点。`,
      String.raw`该不动点对 $y$ 光滑依赖，于是 $f$ 在 $a$ 附近双射且逆映射光滑。`,
    ],
    fr: [
      String.raw`Soit $f:\mathbb{R}^n\to\mathbb{R}^n$ de classe $C^1$ en $a$ avec $Df(a)$ inversible.`,
      String.raw`On ramène la résolution de $f(x)=y$ au point fixe de $T(x)=x-Df(a)^{-1}(f(x)-y)$.`,
      String.raw`Près de $a$, $T$ est contractant : le théorème de Banach fournit un unique point fixe.`,
      String.raw`Ce point dépend régulièrement de $y$, donc $f$ est un difféomorphisme local au voisinage de $a$.`,
    ],
  },

  'Lax-Milgram 定理': {
    zh: [
      String.raw`设 $a:H\times H\to\mathbb{R}$ 双线性、连续且强制（coercive），$L$ 为 $H$ 上连续线性泛函。`,
      String.raw`由 Riesz 表示定理，$a(u,\cdot)$ 对每个 $u$ 给出唯一 $Au\in H$，使 $a(u,\cdot)=\langle Au,\cdot\rangle$。`,
      String.raw`强制性保证 $A$ 是双射；同样取 $L$ 的 Riesz 代表 $f$。`,
      String.raw`方程 $a(u,v)=L(v)$ 化为 $Au=f$，$A$ 可逆故解 $u$ 唯一存在。`,
    ],
    fr: [
      String.raw`Soit $a:H\times H\to\mathbb{R}$ bilinéaire, continue et coercive, et $L$ une forme linéaire continue sur $H$.`,
      String.raw`Par le théorème de Riesz, $a(u,\cdot)$ définit pour chaque $u$ un unique $Au\in H$ tel que $a(u,\cdot)=\langle Au,\cdot\rangle$.`,
      String.raw`La coercivité fait de $A$ une bijection ; on note $f$ le représentant de Riesz de $L$.`,
      String.raw`L'équation $a(u,v)=L(v)$ devient $Au=f$ ; $A$ inversible donne l'existence et l'unicité de $u$.`,
    ],
  },
}

export const explanationsCredit = {
  generator: 'Anthropic Claude · claude-opus-4.7',
  mode: 'Bilingual stepped proof outlines (Chinese / French) with KaTeX-rendered math',
  scope:
    'Generated during a Dev3pack development session. Stored statically because the public deployment runs on free static infrastructure; a production deployment would route runtime requests through a Cloudflare Worker with the API key.',
}
