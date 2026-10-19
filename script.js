/* ==========================================================================
   FAQ Accordion — application script
   Veda Technology Web Development Internship — Task 10

   Vanilla JavaScript only. The file is split into four clear sections:
     1. DATA          the FAQ question/answer dataset
     2. RENDERING     builds the accordion markup from the data
     3. ACCORDION     expand / collapse behaviour
     4. EVENTS        click bindings + init

   No frameworks, no eval(), no inline onclick handlers.
   ========================================================================== */

(function () {
  'use strict';

  /* =========================================================================
     1. DATA
     -------------------------------------------------------------------------
     Each FAQ item is one plain object. Keeping the data separate from the DOM
     code means the accordion can grow without touching the rendering logic.

       question  the visible question text
       answer    the visible answer text
     ========================================================================= */
  const FAQS = [
    {
      question: 'What is web development?',
      answer: 'Web development is the process of building and maintaining websites and web applications using technologies such as HTML, CSS, and JavaScript.'
    },
    {
      question: 'What is the difference between HTML, CSS, and JavaScript?',
      answer: 'HTML structures webpage content, CSS controls its appearance and layout, and JavaScript adds interactivity and dynamic behavior.'
    },
    {
      question: 'Is this FAQ accordion responsive?',
      answer: 'Yes. The layout adapts to different screen sizes, including mobile phones, tablets, and desktop computers.'
    },
    {
      question: 'How does an FAQ accordion work?',
      answer: 'An FAQ accordion lets users expand a question to read its answer and collapse it when they no longer need it.'
    },
    {
      question: 'Can multiple answers remain open simultaneously?',
      answer: 'The accordion supports a single-open mode by default. Structure the JavaScript so the behavior can easily be changed to allow multiple open answers.'
    },
    {
      question: 'Which technologies are used in this project?',
      answer: 'This project uses HTML5 for structure, CSS3 for styling and animation, and vanilla JavaScript for interactive behavior.'
    },
    {
      question: 'Does this project require a backend?',
      answer: 'No. All FAQ content and interactions run directly in the browser without a server or database.'
    },
    {
      question: 'What is DOM manipulation in JavaScript?',
      answer: 'DOM manipulation means accessing and modifying webpage elements through JavaScript to change their content, attributes, styles, or behavior.'
    },
    {
      question: 'How can I add more questions?',
      answer: 'Add another FAQ item to the HTML using the same structure and provide its question and answer. The existing JavaScript should support new items automatically.'
    },
    {
      question: 'Can this component be reused on another website?',
      answer: 'Yes. Its HTML, CSS, and JavaScript can be adapted for help centers, documentation pages, product websites, and other interfaces.'
    }
  ];

  /* Set to true to allow more than one answer open at the same time. */
  const ALLOW_MULTIPLE_OPEN = false;

  /* =========================================================================
     2. RENDERING
     ========================================================================= */
  const dom = {};

  function cacheDom() {
    dom.list = document.getElementById('faqList');
    dom.count = document.getElementById('faqCount');
  }

  /* Escapes text so it can safely be placed into an attribute. */
  function escapeAttr(value) {
    return String(value).replace(/"/g, '&quot;');
  }

  /* Builds one accordion list item: a <button> question plus an answer panel.
     Every panel gets a unique id and every button uses aria-controls + 
     aria-expanded so assistive technologies can associate the two. */
  function buildItem(item, index) {
    const id = 'faq-answer-' + index;
    const buttonId = 'faq-question-' + index;

    const li = document.createElement('li');
    li.className = 'faq__item';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'faq__btn';
    button.id = buttonId;
    button.setAttribute('aria-controls', id);
    button.setAttribute('aria-expanded', 'false');

    const question = document.createElement('span');
    question.className = 'faq__question';
    question.textContent = item.question;

    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '+';

    button.appendChild(question);
    button.appendChild(icon);

    const panel = document.createElement('div');
    panel.className = 'faq__panel';
    panel.id = id;

    const paragraph = document.createElement('p');
    paragraph.textContent = item.answer;

    panel.appendChild(paragraph);
    li.appendChild(button);
    li.appendChild(panel);

    return li;
  }

  function renderFaqs() {
    const fragment = document.createDocumentFragment();

    FAQS.forEach(function (item, index) {
      fragment.appendChild(buildItem(item, index));
    });

    dom.list.appendChild(fragment);
    dom.count.textContent = String(FAQS.length);
  }

  /* =========================================================================
     3. ACCORDION
     ========================================================================= */

  /* Closes every open item except the one that should stay open. */
  function closeAll(exceptElement) {
    const items = dom.list.querySelectorAll('.faq__item');
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item === exceptElement) continue;
      closeItem(item);
    }
  }

  function closeItem(item) {
    const button = item.querySelector('.faq__btn');
    const panel = item.querySelector('.faq__panel');
    const icon = item.querySelector('.icon');

    if (!button || !panel) return;

    item.classList.remove('is-active');
    button.setAttribute('aria-expanded', 'false');
    panel.style.maxHeight = '0';
    panel.style.opacity = '0';
    panel.style.paddingTop = '0';
    panel.style.paddingBottom = '0';
    if (icon) icon.textContent = '+';
  }

  function openItem(item) {
    const button = item.querySelector('.faq__btn');
    const panel = item.querySelector('.faq__panel');
    const icon = item.querySelector('.icon');

    if (!button || !panel) return;

    item.classList.add('is-active');
    button.setAttribute('aria-expanded', 'true');

    /* Measure the real content height so the transition never clips text. */
    const fullHeight = panel.scrollHeight + 'px';
    panel.style.maxHeight = fullHeight;
    panel.style.opacity = '1';
    panel.style.paddingTop = '';
    panel.style.paddingBottom = '';
    if (icon) icon.textContent = '−';
  }

  /* Toggles one item. In single-open mode every other item closes first. */
  function toggleItem(item) {
    const isActive = item.classList.contains('is-active');

    if (!ALLOW_MULTIPLE_OPEN && !isActive) {
      closeAll(item);
    }

    if (isActive) {
      closeItem(item);
    } else {
      openItem(item);
    }
  }

  /* =========================================================================
     4. EVENTS
     ========================================================================= */
  function bindEvents() {
    /* One delegated listener for every question — no per-item bindings. */
    dom.list.addEventListener('click', function (event) {
      const button = event.target.closest('.faq__btn');
      if (!button || !dom.list.contains(button)) return;

      const item = button.closest('.faq__item');
      if (!item) return;

      toggleItem(item);
    });

    /* Enter / Space on a focused button toggles the item (native button
       behaviour already does this, but we keep the handler explicit for
       clarity and to guarantee aria state stays in sync). */
    dom.list.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const button = event.target.closest('.faq__btn');
      if (!button) return;
      event.preventDefault();
      const item = button.closest('.faq__item');
      if (item) toggleItem(item);
    });
  }

  /* =========================================================================
     5. START
     ========================================================================= */
  function init() {
    cacheDom();
    renderFaqs();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Exposed for console-based testing only — nothing else reads it. */
  window.faqApp = {
    faqs: FAQS,
    toggleItem: toggleItem,
    closeAll: closeAll,
    allowMultipleOpen: ALLOW_MULTIPLE_OPEN
  };

}());
