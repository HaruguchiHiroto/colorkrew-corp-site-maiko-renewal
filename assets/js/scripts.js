'use strict';

(function app() {
  var tabletBreak = 1024;
  var mobileBreak = 768;
  var mobileXSBreak = 375;
  var pageOffsetX = window.scrollX;
  var pageOffsetY = window.scrollY;
  var frozeException = null;
  var isWindowFrozen = false;
  var isHeaderActive = false;
  var isHeaderStickEnable = true;

  function detectBrowser() {
    var html = $('html');
    function init() {
      var userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.indexOf('chrome') > -1 && userAgent.indexOf('edg/') <= -1) {
        html.addClass('is-chrome');
      } else {
        html.removeClass('is-chrome');
      }
      if (
        userAgent.indexOf('safari') > -1
        && userAgent.indexOf('chrome') <= -1
      ) {
        html.addClass('is-safari');
      } else {
        html.removeClass('is-safari');
      }
      if (userAgent.indexOf('firefox') > -1) {
        html.addClass('is-firefox');
      } else {
        html.removeClass('is-firefox');
      }
      if (
        userAgent.indexOf('msie ') > -1
        || userAgent.indexOf('trident/') > -1
      ) {
        html.addClass('is-ie');
      } else {
        html.removeClass('is-ie');
      }
      if (userAgent.indexOf('edg/') > -1) {
        html.addClass('is-edge');
      } else {
        html.removeClass('is-edge');
      }
    }
    $(window).on('load resize', function onLoadWindow() {
      init();
    });
    init();
  }

  function detectDevice() {
    var html = $('html');
    function init() {
      var viewport = $('html head meta[name="viewport"]')[0];
      var userAgent = navigator.userAgent.toLowerCase();
      var orientation = window.matchMedia('(orientation: portrait)').matches;

      // System
      if (userAgent.indexOf('mac') > -1) {
        html.addClass('is-mac is-macos');
      } else {
        html.removeClass('is-mac is-macos');
      }
      if (userAgent.match(/(iphone|ipod|ipad)/)) {
        if (userAgent.match(/iphone/)) {
          if (window.screen.width < mobileBreak && window.screen.width >= 390) {
            html.addClass('is-iphone-12');
          } else {
            html.removeClass('is-iphone-12');
          }
          if (window.screen.width < mobileBreak && window.screen.width < 390) {
            html.addClass('is-iphone-10');
          } else {
            html.removeClass('is-iphone-10');
          }
          if (window.screen.width < mobileBreak && window.screen.width < 375) {
            html.addClass('is-iphone-5');
          } else {
            html.removeClass('is-iphone-5');
          }
          html.addClass('is-iphone');
        } else {
          html.removeClass('is-iphone-12 is-iphone-10 is-iphone-5 is-iphone');
        }
        if (userAgent.match(/ipod/)) {
          html.addClass('is-ipod');
        } else {
          html.removeClass('is-ipod');
        }
        if (userAgent.match(/ipad/)) {
          html.addClass('is-ipad');
        } else {
          html.removeClass('is-ipad');
        }
        html.addClass('is-ios');
      } else {
        html.removeClass('is-phone is-ipod is-ipad is-ios');
      }
      if (userAgent.indexOf('android') > -1) {
        html.addClass('is-android');
      } else {
        html.removeClass('is-android');
      }

      // Type
      if (
        navigator.maxTouchPoints === 1
        && userAgent.indexOf('Mobile') === -1
      ) {
        $('html').addClass('is-emulation');
      } else {
        $('html').removeClass('is-emulation');
      }
      if (
        (html.hasClass('is-mac')
          || html.hasClass('is-ios')
          || html.hasClass('is-android'))
        && navigator.maxTouchPoints
        && navigator.maxTouchPoints >= 1
      ) {
        $('html').addClass('is-touchable');
        $('html').removeClass('is-untouchable');
      } else {
        $('html').removeClass('is-touchable');
        $('html').addClass('is-untouchable');
      }

      // Media
      if ($(window).width() < mobileBreak) {
        if (window.screen.width < mobileXSBreak) {
          viewport.setAttribute(
            'content',
            'width=' + mobileXSBreak + ', user-scalable=0'
          );
        } else {
          viewport.setAttribute(
            'content',
            'width=device-width, initial-scale=1'
          );
        }
        $('html').removeClass('is-desktop is-tablet');
        $('html').addClass('is-mobile');
      } else {
        $('html').addClass('is-desktop');
        if (
          (window.screen.width >= mobileBreak
            && window.screen.width <= tabletBreak)
          || (window.screen.width < mobileBreak
            && window.screen.height >= mobileBreak
            && !orientation)
        ) {
          $('html').addClass('is-tablet');
        } else {
          $('html').removeClass('is-tablet');
        }
        viewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=0'
        );
        $('html').removeClass('is-mobile');
      }
    }
    $(window).on('load resize', function onLoadWindow() {
      init();
    });
    init();
  }

  function isMobile() {
    return $('html').hasClass('is-mobile');
  }

  function isTouchable() {
    return $('html').hasClass('is-touchable');
  }

  function isOutsideOfElement(event, target) {
    var container = $(target);
    if (
      !container.is(event.target)
      && container.has(event.target).length === 0
    ) {
      return true;
    }
    return false;
  }

  function scrollFix(target) {
    var windowScrollLeft = $(window).scrollLeft();
    if (windowScrollLeft > 0 && $(target).css('position') === 'fixed') {
      $(target).css('left', -windowScrollLeft + 'px');
    } else {
      $(target).css('left', 0);
    }
  }

  function frozeWindow(isDo, exception) {
    var classFrozenWindows = 'is-frozen-windows';
    var classFrozenOS = 'is-frozen-os';
    function freezeWindows() {
      if (isDo) {
        pageOffsetY = $(window).scrollTop();
        $('body').css({ top: -pageOffsetY + 'px', left: -pageOffsetX + 'px' });
        $('html').addClass(classFrozenWindows);
        isWindowFrozen = true;
      } else {
        isWindowFrozen = false;
        $('html').removeClass(classFrozenWindows);
        $('body').css({ top: 'auto', left: 'auto' });
        $(window).scrollLeft(pageOffsetX);
        $(window).scrollTop(pageOffsetY);
      }
    }
    function freezeOS() {
      if (isDo) {
        $('html').addClass(classFrozenOS);
        isWindowFrozen = true;
        if (exception.length) {
          frozeException = exception;
        } else {
          frozeException = null;
        }
        if (!$('html').attr('data-froze-state') || $('html').attr('data-froze-state') !== 'ready') {
          document.body.addEventListener('touchmove', function onTouch(event) {
            if (isWindowFrozen) {
              if (
                frozeException !== null
                && (frozeException.length && isOutsideOfElement(event, frozeException))
              ) {
                event.preventDefault();
              } else if (frozeException === null) {
                event.preventDefault();
              }
            }
          }, { passive: false });
          $('html').attr('data-froze-state', 'ready');
        }
      } else {
        isWindowFrozen = false;
        $('html').removeClass(classFrozenOS);
      }
    }
    if (isDo) {
      if ($('html').hasClass('is-desktop') && !isTouchable()) {
        freezeWindows();
      } else {
        freezeOS();
      }
    } else if (!isDo && $('html').hasClass(classFrozenWindows)) {
      freezeWindows();
    } else if (!isDo && $('html').hasClass(classFrozenOS)) {
      freezeOS();
    }
  }

  function headerCommonOpen() {
    var classReady = 'is-ready';
    var classActive = 'is-active';
    var header = $('header');
    var navigationSitemap = header.find('.js-navigation');
    var buttonBurger = header.find('.js-button-menu');
    header.addClass(classReady);
    header.addClass(classActive);
    navigationSitemap.addClass(classReady);
    navigationSitemap.addClass(classActive);
    buttonBurger.addClass(classReady);
    buttonBurger.addClass(classActive);
    isHeaderActive = true;
    isHeaderStickEnable = false;
    header.removeClass('is-on-top');
    header.css({
      top: 0
    });
    if (isWindowFrozen === false) {
      frozeWindow(true, $('.js-navigation'));
    }
  }

  function headerCommonClose() {
    var classReady = 'is-ready';
    var classActive = 'is-active';
    var header = $('header');
    var navigationSitemap = header.find('.js-navigation');
    var buttonBurger = header.find('.js-button-menu');
    header.addClass(classReady);
    header.removeClass(classActive);
    navigationSitemap.addClass(classReady);
    navigationSitemap.removeClass(classActive);
    buttonBurger.addClass(classReady);
    buttonBurger.removeClass(classActive);
    isHeaderActive = false;
    isHeaderStickEnable = true;
    if (isWindowFrozen === true) {
      frozeWindow(false);
    }
  }

  function headerCommon() {
    var classReady = 'is-ready';
    var classActive = 'is-active';
    var classScrolled = 'is-scrolled';
    var header = $('header');
    var navigationSitemap = header.find('.js-navigation');
    var buttonBurger = header.find('.js-button-menu');
    if (!$('header').length) return;
    buttonBurger.off().on('click', function onClickButton() {
      if (!buttonBurger.hasClass(classActive)) {
        headerCommonOpen();
      } else {
        headerCommonClose();
      }
    });
    $(window).on('load scroll resize', function onLoadWindow() {
      if ($(document).scrollTop() > 1) {
        header.addClass(classScrolled);
      } else {
        header.removeClass(classScrolled);
      }
    });
    $(window).on('resize', function onLoadWindow() {
      header.removeClass(classReady);
      navigationSitemap.removeClass(classReady);
      buttonBurger.removeClass(classReady);
    });
    header.addClass(classReady);
    navigationSitemap.addClass(classReady);
    buttonBurger.addClass(classReady);
  }

  function headerSticky() {
    var lastScrollTop = 0;
    var header = $('header');
    var headerHeight = header.outerHeight();
    $(window).on('load scroll', function scrollHeader() {
      var currentScrollTop = $(this).scrollTop();
      if (isHeaderStickEnable) {
        headerHeight = header.outerHeight();
        if (currentScrollTop < 50) {
          header.addClass('is-on-top');
        } else {
          header.removeClass('is-on-top');
        }
        if (currentScrollTop > lastScrollTop) {
          header.css({
            top: -headerHeight
          });
        } else {
          header.css({
            top: 0
          });
        }
        lastScrollTop = currentScrollTop;
      } else {
        header.removeClass('is-on-top');
        header.css({
          top: 0
        });
      }
    });
  }

  function smoothScroll() {
    var anchors = $('a[href*="#"]:not([href="#"])');
    var speed = 500;
    var delay = 0;
    var timeout = 0;
    function getPosition(target) {
      var position = $(target).offset().top;
      var positionOffset = 0;
      if ($(target).attr('data-smoothscroll-offset') !== undefined) {
        position += parseInt($(target).attr('data-smoothscroll-offset'), 10);
      } else if (
        $(target).attr('data-smoothscroll-offset-pc') !== undefined
        && !isMobile()
      ) {
        position += parseInt($(target).attr('data-smoothscroll-offset-pc'), 10);
      } else if (
        $(target).attr('data-smoothscroll-offset-sp') !== undefined
        && isMobile()
      ) {
        position
          += parseFloat($(target).attr('data-smoothscroll-offset-sp'))
          * $('html').css('font-size');
      }
      position -= positionOffset;
      return position;
    }
    function triggerScroll(context) {
      var href = typeof context === 'string'
        ? context
        : '#' + $(context).attr('href').split('#')[1];
      if (!$(context).hasClass('no-scroll') && $(href).length) {
        if (isHeaderActive === true) {
          delay = 500;
          headerCommonClose();
        }
        if (isWindowFrozen === true) {
          delay = 500;
          frozeWindow(false);
        }
        setTimeout(function onTimeout() {
          $('body, html').animate({ scrollTop: getPosition($(href)) }, speed, 'swing');
        }, delay);
        return false;
      }
      return true;
    }
    setTimeout(function setTimerHTMLVisibility() {
      window.scroll(0, 0);
      $('html').removeClass('is-loading').addClass('is-visible');
    }, 1);
    if (window.location.hash) {
      window.scroll(0, 0);
      if (
        navigator.userAgent.indexOf('MSIE ') > -1
        || navigator.userAgent.indexOf('Trident/') > -1
      ) {
        timeout = 0;
      } else {
        timeout = 500;
      }
      setTimeout(function setTimerTriggerScroll() {
        triggerScroll(window.location.hash);
      }, timeout);
    }
    anchors.on('click', function onClickAnchor() {
      return triggerScroll(this);
    });
  }

  function clickActive() {
    if (!$('.js-click-active').length) return;
    $('.js-click-active').each(function init() {
      var target = $(this);
      var toggle = target.find('[data-click-action="toggle"]');
      var toggleClose = target.find('[data-click-action="close"]');
      toggle.on('click', function onClick() {
        target.toggleClass('is-active');
      });
      toggleClose.on('click', function onClick() {
        target.removeClass('is-active');
      });
      $(document).on('click', function onClick(event) {
        if (target.hasClass('is-active') && isOutsideOfElement(event, target)) {
          target.removeClass('is-active');
        }
      });
    });
  }

  function accordionContent() {
    $('.js-accordion').find('.js-accordion-heading').on('click', function onClickHeading() {
      if (!isMobile() && $(this).parent().hasClass('js-accordion-sp')) return;
      $(this).parents('.navigation-item').stop().toggleClass('is-active');
      $(this).parents('.navigation-item').find('.js-accordion-content').stop()
        .eq(0)
        .slideToggle(500);
    });
  }

  function formAgree() {
    if (!$('.js-agreement').length) return;
    function init() {
      if (!$('.js-agreement').find('input').is(':checked')) {
        $('.js-button-submit').removeClass('is-active');
        $('.js-button-submit').attr('disabled');
      } else {
        $('.js-button-submit').addClass('is-active');
        $('.js-button-submit').removeAttr('disabled');
      }
    }
    $('.js-agreement').on('click', function onClick() {
      init();
    });
    init();
  }

  function accordionLoadMore() {
    if (!$('.js-accordion-load-more').length) return false;

    $('.js-accordion-load-more').each(function loop(index, accordion) {
      // Global variables
      var heading = $(accordion).find('.js-accordion-heading');
      var content = $(accordion).find('.js-accordion-content');
      var row = 10;
      var viewHeight = 0;
      var listLoadMore = $(accordion).find('.js-accordion-list');
      var buttonLoadMore = $(accordion).find('.js-button-load-more');
      var actualHeight = listLoadMore[0].scrollHeight;
      var width = $(window).width();

      // Load more accordion
      function setHeight() {
        if (heading.hasClass('is-active') && !listLoadMore.hasClass('is-active')) {
          viewHeight = 0;
          listLoadMore.find('li.news-item').each(function loopItem(i, li) {
            if (i < row) viewHeight += $(li).outerHeight(true);
          });
          listLoadMore.css({ height: viewHeight });
        } else if (!heading.hasClass('is-active') && listLoadMore.hasClass('is-active')) {
          listLoadMore.removeAttr('style');
        }
      }

      if (listLoadMore.find('li.news-item').length <= row) {
        buttonLoadMore.hide();
      }

      buttonLoadMore.on('click', function onClick() {
        listLoadMore
          .addClass('is-active')
          .animate({ height: actualHeight }, {
            complete: function onComplete() {
              buttonLoadMore.hide();
              listLoadMore.removeAttr('style');
            }
          });
      });

      setHeight();
      $(window).on('load resize rotate', function onLoadWindow() {
        if (width === $(window).width()) return;
        width = $(window).width();
        setHeight();
      });

      // Outer accordion
      heading.on('click', function onClick() {
        if (heading.hasClass('is-active')) {
          heading.removeClass('is-active');
          content.stop().slideUp({
            complete: function onComplete() {
              listLoadMore.removeAttr('style');
            }
          });
        } else {
          heading.addClass('is-active');
          content.stop().slideDown();
          setHeight();
        }
      });
      setTimeout(function timer() {
        if (!heading.hasClass('is-active')) content.hide();
      }, 100);
    });

    return true;
  }
  // Swipper scroll
  function swiperInformation() {
    var slider = $('.js-swiper-information');
    var sliderWrapper = slider.find('.swiper-wrapper');
    var sliderWrapperHTML = sliderWrapper.html();
    var multiply = 5;
    var i = 0;
    if (!$('.js-swiper-information').length) return;
    for (i; i < multiply; i += 1) {
      sliderWrapper.append(sliderWrapperHTML);
    }
    new Swiper('.js-swiper-information', {
      loop: true,
      speed: 5000,
      slidesPerView: 'auto',
      allowTouchMove: false,
      autoplay: {
        delay: 0
      }
    });
  }

  $(function init() {
    detectBrowser();
    detectDevice();
    headerCommon();
    headerSticky();
    activeMenuItem();
    smoothScroll();
    clickActive();
    accordionContent();
    formAgree();
    accordionLoadMore();
    swiperInformation();
  });

  $(window).on('load', function onLoadWindow() {
    window.WebFontConfig = {
      custom: {
        families: [
          'Noto Sans JP:n4,n5,n6,n7',
          'Poppins:n4,n6,n7,n8'
        ],
        urls: [
          'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&family=Poppins:wght@400;600;700;800&display=swap'
        ]
      }
    };
    (function loadFont() {
      var wf = document.createElement('script');
      var s;
      wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
      wf.type = 'text/javascript';
      wf.async = 'true';
      s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(wf, s);
    }());
  });

  $(window).on('load scroll resize', function onLoadWindow() {
    pageOffsetX = $(window).scrollLeft();
    if (isWindowFrozen === true) {
      scrollFix($('body'));
    }
  });

  function activeMenuItem() {
    $('.navigation-item').find('.trans-link').each(function init() {
      let target = $(this);
      if (isMobile()) {
        if (target.attr('href') === window.location.pathname) {
          target.addClass('is-active');
        }
      } else {
        if (window.location.pathname.includes(target.attr('href'))) {
          target.addClass('is-active')
        }
      }
    });
  }
}());
