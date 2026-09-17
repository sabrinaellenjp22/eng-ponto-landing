/* ==========================================================================
   ENG PONTO - LOGICA E INTERATIVIDADE
   Relógio ao vivo, abas acessíveis, simulação AFD, seletor de planos, acordeão
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* 01. STICKY NAV: VIDRO SOBRE A HERO, SÓLIDA AO PASSAR DELA */
  const nav = document.getElementById('nav');
  const heroEl = document.getElementById('hero');

  function updateNavHeightVar() {
    document.documentElement.style.setProperty('--nav-h', `${nav.offsetHeight}px`);
  }
  updateNavHeightVar();
  window.addEventListener('resize', updateNavHeightVar);

  function updateNavGlass() {
    const heroBottom = heroEl ? heroEl.offsetTop + heroEl.offsetHeight : 0;
    if (window.scrollY + nav.offsetHeight > heroBottom) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateNavGlass, { passive: true });
  updateNavGlass();


  /* 02. RELÓGIO AO VIVO NO MOCK DO HERO */
  const clockElement = document.getElementById('hero-clock');
  function updateClock() {
    if (!clockElement) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
  }
  updateClock();
  // Atualiza a cada 1 segundo se não houver preferência de movimento reduzido
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    setInterval(updateClock, 1000);
  }


  /* 02b. TÍTULO DINÂMICO DO HERO (efeito de digitação) */
  const heroRotatingWord = document.getElementById('hero-rotating-word');
  if (heroRotatingWord && !prefersReducedMotion) {
    const heroWords = ['do celular.', 'do computador.', 'do totem.', 'de onde estiver.'];
    let heroWordIndex = heroWords.length - 1; // já exibida no HTML estático
    let heroCharIndex = heroWords[heroWordIndex].length;

    function typeHeroWord() {
      const word = heroWords[heroWordIndex];
      heroCharIndex++;
      heroRotatingWord.textContent = word.slice(0, heroCharIndex);
      if (heroCharIndex < word.length) {
        setTimeout(typeHeroWord, 110);
      } else {
        setTimeout(deleteHeroWord, 2600);
      }
    }

    function deleteHeroWord() {
      const word = heroWords[heroWordIndex];
      heroCharIndex--;
      heroRotatingWord.textContent = word.slice(0, heroCharIndex);
      if (heroCharIndex > 0) {
        setTimeout(deleteHeroWord, 55);
      } else {
        heroWordIndex = (heroWordIndex + 1) % heroWords.length;
        setTimeout(typeHeroWord, 400);
      }
    }

    setTimeout(deleteHeroWord, 2600);
  }


  /* 03. ABAS REAIS DE "COMO FUNCIONA" */
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => switchTab(index));

    // Suporte a Navegação por Teclado (Setas)
    btn.addEventListener('keydown', (e) => {
      let targetIndex = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        targetIndex = (index + 1) % tabButtons.length;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        targetIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      }

      if (targetIndex !== null) {
        e.preventDefault();
        tabButtons[targetIndex].focus();
        switchTab(targetIndex);
      }
    });
  });

  function switchTab(index) {
    tabButtons.forEach((b, i) => {
      const isSelected = i === index;
      b.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });

    tabPanels.forEach((p, i) => {
      if (i === index) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
  }


  /* 05. ACORDEÃO DAS FAQS */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Fecha todos os acordeões primeiro
      faqItems.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
      });

      // Se não estava aberto, abre o clicado
      if (!isOpen) {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });


  /* 09. REVELAÇÃO NO SCROLL (INTERSECTION OBSERVER ABAIXO DA DOBRA) */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (revealElements.length > 0) {
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          scrollObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });

    revealElements.forEach(el => scrollObserver.observe(el));
  }

});
