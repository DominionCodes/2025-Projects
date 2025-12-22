document.addEventListener('DOMContentLoaded', () => {
	const toggle = document.querySelector('.nav-toggle');
	const menu = document.getElementById('primary-navigation');
	if (!toggle || !menu) return;

	toggle.addEventListener('click', (e) => {
		const expanded = toggle.getAttribute('aria-expanded') === 'true';
		toggle.setAttribute('aria-expanded', String(!expanded));
		menu.classList.toggle('open');
	});

	// Close menu when a navigation link is clicked (mobile)
	menu.querySelectorAll('a').forEach((link) => {
		link.addEventListener('click', () => {
			if (menu.classList.contains('open')) {
				menu.classList.remove('open');
				toggle.setAttribute('aria-expanded', 'false');
			}
		});
	});

	// Click outside to close
	document.addEventListener('click', (e) => {
		if (!menu.classList.contains('open')) return;
		const path = e.composedPath ? e.composedPath() : (e.path || []);
		if (!path.includes(menu) && !path.includes(toggle)) {
			menu.classList.remove('open');
			toggle.setAttribute('aria-expanded', 'false');
		}
	});

	// Close via Escape
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && menu.classList.contains('open')) {
			menu.classList.remove('open');
			toggle.setAttribute('aria-expanded', 'false');
			toggle.focus();
		}
	});

	// --- Scroll-to-bottom button behavior ---
	const scrollBtn = document.getElementById('scrollToBottom');
	if (scrollBtn) {
		const SHOW_AFTER = 300; // px scrolled from top before showing
		const atBottom = () => (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 6);

		const updateScrollButton = () => {
			if (atBottom()) {
				scrollBtn.classList.remove('visible');
				return;
			}
			if (window.scrollY > SHOW_AFTER) {
				scrollBtn.classList.add('visible');
			} else {
				scrollBtn.classList.remove('visible');
			}
		};

		// Click -> smooth scroll to footer or bottom
		scrollBtn.addEventListener('click', () => {
			const footer = document.querySelector('.footer') || document.querySelector('footer');
			if (footer) {
				footer.scrollIntoView({ behavior: 'smooth', block: 'end' });
			} else {
				window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
			}
		});

		// Keyboard accessibility (Enter / Space)
		scrollBtn.addEventListener('keydown', (ev) => {
			if (ev.key === 'Enter' || ev.key === ' ') {
				ev.preventDefault();
				scrollBtn.click();
			}
		});

		// Update on scroll/resize
		window.addEventListener('scroll', updateScrollButton, { passive: true });
		window.addEventListener('resize', updateScrollButton);

		// Initial check
		updateScrollButton();
	}

	// --- HERO STATS: auto-updating market statistics ---
	(function initHeroStats() {
		const stats = Array.from(document.querySelectorAll('.hero-stats .stat'));
		if (!stats.length) return;

		// Configuration per stat key
		const cfg = {
			marketGrowth: { value: 1.2, min: -5, max: 12, step: 0.4, format: v => (v >= 0 ? '+' : '') + v.toFixed(1) + '%' },
			activeUsers: { value: 1200, min: 400, max: 5000, step: 1, format: v => (v >= 1000 ? (v/1000).toFixed(1) + 'K' : Math.round(v)) },
			successRate: { value: 74.5, min: 60, max: 97.9, step: 0.6, format: v => v.toFixed(1) + '%' }
		};

		const MIN_INTERVAL = 10000; // ms
		const MAX_INTERVAL = 20000; // ms
		let timers = {};
		let paused = false;

		function randBetween(a, b) { return Math.random() * (b - a) + a; }
		function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

		function findCfgForKey(key) { return cfg[key]; }

		function scheduleUpdate(key, el) {
			if (paused) return;
			const delay = Math.floor(randBetween(MIN_INTERVAL, MAX_INTERVAL));
			timers[key] = setTimeout(() => doUpdate(key, el), delay);
		}

		function doUpdate(key, el) {
			const c = findCfgForKey(key);
			if (!c) return;

			// small random fluctuation relative to range
			let delta;
			if (key === 'activeUsers') {
				delta = Math.round(randBetween(-30, 60));
			} else if (key === 'marketGrowth') {
				delta = randBetween(-0.9, 1.2);
			} else {
				delta = randBetween(-0.6, 0.6);
			}

			let newVal = c.value + delta;
			newVal = clamp(newVal, c.min, c.max);
			// apply step rounding
			if (c.step >= 1) newVal = Math.round(newVal);
			else newVal = Math.round(newVal / c.step) * c.step;

			c.value = newVal;

			// update DOM
			const valueEl = el.querySelector('.stat-value');
			if (valueEl) {
				valueEl.textContent = c.format(c.value);
				// add highlight animation
				el.classList.add('updated');
				setTimeout(() => el.classList.remove('updated'), 700);
			}

			// schedule next update
			scheduleUpdate(key, el);
		}

		// initialize and start timers
		stats.forEach((el) => {
			const key = el.getAttribute('data-key');
			const c = findCfgForKey(key);
			if (!c) return;
			// set initial value from cfg
			const vEl = el.querySelector('.stat-value');
			if (vEl) vEl.textContent = c.format(c.value);
			// start first update at a staggered time
			scheduleUpdate(key, el);
		});

		// Pause updates when page not visible
		document.addEventListener('visibilitychange', () => {
			if (document.hidden) {
				paused = true;
				// clear timers
				Object.values(timers).forEach(id => clearTimeout(id));
				timers = {};
			} else {
				paused = false;
				// restart schedules
				stats.forEach(el => {
					const key = el.getAttribute('data-key');
					scheduleUpdate(key, el);
				});
			}
		});

	})();
});
