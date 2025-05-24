document.addEventListener('DOMContentLoaded', function() {
    console.log("Script do carrossel iniciado!");

    const carouselContainer = document.querySelector('.carousel-container');
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator-item');
    const slideIntervalTime = 5000;
    
    let currentSlide = 0;
    let autoRotateInterval;
    
    // Variáveis para o swipe
    let touchStartX = 0;
    let touchStartY = 0; // Para ajudar a diferenciar swipe de scroll vertical
    let touchEndX = 0;

    const indicatorsContainer = document.querySelector('.carousel-indicators');

    if (slides.length > 0) {
        console.log("Slides encontrados:", slides.length);

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

        // Configuração dos listeners dos indicadores
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

        // Touch events para mobile/touch
        if (carouselContainer && slides.length > 1) {
            carouselContainer.addEventListener('touchstart', function(event) {
                touchStartX = event.touches[0].clientX;
                touchStartY = event.touches[0].clientY; // Captura Y inicial
                // console.log('Touch start X:', touchStartX, 'Y:', touchStartY);
            }, { passive: true }); // passive:true é geralmente ok para touchstart

            carouselContainer.addEventListener('touchmove', function(event) {
                // Se quisermos previnir o scroll vertical durante um swipe horizontal claro,
                // precisaríamos de { passive: false } e chamar event.preventDefault() aqui
                // condicionalmente. Por ora, vamos manter simples.
                // A lógica principal será no touchend.
            }, { passive: true });


            carouselContainer.addEventListener('touchend', function(event) {
                if (touchStartX === 0) { // Se não houve touchstart (ex: toque muito breve ou erro)
                    return;
                }
                touchEndX = event.changedTouches[0].clientX;
                let touchEndY = event.changedTouches[0].clientY; // Captura Y final
                // console.log('Touch end X:', touchEndX, 'Y:', touchEndY);
                handleSwipe(touchEndY); // Passa touchEndY para a função

                // Reseta os pontos de início para o próximo swipe
                touchStartX = 0;
                touchStartY = 0;
            }, { passive: true });
        }

        function handleSwipe(currentTouchEndY) {
            const swipeThresholdX = 40;  // Mínimo de pixels horizontais para considerar swipe
            const swipeThresholdY = 60;  // Máximo de pixels verticais para ainda ser um swipe horizontal

            let diffX = touchStartX - touchEndX;
            let diffY = Math.abs(touchStartY - currentTouchEndY); // Diferença vertical absoluta

            // console.log(`Swipe attempt: diffX=${diffX}, diffY=${diffY}`);

            // Verifica se é predominantemente horizontal e excede o threshold horizontal
            if (Math.abs(diffX) > swipeThresholdX && diffY < swipeThresholdY) {
                console.log("Swipe horizontal detectado!");
                if (diffX > 0) { // Swiped left (arrastou da direita para a esquerda)
                    console.log('Swipe para esquerda -> Próximo slide');
                    moveToNextSlide();
                } else { // Swiped right (arrastou da esquerda para a direita)
                    console.log('Swipe para direita -> Slide anterior');
                    moveToPrevSlide();
                }
                startAutoRotate(); // Reinicia o timer da rotação automática
            } else {
                // console.log("Não foi um swipe horizontal válido.");
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