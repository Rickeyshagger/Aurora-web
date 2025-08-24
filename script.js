
    // Utilities
    const $ = (sel, scope = document) => scope.querySelector(sel);
    const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

    // Year
    $('#year').textContent = new Date().getFullYear();

    // Theme Toggle with persistence
    const themeBtn = $('#themeBtn');
    const root = document.documentElement;
    const applyTheme = (t)=> {
      root.classList.toggle('theme-dark', t === 'dark');
      root.classList.toggle('theme-light', t === 'light');
      $('#icon-sun').hidden = t !== 'light';
      $('#icon-moon').hidden = t !== 'dark';
      localStorage.setItem('aurora-theme', t);
      themeBtn.setAttribute('aria-label', `Switch to ${t === 'light' ? 'dark' : 'light'} theme`);
    };
    // initial
    const storedTheme = localStorage.getItem('aurora-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(storedTheme || (prefersDark ? 'dark' : 'light'));
    // toggle
    themeBtn.addEventListener('click', ()=> applyTheme(root.classList.contains('theme-dark') ? 'light' : 'dark'));

    // Mobile nav
    const burger = $('#burger');
    const navLinks = $('#navLinks');
    const closeNav = () => { navLinks.classList.remove('open'); burger.setAttribute('aria-expanded','false'); };
    burger.addEventListener('click', ()=>{
      const open = !navLinks.classList.contains('open');
      navLinks.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    $$('a[href^="#"]').forEach(a=> a.addEventListener('click', closeNav));

    // Reveal on scroll (IntersectionObserver)
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {threshold: .12});
    $$('.reveal').forEach(el=> io.observe(el));

    // Contact form validation (client-side only demo)
    const form = $('#contactForm');
    const fields = {
      name: { el: $('#name'), help: $('#nameHelp'), rule: v=> v.trim().length >= 2 || 'Please enter your full name.' },
      email: { el: $('#email'), help: $('#emailHelp'), rule: v=> /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email.' },
      budget: { el: $('#budget'), help: $('#budgetHelp'), rule: v=> v !== '' || 'Select a budget.' },
      message: { el: $('#message'), help: $('#messageHelp'), rule: v=> v.trim().length >= 10 || 'Tell us a bit more (min 10 chars).' },
      consent: { el: $('#consent'), help: null, rule: v=> v === true || 'You must agree to continue.' }
    };
    const showError = (key, msg)=>{
      const f = fields[key];
      if(f.help){ f.help.textContent = typeof msg === 'string' ? msg : ''; }
      f.el.setAttribute('aria-invalid', msg === true ? 'false' : 'true');
    };
    Object.keys(fields).forEach(key=>{
      const f = fields[key];
      const handler = ()=>{
        const res = f.rule(f.el.type === 'checkbox' ? f.el.checked : f.el.value);
        showError(key, res === true);
      };
      f.el.addEventListener('input', handler);
      f.el.addEventListener('blur', handler);
      if(f.el.type === 'checkbox') f.el.addEventListener('change', handler);
    });

    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      let valid = true;
      for(const key of Object.keys(fields)){
        const f = fields[key];
        const res = f.rule(f.el.type === 'checkbox' ? f.el.checked : f.el.value);
        if(res !== true){ valid = false; showError(key, res); } else { showError(key, true); }
      }
      const status = $('#formStatus');
      if(!valid){ status.textContent = 'Please fix the highlighted fields.'; status.style.color = '#ef4444'; return; }

      // Simulate async submit
      const payload = {
        name: fields.name.el.value,
        email: fields.email.el.value,
        budget: fields.budget.el.value,
        message: fields.message.el.value,
        consent: fields.consent.el.checked
      };
      status.textContent = 'Sending…';
      status.style.color = 'var(--muted)';
      await new Promise(r=> setTimeout(r, 900));
      // In a real app, send with fetch:
      // await fetch('/api/contact', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});

      status.textContent = 'Thanks! We’ll be in touch shortly.';
      status.style.color = 'var(--accent)';
      form.reset();
      fields.consent.el.checked = false;
    });

    // Accessibility: set aria-current for in-view section
    const sections = $$('main, section[id]');
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const id = entry.target.getAttribute('id');
          if(!id) return;
          $$('.nav-links a').forEach(a=> a.removeAttribute('aria-current'));
          const active = $(`.nav-links a[href="#${id}"]`);
          if(active) active.setAttribute('aria-current','page');
        }
      });
    }, {rootMargin: '-50% 0px -49% 0px'});
    sections.forEach(sec=> observer.observe(sec));
