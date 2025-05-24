document.addEventListener('DOMContentLoaded', function() {
    console.log("Script do carrossel iniciado!");

    const carouselContainer = document.querySelector('.carousel-container');
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator-item');
    const slideIntervalTime = 5000;
    
    let currentSlide = 0;
    let autoRotateInterval;
    let touchStartX = 0;
    let touchEndX = 0;

    const indicatorsContainer = document.querySelector('.carousel-indicators');

    if (slides.length > 0) {
        console.log("Slides encontrados:", slides.length);
        if (indicators.length === slides.length) {
            console.log("Indicadores encontrados:", indicators.length);
        } else {
            console.warn("Número de slides e indicadores não corresponde. Indicadores podem não funcionar corretamente. Slides:", slides.length, "Indicadores:", indicators.length);
        }

        function updateIndicators(activeIndex) {
            if (indicators.length === slides.length) {
                indicators.forEach((indicator, index) => {
                    indicator.classList.toggle('active', index === activeIndex);
                });
            }
        }

        function showSlide(index) {
            slides.forEach((slide) => {
                slide.classList.remove('active');
            });
            
            if (slides[index]) {
                slides[index].classList.add('active');
                updateIndicators(index);
                currentSlide = index;
            } else {
                console.error("Tentativa de mostrar slide com índice inválido:", index);
            }
        }

        function moveToNextSlide() {
            let newIndex = (currentSlide + 1) % slides.length;
            showSlide(newIndex);
        }

        function moveToPrevSlide() {
            let newIndex = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(newIndex);
        }

        function startAutoRotate() {
            clearInterval(autoRotateInterval); 
            if (slides.length > 1) {
                autoRotateInterval = setInterval(moveToNextSlide, slideIntervalTime);
            }
        }

        if (indicators.length === slides.length && slides.length > 1) {
            indicators.forEach(indicator => {
                indicator.addEventListener('click', function() {
                    const slideTo = parseInt(this.dataset.slideTo);
                    if (slideTo !== currentSlide && slides[slideTo]) { 
                        showSlide(slideTo);
                        startAutoRotate(); 
                    }
                });
            });
        }
        
        if (slides.length <= 1) {
            if(indicatorsContainer) indicatorsContainer.classList.add('hidden');
        }

        if (carouselContainer && slides.length > 1) { // Adiciona eventos de touch apenas se houver carrossel e mais de 1 slide
            carouselContainer.addEventListener('touchstart', function(event) {
                touchStartX = event.touches[0].clientX;
            }, { passive: true });

            carouselContainer.addEventListener('touchend', function(event) {
                touchEndX = event.changedTouches[0].clientX;
                handleSwipe();
            }, { passive: true });
        }

        function handleSwipe() {
            const swipeThreshold = 50; 
            const diffX = touchStartX - touchEndX;

            if (Math.abs(diffX) > swipeThreshold) { 
                if (diffX > 0) { 
                    moveToNextSlide();
                } else { 
                    moveToPrevSlide();
                }
                startAutoRotate(); 
            }
        }

        showSlide(0);
        console.log("Primeiro slide (índice 0) deveria estar ativo.");
        startAutoRotate();

    } else {
        console.error("Nenhum elemento .carousel-slide encontrado!");
        if(indicatorsContainer) indicatorsContainer.classList.add('hidden');
    }
});