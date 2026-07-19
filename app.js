/* ==========================================================================
   AURELIUS LUXURY BARBERSHOP INTERACTION LOGIC (GSAP & VANILLA JS)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Smooth Scroll is native (Lenis smooth scroll removed by request)

    // 2. Custom Cursor Follower with GSAP
    const cursor = document.querySelector(".custom-cursor");
    const cursorDot = document.querySelector(".custom-cursor-dot");
    
    if (cursor && cursorDot && window.innerWidth > 600) {
        let mouseX = 0, mouseY = 0;
        let ballX = 0, ballY = 0;
        let dotX = 0, dotY = 0;

        window.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Instantly move the dot
            gsap.set(cursorDot, { x: mouseX, y: mouseY });
        });

        // Smoothly interpolate the outer ring (lag effect)
        gsap.ticker.add(() => {
            const dt = 1.0 - Math.pow(0.15, gsap.ticker.deltaRatio());
            ballX += (mouseX - ballX) * 0.15;
            ballY += (mouseY - ballY) * 0.15;
            
            gsap.set(cursor, { x: ballX, y: ballY });
        });

        // Hover expansions
        const hoverTargets = document.querySelectorAll(
            "a, button, .btn, .service-card, .gallery-item, .barber-card, .faq-trigger, input, select, textarea"
        );

        hoverTargets.forEach((target) => {
            target.addEventListener("mouseenter", () => {
                cursor.classList.add("hovered");
                gsap.to(cursorDot, { scale: 2, backgroundColor: "#FFFFFF", duration: 0.3 });
            });
            target.addEventListener("mouseleave", () => {
                cursor.classList.remove("hovered");
                gsap.to(cursorDot, { scale: 1, backgroundColor: "#D6B36A", duration: 0.3 });
            });
        });
    }

    // 3. Navbar scroll styling
    const navbar = document.getElementById("navbar");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
        
        // Highlight active link based on scroll position
        let currentSectionId = "";
        const sections = document.querySelectorAll("section");
        
        sections.forEach((sec) => {
            const top = sec.offsetTop - 120;
            const height = sec.offsetHeight;
            if (window.scrollY >= top && window.scrollY < top + height) {
                currentSectionId = sec.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSectionId}`) {
                link.classList.add("active");
            }
        });
    });

    // 4. Mobile Menu Toggling
    const hamburger = document.getElementById("hamburger-menu");
    const mobileMenu = document.getElementById("mobile-menu");

    if (hamburger && mobileMenu) {
        hamburger.addEventListener("click", (e) => {
            e.stopPropagation(); // prevent triggering click-away logic
            hamburger.classList.toggle("active");
            mobileMenu.classList.toggle("active");
            
            // Toggle body scroll
            if (mobileMenu.classList.contains("active")) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "";
            }
        });

        // Close the menu overlay when clicking anywhere inside it
        mobileMenu.addEventListener("click", () => {
            hamburger.classList.remove("active");
            mobileMenu.classList.remove("active");
            document.body.style.overflow = "";
        });
    }

    // 5. Cinematic 50-Image Frame Sequence Loop (Rotating Barber Pole Video effect)
    const slideshowContainer = document.getElementById("hero-slideshow");
    
    if (slideshowContainer) {
        // Create and style canvas
        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        slideshowContainer.appendChild(canvas);
        const ctx = canvas.getContext("2d");

        const totalFrames = 50;
        const images = [];
        let loadedCount = 0;
        let isAllLoaded = false;
        let frameProgress = 0;
        const framesPerSecond = 8; // Slower speed: 8 frames rotation per second
        let lastTime = 0;

        // Preload the very first frame to render immediately
        const firstImg = new Image();
        firstImg.src = "barberpole/Barber_pole_rotating_on_wall_202607181138_000.jpg";
        firstImg.onload = () => {
            if (!isAllLoaded) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawFrame(firstImg);
            }
        };

        // Load all 50 frames
        for (let i = 0; i < totalFrames; i++) {
            const num = String(i).padStart(3, '0');
            const img = new Image();
            img.src = `barberpole/Barber_pole_rotating_on_wall_202607181138_${num}.jpg`;
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalFrames) {
                    isAllLoaded = true;
                    startVideoLoop();
                }
            };
            images.push(img);
        }

        // Function to draw image with object-fit: cover equivalent in canvas (NO clearRect inside!)
        function drawFrame(img) {
            if (!ctx || !img) return;
            const w = canvas.width;
            const h = canvas.height;
            const iw = img.width;
            const ih = img.height;
            if (w === 0 || h === 0 || iw === 0 || ih === 0) return;

            const r = Math.min(w / iw, h / ih);
            let nw = iw * r;
            let nh = ih * r;
            let ar = 1;

            if (nw < w) ar = w / nw;
            if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
            nw *= ar;
            nh *= ar;

            const cw = iw / (nw / w);
            const ch = ih / (nh / h);

            const cx = (iw - cw) * 0.5;
            const cy = (ih - ch) * 0.5;

            ctx.drawImage(img, cx, cy, cw, ch, 0, 0, w, h);
        }

        // Coordinate crossfading drawing between active frames
        function drawInterpolatedFrame(progress) {
            if (!ctx) return;
            const w = canvas.width;
            const h = canvas.height;
            if (w === 0 || h === 0) return;

            const idxA = Math.floor(progress) % totalFrames;
            const idxB = (idxA + 1) % totalFrames;
            const alpha = progress - Math.floor(progress);

            const imgA = images[idxA];
            const imgB = images[idxB];

            ctx.clearRect(0, 0, w, h);

            // Draw primary frame (opacity: 1)
            if (imgA && imgA.complete) {
                ctx.globalAlpha = 1.0;
                drawFrame(imgA);
            }

            // Draw next frame on top (opacity: alpha) for buttery smooth transition
            if (imgB && imgB.complete && alpha > 0.01) {
                ctx.globalAlpha = alpha;
                drawFrame(imgB);
            }

            ctx.globalAlpha = 1.0; // reset
        }

        function resizeCanvas() {
            canvas.width = canvas.clientWidth * window.devicePixelRatio;
            canvas.height = canvas.clientHeight * window.devicePixelRatio;
            
            if (isAllLoaded) {
                drawInterpolatedFrame(frameProgress);
            } else if (firstImg.complete) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawFrame(firstImg);
            }
        }

        window.addEventListener("resize", resizeCanvas);
        // Wait for layout rendering to get correct dimensions
        setTimeout(resizeCanvas, 100);

        // Video playback tick (60 FPS loop that calculates interpolation between frames)
        function startVideoLoop() {
            requestAnimationFrame(tick);
        }

        function tick(timestamp) {
            if (!lastTime) lastTime = timestamp;
            const elapsed = timestamp - lastTime;
            lastTime = timestamp;

            // Increment frame progress dynamically based on time delta
            frameProgress = (frameProgress + (framesPerSecond / 1000) * elapsed) % totalFrames;
            drawInterpolatedFrame(frameProgress);

            requestAnimationFrame(tick);
        }
    }

    // 6. GSAP Scroll Trigger reveals
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Animate navbar on load
        gsap.from(".navbar", {
            y: -50,
            opacity: 0,
            duration: 1.2,
            ease: "power4.out"
        });

        // Animate hero texts on load
        gsap.from(".hero-label", {
            y: 20,
            opacity: 0,
            duration: 1,
            delay: 0.2,
            ease: "power3.out"
        });
        
        gsap.from(".hero-headline", {
            y: 40,
            opacity: 0,
            duration: 1.2,
            delay: 0.4,
            ease: "power4.out"
        });

        gsap.from(".hero-desc", {
            y: 20,
            opacity: 0,
            duration: 1,
            delay: 0.6,
            ease: "power3.out"
        });

        gsap.from(".hero-ctas", {
            y: 20,
            opacity: 0,
            duration: 1,
            delay: 0.8,
            ease: "power3.out"
        });

        // Trigger animations for sections
        const revealElements = document.querySelectorAll(".animate-reveal");
        
        revealElements.forEach((el) => {
            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%", // when the top of the element hits 85% of the viewport height
                    toggleActions: "play none none none"
                },
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 1,
                ease: "power2.out"
            });
        });
    } else {
        // Fallback using Intersection Observer if GSAP is not loaded
        const revealElements = document.querySelectorAll(".animate-reveal");
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                    entry.target.style.filter = "blur(0px)";
                    entry.target.style.transition = "opacity 1s ease-out, transform 1s ease-out, filter 1s ease-out";
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealElements.forEach(el => observer.observe(el));
    }

    // 7. Lightbox functionality for Gallery
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxClose = document.getElementById("lightbox-close");
    const galleryItems = document.querySelectorAll(".gallery-item");

    if (lightbox && lightboxImg && lightboxClose) {
        galleryItems.forEach(item => {
            item.addEventListener("click", () => {
                const imgSrc = item.dataset.img;
                lightboxImg.src = imgSrc;
                lightbox.classList.add("active");
                document.body.style.overflow = "hidden"; // Lock scroll
            });
        });

        lightboxClose.addEventListener("click", () => {
            lightbox.classList.remove("active");
            document.body.style.overflow = ""; // Restore scroll
        });

        // Close lightbox on click outside the image
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove("active");
                document.body.style.overflow = "";
            }
        });
    }

    // 8. Testimonials Review Slider
    const testiSlides = document.querySelectorAll(".testimonial-slide");
    const testiDotsContainer = document.getElementById("testimonial-dots");
    const prevTestiBtn = document.getElementById("prev-testi");
    const nextTestiBtn = document.getElementById("next-testi");
    let currentTestiIdx = 0;
    let testiInterval;

    if (testiSlides.length > 0) {
        // Generate dots dynamically if container exists
        if (testiDotsContainer) {
            testiDotsContainer.innerHTML = "";
            testiSlides.forEach((_, idx) => {
                const dot = document.createElement("span");
                dot.classList.add("dot");
                if (idx === 0) dot.classList.add("active");
                dot.setAttribute("data-index", idx);
                testiDotsContainer.appendChild(dot);
            });
        }

        const testiDots = document.querySelectorAll(".dot");

        function showTestiSlide(index) {
            testiSlides.forEach(slide => slide.classList.remove("active"));
            testiDots.forEach(dot => dot.classList.remove("active"));
            
            if (testiSlides[index]) testiSlides[index].classList.add("active");
            if (testiDots[index]) testiDots[index].classList.add("active");
            currentTestiIdx = index;
        }

        function nextTestiSlide() {
            let nextIndex = (currentTestiIdx + 1) % testiSlides.length;
            showTestiSlide(nextIndex);
        }

        function startTestiAutoPlay() {
            testiInterval = setInterval(nextTestiSlide, 6000);
        }

        function resetTestiTimer() {
            clearInterval(testiInterval);
            startTestiAutoPlay();
        }

        if (nextTestiBtn && prevTestiBtn) {
            nextTestiBtn.addEventListener("click", () => {
                let nextIndex = (currentTestiIdx + 1) % testiSlides.length;
                showTestiSlide(nextIndex);
                resetTestiTimer();
            });

            prevTestiBtn.addEventListener("click", () => {
                let prevIndex = (currentTestiIdx - 1 + testiSlides.length) % testiSlides.length;
                showTestiSlide(prevIndex);
                resetTestiTimer();
            });
        }

        testiDots.forEach(dot => {
            dot.addEventListener("click", (e) => {
                const targetIdx = parseInt(e.target.dataset.index);
                showTestiSlide(targetIdx);
                resetTestiTimer();
            });
        });

        // Start autoplay
        startTestiAutoPlay();
    }

    // 9. FAQ Accordion panel expansion
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {
        const trigger = item.querySelector(".faq-trigger");
        const panel = item.querySelector(".faq-panel");

        if (trigger && panel) {
            trigger.addEventListener("click", () => {
                const isActive = item.classList.contains("active");
                
                // Collapse all other FAQ panels first
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove("active");
                    const otherPanel = otherItem.querySelector(".faq-panel");
                    if (otherPanel) {
                        otherPanel.style.maxHeight = null;
                    }
                });

                // Toggle selected FAQ panel
                if (!isActive) {
                    item.classList.add("active");
                    panel.style.maxHeight = panel.scrollHeight + "px";
                } else {
                    item.classList.remove("active");
                    panel.style.maxHeight = null;
                }
            });
        }
    });

    // 10. Booking form request handling (mock server post)
    const bookingForm = document.getElementById("booking-form");
    const successToast = document.getElementById("booking-success");

    if (bookingForm && successToast) {
        // Set minimum date picker values to today
        const dateInput = document.getElementById("booking-date");
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
        }

        bookingForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            // Get form values (could be sent to server)
            const formData = new FormData(bookingForm);
            const name = formData.get("name");
            const phone = formData.get("phone");
            const service = formData.get("service");
            const date = formData.get("date");
            const time = formData.get("time");

            // Perform simple check
            if (name && phone && service && date && time) {
                // Show success toast
                successToast.style.display = "flex";
                
                // Reset form fields
                bookingForm.reset();

                // Smooth scroll down to success message
                successToast.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Hide success message after 8 seconds
                setTimeout(() => {
                    successToast.style.opacity = "0";
                    setTimeout(() => {
                        successToast.style.display = "none";
                        successToast.style.opacity = "";
                    }, 500);
                }, 8000);
            }
        });
    }

    // 11. Prótese Capilar Balloon Popup Logic
    const proteseCard = document.getElementById("protese-card");
    const proteseBalloon = document.getElementById("protese-balloon");
    const balloonClose = document.getElementById("protese-balloon-close");
    
    if (proteseCard && proteseBalloon) {
        // Toggle active class on click
        proteseCard.addEventListener("click", (e) => {
            if (e.target.closest("#protese-balloon-close")) return;
            proteseCard.classList.toggle("active");
        });

        // Prevent click events inside balloon from toggling card
        proteseBalloon.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        // Close balloon when clicking close button
        if (balloonClose) {
            balloonClose.addEventListener("click", (e) => {
                e.stopPropagation();
                proteseCard.classList.remove("active");
            });
        }

        // Close balloon when clicking anywhere outside
        document.addEventListener("click", (e) => {
            if (!proteseCard.contains(e.target)) {
                proteseCard.classList.remove("active");
            }
        });

        // Tab selection logic inside balloon
        const tabButtons = proteseBalloon.querySelectorAll(".tab-btn");
        const tabContents = proteseBalloon.querySelectorAll(".tab-content");

        tabButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation(); // prevent card toggling
                const targetTab = btn.dataset.tab;

                // Set active tab button
                tabButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                // Set active tab content
                tabContents.forEach(content => {
                    content.classList.remove("active");
                    if (content.id === `tab-${targetTab}`) {
                        content.classList.add("active");
                    }
                });
            });
        });
    }

});
