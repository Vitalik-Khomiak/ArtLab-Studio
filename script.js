const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let particlesArray;

// Resize canvas to fill screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = {
    x: null,
    y: null,
    // radius removed/unused, handled locally in update() for better control
}

window.addEventListener('mousemove',
    function (event) {
        mouse.x = event.x;
        mouse.y = event.y;
    }
);

class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        // Check if particle is still within canvas
        if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
            this.directionY = -this.directionY;
        }

        // Check collision detection - mouse position / particle position
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // Reduced radius and softer repulsion
        let interactionRadius = 100;

        if (distance < interactionRadius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (interactionRadius - distance) / interactionRadius;
            const directionX = forceDirectionX * force * 3; // Nudge speed
            const directionY = forceDirectionY * force * 3;

            if (this.x - directionX > 0 && this.x - directionX < canvas.width) {
                this.x -= directionX;
            }
            if (this.y - directionY > 0 && this.y - directionY < canvas.height) {
                this.y -= directionY;
            }
        }

        // Move particle
        this.x += this.directionX;
        this.y += this.directionY;

        this.draw();
    }
}

function init() {
    particlesArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 9000;
    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1; // Particle size
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 0.4) - 0.2; // Slow speed
        let directionY = (Math.random() * 0.4) - 0.2;
        let color = '#fff'; // White particles

        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connect();
}

// Draw lines between particles that are close enough
function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));

            if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                opacityValue = 1 - (distance / 20000);
                // Light blue accent
                ctx.strokeStyle = 'rgba(100, 149, 237,' + opacityValue * 0.15 + ')';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

// Adjust canvas on resize
window.addEventListener('resize',
    function () {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        init();
    }
);

// Remove mouse radius on mouse out
window.addEventListener('mouseout',
    function () {
        mouse.x = undefined;
        mouse.y = undefined;
    }
)

init();
animate();

// --- Carousel & Modal Logic ---

