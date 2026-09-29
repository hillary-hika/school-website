
const API = (
  window.CHEPTULEL_API ||
  'http://127.0.0.1:5000/api'
).replace(/\/$/, '');


// --------------------------------------------------
// Build correct image/file URLs
// --------------------------------------------------

function assetUrl(value) {
  if (!value) return '';

  const url = String(value);

  // Already a complete URL
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  // Backend normally returns:
  // /api/uploads/filename.jpg
  if (url.startsWith('/api/')) {
    return `http://127.0.0.1:5000${url}`;
  }

  // If it returns:
  // /uploads/filename.jpg
  if (url.startsWith('/uploads/')) {
    return `http://127.0.0.1:5000/api${url}`;
  }

  // If only the filename was returned
  return `http://127.0.0.1:5000/api/uploads/${url.replace(/^\/+/, '')}`;
}


// --------------------------------------------------
// Mobile navigation
// --------------------------------------------------

const toggle = document.querySelector('.menu-toggle');
const navWrap = document.querySelector('.nav-wrap');

toggle?.addEventListener('click', () => {
  navWrap?.classList.toggle('menu-open');
});

document.querySelectorAll('.nav a').forEach((a) => {
  a.addEventListener('click', () => {
    navWrap?.classList.remove('menu-open');
  });
});


// --------------------------------------------------
// Footer year
// --------------------------------------------------

const yearElement = document.getElementById('year');

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


// --------------------------------------------------
// Security helper
// --------------------------------------------------

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[character]));


// --------------------------------------------------
// Money formatter
// --------------------------------------------------

const money = (value) => {
  const number = Number(value);

  return number > 0
    ? `KES ${number.toLocaleString()}`
    : 'To be confirmed';
};


// --------------------------------------------------
// Load public school data
// --------------------------------------------------

async function load() {
  try {
    const response = await fetch(`${API}/public`);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    console.log(
      'Cheptulel public API data loaded:',
      data
    );

    render(data);

  } catch (error) {
    console.warn(
      'API unavailable. Start the Flask backend to load live content.',
      error
    );
  }
}


// --------------------------------------------------
// Render website data
// --------------------------------------------------

