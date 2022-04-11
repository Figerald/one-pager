import { animate, AnimationStyleMetadata, AnimationTriggerMetadata, query, stagger, state, style, transition, trigger } from '@angular/animations';

const animationShowStyle: AnimationStyleMetadata = style({
    opacity: 1,
    transform: "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)",
    'transform-style': "preserve-3d"
});
  
const slideInAnimation: AnimationStyleMetadata = style({
    opacity: 0,
    transform: "translate3d(0px, 15px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)",
    'transform-style': "preserve-3d"
});

const fadeInAnimation: AnimationStyleMetadata = style({
    opacity: 0,
    transform: "translate3d(15px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)",
    'transform-style': "preserve-3d"
});

const showUpAnimation: AnimationStyleMetadata = style({
    opacity: 0
});

const fadeInLeftAnimation: AnimationStyleMetadata = style({
    opacity: 0,
    transform: "translate3d(-15px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)",
    'transform-style': "preserve-3d"
});

const navigationShow: AnimationStyleMetadata = style({
    height: '402px',
    'padding-left': '31px'
});

const navigationHide: AnimationStyleMetadata = style({
    height: '72px'
});

export const animationsArray: AnimationTriggerMetadata[] = [
    trigger('slide-in', [
        transition(':enter', [slideInAnimation, animate('1000ms 0.2s ease-out', animationShowStyle)])
    ]),
    trigger('slide-in-after', [
        transition(':enter', [slideInAnimation, animate('1000ms 1.2s ease-out', animationShowStyle)])
    ]),
    trigger('fade-in', [
        state('show', animationShowStyle),
        state('hide', fadeInAnimation),
        transition('show => hide', animate('700ms ease-out')),
        transition('hide => show', animate('700ms 1s ease-out'))
    ]),
    trigger('slide-in-text', [
        state('show', animationShowStyle),
        state('hide', slideInAnimation),
        transition('show => hide', animate('700ms ease-out')),
        transition('hide => show', animate('700ms ease-out'))
    ]),
    trigger('slide-in-modal', [
        state('show', animationShowStyle),
        state('hide', slideInAnimation),
        transition('show => hide', animate('300ms ease-out')),
        transition('hide => show', animate('300ms ease-out'))
    ]),
    trigger('slide-in-button', [
        state('show', animationShowStyle),
        state('hide', slideInAnimation),
        transition('show => hide', animate('700ms ease-out')),
        transition('hide => show', animate('700ms 1s ease-out'))
    ]),
    trigger('show-up', [
        state('show', animationShowStyle),
        state('hide', showUpAnimation),
        transition('show => hide', animate('700ms ease-out')),
        transition('hide => show', animate('1200ms ease-out'))
    ]),
    trigger('fade-in-left', [
        state('show', animationShowStyle),
        state('hide', fadeInLeftAnimation),
        transition('show => hide', animate('700ms ease-out')),
        transition('hide => show', animate('700ms 0.5s ease-out'))
    ]),
    trigger('news-animation', [
        transition('* => *', [
            query('iframe', slideInAnimation),
            query('iframe',
            stagger('600ms', [
                animate('800ms ease-out')
            ]))
        ])
    ]),
    trigger('team-animation', [
        transition('* => *', [
            query('img', slideInAnimation),
            query('img',
            stagger('600ms', [
                animate('800ms ease-out')
            ]))
        ])
    ]),
    trigger('mobile-navigation', [
        state('show', navigationShow),
        state('hide', navigationHide),
        transition('show => hide', animate('500ms ease-out')),
        transition('hide => show', animate('500ms ease-out'))
    ]),
    trigger('roadmap-animation', [
        transition('* => *', [
            query('.roadmap-plan, .roadmap-line', slideInAnimation),
            query('.roadmap-plan, .roadmap-line',
            stagger('300ms', [
                animate('500ms ease-out')
            ]))
        ])
    ]),
    trigger('roadmap-mobile-animation', [
        transition('* => *', [
            query('.roadmap-vertical-plan', fadeInLeftAnimation),
            query('.roadmap-vertical-plan',
            stagger('1000ms', [
                animate('800ms ease-out')
            ]))
        ])
    ])
];
