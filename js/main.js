// Elementos del DOM
const navbar = document.querySelector(".navbar");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const links = document.querySelectorAll(".navbar-link");
const sections = document.querySelectorAll("section");

// Navbar Scroll Effect
window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }

    // Active Link Highlighting
    let current = "";
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 150)) {
            current = section.getAttribute("id");
        }
    });

    links.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href").includes(current)) {
            link.classList.add("active");
        }
    });
});

// Mobile Menu Toggle
menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    const icon = menuToggle.querySelector("i");
    if(navLinks.classList.contains("active")) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
    } else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
    }
});

// Cerrar menú al hacer clic en un enlace (Móvil)
links.forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        const icon = menuToggle.querySelector("i");
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
    });
});

// Animaciones Suaves de Entrada (Optional Intersection Observer for scroll animations)
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.style.opacity = 1;
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Aplicar estilos iniciales a elementos para animar
document.querySelectorAll('.glass-card, .section-header').forEach(el => {
    el.style.opacity = 0;
    el.style.transform = "translateY(30px)";
    el.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
    observer.observe(el);
});

/* 
   =========================================================================
   SERVICIOS (MIMIC ASP.NET CORE LOGIC)
   ========================================================================= 
   Aquí implementamos una arquitectura similar a la de ASP.NET Core, 
   separando la lógica de envío en un servicio dedicado.
*/

class EmailService {
    constructor() {
        this.endpoint = 'https://formspree.io/f/mqengowl';
    }

    async enviarMensaje(datos) {
        try {
            // Usamos FormData para máxima compatibilidad con Formspree
            const formData = new FormData();
            formData.append('name', datos.name);
            formData.append('email', datos.email);
            formData.append('message', datos.message);

            const response = await fetch(this.endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                    // Nota: El navegador añade el Content-Type correcto para FormData
                }
            });

            if (response.ok) {
                return { ok: true, error: null };
            } else {
                const errorData = await response.json();
                return { 
                    ok: false, 
                    error: errorData.error || 'Error en el servidor de correos.' 
                };
            }
        } catch (error) {
            console.error("EmailService Error:", error);
            return {
                ok: false,
                error: 'Error de conexión. Verifica tu internet.'
            };
        }
    }
}

// "Inyección" del servicio
const servicioEmail = new EmailService();

/* 
   =========================================================================
   LÓGICA DEL FORMULARIO DE CONTACTO
   ========================================================================= 
*/

const contactForm = document.getElementById('contact-form');
const submitBtn = document.querySelector('.btn-submit');
const formStatus = document.getElementById('form-status');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Limpiar estados previos
        formStatus.className = 'form-respuesta';
        formStatus.style.display = 'none';

        const originalBtnContent = submitBtn.innerHTML;

        // Feedback visual (Estado: Enviando...)
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Enviando... <i class="fas fa-spinner fa-spin"></i>';

        // Recolectar datos del formulario
        const formData = new FormData(contactForm);
        const datos = {
            name: formData.get('nombre'),
            email: formData.get('email'),
            message: formData.get('mensaje')
        };

        // LLAMADA AL SERVICIO (Igual que en tu controlador de ASP.NET)
        const resultado = await servicioEmail.enviarMensaje(datos);

        if (resultado.ok) {
            // Éxito: Feedback premium
            formStatus.innerHTML = '<i class="fas fa-check-circle"></i> ¡Mensaje enviado! Me pondré en contacto pronto.';
            formStatus.className = 'form-respuesta success anim-fade-in';
            formStatus.style.display = 'flex';
            contactForm.reset();
            
            // Ocultar mensaje después de 5 segundos
            setTimeout(() => {
                formStatus.style.display = 'none';
            }, 5000);
        } else {
            // Error
            formStatus.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${resultado.error}`;
            formStatus.className = 'form-respuesta error anim-fade-in';
            formStatus.style.display = 'flex';
        }

        // Restaurar botón
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;
    });
}