function render(db) {

  // ================================================
  // DEVELOPMENT PROJECTS
  // ================================================

  const projectContainer =
    document.querySelector('.project-grid');

  if (
    projectContainer &&
    Array.isArray(db.projects) &&
    db.projects.length
  ) {

    projectContainer.innerHTML = db.projects
      .map((project) => {

        const target =
          Number(project.target || 0);

        const raised =
          Number(project.raised || 0);

        const progress =
          target > 0
            ? Math.min(
                100,
                Math.round((raised / target) * 100)
              )
            : 0;

        const image = project.image
          ? `
            <img
              src="${esc(assetUrl(project.image))}"
              alt="${esc(
                project.name ||
                'School development project'
              )}"
              loading="lazy"
            >
          `
          : '🏗️';

        const projectName =
          String(
            project.name ||
            'Development Project'
          ).replace(/'/g, '&#039;');

        return `
          <article class="project-card">

            <div class="project-image">

              ${image}

              <span>
                ${esc(
                  project.status ||
                  'PROPOSED'
                )}
              </span>

            </div>

            <div class="project-body">

              <div class="project-meta">

                <span>
                  ${esc(
                    project.category ||
                    'DEVELOPMENT'
                  )}
                </span>

                <span>
                  ${progress}% FUNDED
                </span>

              </div>

              <h3>
                ${esc(
                  project.name ||
                  'Development Project'
                )}
              </h3>

              <p>
                ${esc(
                  project.description || ''
                )}
              </p>

              <div class="progress-label">

                <span>
                  Funding progress
                </span>

                <b>
                  ${progress}%
                </b>

              </div>

              <div class="progress">
                <i style="width:${progress}%"></i>
              </div>

              <div class="money">

                <span>
                  Target
                  <b>
                    ${money(target)}
                  </b>
                </span>

                <span>
                  Raised
                  <b>
                    ${money(raised)}
                  </b>
                </span>

              </div>

              ${
                project.update
                  ? `
                    <p class="project-update">
                      <b>
                        Latest update:
                      </b>
                      ${esc(project.update)}
                    </p>
                  `
                  : ''
              }

              <a
                class="btn btn-outline"
                href="#contact"
                onclick="prefillSupport('${projectName}')"
              >
                Support this project
              </a>

            </div>

          </article>
        `;
      })
      .join('');
  }


  // ================================================
  // GALLERY
  // ================================================

  const galleryContainer =
    document.querySelector('.gallery-grid');

  if (
    galleryContainer &&
    Array.isArray(db.gallery) &&
    db.gallery.length
  ) {

    galleryContainer.innerHTML =
      db.gallery
        .slice(0, 12)
        .map((photo, index) => {

          const imageUrl =
            assetUrl(photo.url);

          return `
            <div
              class="gallery-item ${
                index === 0 ? 'large' : ''
              }"
            >

              <img
                src="${esc(imageUrl)}"
                alt="${esc(
                  photo.title ||
                  'Cheptulel Boys Senior School'
                )}"
                loading="lazy"
                onerror="this.parentElement.classList.add('image-error')"
              >

              <div class="gallery-caption">

                <small>
                  ${esc(
                    photo.category ||
                    'School Life'
                  )}

                  ${
                    photo.title
                      ? ` · ${esc(photo.title)}`
                      : ''
                  }
                </small>

              </div>

            </div>
          `;
        })
        .join('');
  }


  // ================================================
  // NEWS
  // ================================================

  const newsContainer =
    document.querySelector('.news-grid');

  if (
    newsContainer &&
    Array.isArray(db.news) &&
    db.news.length
  ) {

    newsContainer.innerHTML =
      db.news
        .slice(0, 6)
        .map((article) => {

          return `
            <article class="news-card">

              <div class="news-date">
                ${esc(
                  article.category ||
                  'NEWS'
                )}
              </div>

              <h3>
                ${esc(
                  article.title || ''
                )}
              </h3>

              <p>
                ${esc(
                  article.body || ''
                )}
              </p>

              <a href="#contact">
                Contact school →
              </a>

            </article>
          `;
        })
        .join('');
  }


  // ================================================
  // SCHOOL CONTACT SETTINGS
  // ================================================

  const settings =
    db.settings || {};

  document
    .querySelectorAll('.contact-list p')
    .forEach((element) => {

      const text =
        element.textContent || '';

      if (
        text.includes('Phone') &&
        settings.phone
      ) {

        element.innerHTML = `
          <b>Phone</b>
          <br>
          ${esc(settings.phone)}
        `;
      }

      if (
        text.includes('Email') &&
        settings.email
      ) {

        element.innerHTML = `
          <b>Email</b>
          <br>
          ${esc(settings.email)}
        `;
      }

      if (
        text.includes('Location') &&
        settings.address
      ) {

        element.innerHTML = `
          <b>Location</b>
          <br>
          ${esc(settings.address)}
        `;
      }

    });
}


// --------------------------------------------------
// Support project helper
// --------------------------------------------------

window.prefillSupport = function (projectName) {

  setTimeout(() => {

    const supportArea =
      document.querySelector('#support-area');

    if (supportArea) {

      supportArea.value =
        `Support project: ${projectName}`;

    }

  }, 50);
};


// --------------------------------------------------
// Contact / enquiry form
// --------------------------------------------------

async function submitForm(event) {

  event.preventDefault();

  const form =
    event.target;

  const inputs =
    form.querySelectorAll('input');

  const name =
    inputs[0]?.value || '';

  const email =
    inputs[1]?.value || '';

  const supportArea =
    form.querySelector(
      '#support-area'
    )?.value ||
    'General enquiry';

  const message =
    form.querySelector(
      'textarea'
    )?.value || '';

  const formMessage =
    document.getElementById(
      'form-message'
    );


  const payload = {
    name: name,
    email: email,
    support_area: supportArea,
    message: message
  };


  try {

    if (formMessage) {
      formMessage.textContent =
        'Sending your enquiry...';
    }


    const response =
      await fetch(
        `${API}/enquiries`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body:
            JSON.stringify(payload)
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        'Failed to submit enquiry'
      );
    }


    if (formMessage) {

      formMessage.textContent =
        'Thank you. Your enquiry has been received by the school.';
    }


    form.reset();


  } catch (error) {

    console.error(
      'Enquiry submission error:',
      error
    );


    if (formMessage) {

      formMessage.textContent =
        'We could not send the enquiry. Please try again or contact the school directly.';
    }

  }
}


window.submitForm =
  submitForm;


// --------------------------------------------------
// Start application
// --------------------------------------------------

load();