document.addEventListener('DOMContentLoaded', () => {
    // Canvas resize fix
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // --- Carousel Logic ---
    const track = document.querySelector('.carousel-track');
    const cards = Array.from(document.querySelectorAll('.project-card'));
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');

    if (!track || cards.length === 0) return;

    let currentIndex = 0; // Start at the first item

    const updateCarousel = () => {
        cards.forEach((card, index) => {
            // Reset classes
            card.className = 'project-card';

            // Calculate distance from center
            // Calculate distance from center with cyclic wrapping
            let diff = index - currentIndex;
            if (diff > cards.length / 2) diff -= cards.length;
            if (diff < -cards.length / 2) diff += cards.length;

            if (diff === 0) {
                card.classList.add('active');
            } else if (diff === 1) {
                card.classList.add('next');
            } else if (diff === -1) {
                card.classList.add('prev');
            } else if (diff > 1) {
                card.classList.add('far-next');
            } else if (diff < -1) {
                card.classList.add('far-prev');
            }
        });
    };

    const nextSlide = () => {
        currentIndex = (currentIndex + 1) % cards.length;
        updateCarousel();
    };

    const prevSlide = () => {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateCarousel();
    };

    // Event Listeners for Nav Buttons
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
    });

    // Click on card to navigate or open modal
    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            if (currentIndex !== index) {
                currentIndex = index;
                updateCarousel();
            } else {
                openModal(card);
            }
        });
    });

    // Initialize Carousel
    updateCarousel();


    // --- Dynamic Modal Logic ---
    const modal = document.getElementById('project-modal');
    const closeBtn = document.querySelector('.close-btn');
    const modalPrevBtn = document.getElementById('modal-prev');
    const modalNextBtn = document.getElementById('modal-next');
    const contactOpenBtn = document.getElementById('contact-open');
    const contactModal = document.getElementById('contact-modal');
    const contactCloseBtn = document.querySelector('.contact-close-btn');

    // Elements to populate
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-description');
    const modalImgContainer = document.getElementById('modal-image-container');
    const modalThumbnails = document.getElementById('modal-thumbnails');

    const openModal = (card) => {
        const title = card.getAttribute('data-title');
        const desc = card.getAttribute('data-desc');
        const galleryData = card.getAttribute('data-gallery');

        // Extract main image URL from style or gallery
        let mainImageUrl;
        const bgImageStyle = card.querySelector('.card-image').style.backgroundImage;
        const bgImageUrl = bgImageStyle.replace('url("', '').replace('")', '');

        // Parse gallery images
        let images = [];
        if (galleryData) {
            images = galleryData.split(',').map(url => url.trim());
        } else {
            images = [bgImageUrl];
        }
        mainImageUrl = images[0];

        modalTitle.textContent = title;
        modalDesc.textContent = desc;

        // Clear previous content
        modalImgContainer.innerHTML = '';
        modalThumbnails.innerHTML = '';

        // Create Container for images
        // Background Blur Image
        const bgImg = document.createElement('img');
        bgImg.src = mainImageUrl;
        bgImg.className = 'blur-bg';
        modalImgContainer.appendChild(bgImg);

        // Main Image
        const mainImg = document.createElement('img');
        mainImg.src = mainImageUrl;
        mainImg.alt = title;
        mainImg.className = 'main-img';
        modalImgContainer.appendChild(mainImg);

        // Generate Thumbnails if there are multiple images
        if (images.length > 1) {
            modalThumbnails.style.display = 'flex';
            images.forEach((imgUrl, index) => {
                const thumb = document.createElement('img');
                thumb.src = imgUrl;
                thumb.className = index === 0 ? 'thumbnail active' : 'thumbnail';
                thumb.addEventListener('click', () => {
                    // Update images
                    mainImg.style.opacity = '0';
                    bgImg.style.opacity = '0';

                    setTimeout(() => {
                        mainImg.src = imgUrl;
                        bgImg.src = imgUrl;
                        mainImg.style.opacity = '1';
                        bgImg.style.opacity = '1';
                    }, 200);

                    // Update active class
                    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                });
                modalThumbnails.appendChild(thumb);
            });
        } else {
            modalThumbnails.style.display = 'none';
        }

        modal.style.display = 'flex';
    };

    // Modal Navigation Handlers
    const showNextProject = (e) => {
        e.stopPropagation(); // Prevent bubbling
        currentIndex = (currentIndex + 1) % cards.length;
        updateCarousel();
        openModal(cards[currentIndex]);
    };

    const showPrevProject = (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateCarousel();
        openModal(cards[currentIndex]);
    };

    if (modalNextBtn) modalNextBtn.addEventListener('click', showNextProject);
    if (modalPrevBtn) modalPrevBtn.addEventListener('click', showPrevProject);

    const closeModal = () => {
        modal.style.display = 'none';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    const openContactModal = () => {
        if (contactModal) {
            contactModal.style.display = 'flex';
            contactModal.setAttribute('aria-hidden', 'false');
        }
    };

    const closeContactModal = () => {
        if (contactModal) {
            contactModal.style.display = 'none';
            contactModal.setAttribute('aria-hidden', 'true');
        }
    };

    if (contactOpenBtn) contactOpenBtn.addEventListener('click', openContactModal);
    if (contactCloseBtn) contactCloseBtn.addEventListener('click', closeContactModal);

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            closeModal();
        }
        if (e.target == contactModal) {
            closeContactModal();
        }
    });


    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Language Switcher Logic ---
    const translations = {
        'en': {
            'nav.home': 'Home',
            'nav.projects': 'Projects',
            'nav.about': 'About',
            'nav.blog': 'Blog',
            'nav-contact': 'Contact Me',
            'header.projects': 'Projects',
            'header.projectsDesc': 'A collection of my 3D works and experiments.',
            'btn.details': 'Details',
            'section.about': 'Who am I?',
            'profile.desc': 'Cg generalist from Lviv 🎬✨',
            'profile.location': 'Lviv, Ukraine',
            'contact.title': 'Ask a Question',
            'contact.subtitle': 'Add your email and question, and I will receive it by email.',
            'contact.email': 'Your email',
            'contact.question': 'Question',
            'contact.submit': 'Send',
            'footer.rights': '© 2026 ArtLab Studio. All rights reserved.'
        },
        'uk': {
            'nav.home': 'Головна',
            'nav.projects': 'Проекти',
            'nav.about': 'Хто я?',
            'nav.blog': 'Блог',
            'nav-contact': 'Зворотній зв\'язок',
            'header.projects': 'Проекти',
            'header.projectsDesc': 'Колекція моїх 3D робіт та експериментів.',
            'btn.details': 'Детальніше',
            'section.about': 'Хто я?',
            'profile.desc': 'Cg generalist зі Львова 🎬✨',
            'profile.location': 'Львів, Україна',
            'contact.title': 'Задати питання',
            'contact.subtitle': 'Напиши свою пошту і питання, я отримаю все на email.',
            'contact.email': 'Твоя пошта',
            'contact.question': 'Питання',
            'contact.submit': 'Надіслати',
            'footer.rights': '© 2026 ArtLab Studio. Всі права захищені.'
        }
    };

    let currentLang = 'uk'; // Default to Ukrainian as per initial content 

    const langBtn = document.getElementById('lang-btn');

    function updateLanguage(lang) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });

        if (langBtn) {
            langBtn.textContent = lang === 'en' ? 'EN' : 'UA';
        }
        currentLang = lang;
    }

    if (langBtn) {
        // Initialize button text
        langBtn.textContent = currentLang === 'en' ? 'EN' : 'UA';

        langBtn.addEventListener('click', () => {
            const newLang = currentLang === 'en' ? 'uk' : 'en';
            updateLanguage(newLang);
        });
    }
});
