(function ($) {
    "use strict";

    var whatsappNumber = "917417522307";

    function buildWhatsAppUrl(topic) {
        var text = "Hello Quest For Education,%0A%0A";
        text += "I am interested in: " + encodeURIComponent(topic || "General inquiry") + ".%0A%0A";
        text += "Parent / Student Name:%0A";
        text += "Child's Age / Class:%0A";
        text += "Phone Number:%0A%0A";
        text += "Please share program details and enrollment information.";
        return "https://wa.me/" + whatsappNumber + "?text=" + text;
    }

    function getActiveTopic() {
        var active = $(".quest-pill.active");
        return active.length ? active.data("topic") : "General inquiry";
    }

    function updateWhatsAppLink() {
        $("#quest-whatsapp-send").attr("href", buildWhatsAppUrl(getActiveTopic()));
    }

    // Smooth scroll for single-page anchor links
    $(document).on("click", 'a[href^="#"]', function (e) {
        var href = this.getAttribute("href");
        if (href === "#" || href.indexOf("#quest-") === 0) return;

        var target = $(href);
        if (target.length) {
            e.preventDefault();
            var offset = $("#header-sticky").outerHeight() || 80;
            $("html, body").animate({
                scrollTop: target.offset().top - offset
            }, 700);
            $(".offcanvas__info").removeClass("info-open");
            $(".offcanvas__overlay").removeClass("overlay-open");
        }
    });

    // Active nav highlight on scroll
    var sections = $("section[id]");
    $(window).on("scroll", function () {
        var scrollPos = $(window).scrollTop() + 120;
        sections.each(function () {
            var section = $(this);
            if (section.offset().top <= scrollPos && section.offset().top + section.outerHeight() > scrollPos) {
                var id = section.attr("id");
                $("#mobile-menu a.nav-link").removeClass("active");
                $('#mobile-menu a.nav-link[href="#' + id + '"]').addClass("active");
            }
        });
    });

    // Inquiry category pills
    $(".quest-pill").on("click", function () {
        $(".quest-pill").removeClass("active");
        $(this).addClass("active");
        updateWhatsAppLink();
    });

    updateWhatsAppLink();

    // Enroll / demo buttons scroll to contact
    $(document).on("click", ".scroll-contact", function (e) {
        e.preventDefault();
        $("html, body").animate({
            scrollTop: $("#contact").offset().top - 80
        }, 700);
    });
})(jQuery);
