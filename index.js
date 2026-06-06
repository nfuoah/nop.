// 그래프 애니메이션
// https://codepen.io/sogoonii/pen/ZJoLNo


//25년 막대 그래프 애니메이션 ===========================

function startBarAnimation() {
    document.querySelector('.chart01-25').classList.add('animated');
}

//막대그래프가 화면에 들어왔을 때 애니메이션을 실행하기 위한 코드
const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            setTimeout(startBarAnimation, 300);
            barObserver.disconnect();
        }
    });
}, { threshold: 1.0 }); // 막대그래프가 100% 다 보일 때 실행

barObserver.observe(document.querySelector('.chart01'));

// 도넛 그래프 애니메이션 =================================================

const donutObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                document.querySelectorAll('.svg-donut').forEach(donut => {
                    // HTML의 data-rate="23.1" 속성 값을 읽어옴
                    const rate = donut.getAttribute('data-rate');
                    const segment = donut.querySelector('.donut-segment');

                    // 읽어온 퍼센트 수치대로 파란 선을 슥 그어줌! (나머지는 공백)
                    segment.style.strokeDasharray = `${rate} ${100 - rate}`;
                });
            }, 300);
            // 화면에 보이면 모든 .svg-donut 요소를 찾아서 애니메이션 시작

            donutObserver.disconnect(); // 한 번 실행 후 카메라 종료
        }
    });
}, { threshold: 1.0 }); // 원 그래프 박스가 100% 다 보일 때 실행

// 스크롤 감시 시작
if (document.querySelector('.chart02-graph')) {
    donutObserver.observe(document.querySelector('.chart02-graph'));
}

// 기능 소개 페이지 스크롤
/* =============================================
   기능 소개 스크롤 타임라인 스크립트

   동작:
   - 스크롤 진행률로 슬라이드 index 계산
   - 위로 스크롤 시 자동 역행
   - 한 번 등록 후 passive 이벤트로 성능 최적화
============================================= */
(function () {
    const section   = document.getElementById('scrollSection');
    const slides    = document.querySelectorAll('#scrollSection .slide');
    const TOTAL     = slides.length;
    let   current   = 0;
    let   isAnimating = false;

    // 타임라인 아이템
    const tl0 = document.getElementById('tl-0'); // 입장 전
    const tl1 = document.getElementById('tl-1'); // 입장 후
    const tl2 = document.getElementById('tl-2'); // 결제

    // 슬라이드별 타임라인 상태 정의
    // top: vh 단위 (100vh 기준 비율)
    const tlStates = [
        // 슬라이드 0: 입장 전(active), 입장 후(dim) — 결제 숨김
        {
            0: { top: '42vh', dot: 'active-ring', labelDim: false, hidden: false },
            1: { top: '58vh', dot: 'outline',     labelDim: true,  hidden: false },
            2: { top: '70vh', dot: 'outline',     labelDim: true,  hidden: true  },
        },
        // 슬라이드 1: 입장 전(passed), 입장 후(active), 결제(dim) 등장
        {
            0: { top: '34vh', dot: 'filled',      labelDim: true,  hidden: false },
            1: { top: '47vh', dot: 'active-ring', labelDim: false, hidden: false },
            2: { top: '60vh', dot: 'outline',     labelDim: true,  hidden: false },
        },
        // 슬라이드 2: 입장 전 사라짐, 입장 후(passed), 결제(active)
        {
            0: { top: '20vh', dot: 'filled',      labelDim: true,  hidden: true  },
            1: { top: '42vh', dot: 'filled',      labelDim: true,  hidden: false },
            2: { top: '55vh', dot: 'active-ring', labelDim: false, hidden: false },
        },
    ];

    const tlEls = [tl0, tl1, tl2];

    /* 타임라인 상태 적용 */
    function applyTlState(slideIdx) {
        const state = tlStates[slideIdx];
        tlEls.forEach((el, i) => {
            const s = state[i];
            el.style.top = s.top;

            // 숨김/표시
            if (s.hidden) {
                el.classList.add('tl-hidden');
            } else {
                el.classList.remove('tl-hidden');
            }

            // 점 스타일
            const dot = el.querySelector('.tl-dot');
            dot.className = 'tl-dot ' + s.dot;

            // 라벨 dim
            const label = el.querySelector('.tl-label');
            if (s.labelDim) {
                label.classList.add('dim');
            } else {
                label.classList.remove('dim');
            }
        });
    }

    /* 슬라이드 전환 */
    function goTo(idx) {
        if (idx < 0 || idx >= TOTAL || idx === current) return;

        slides[current].classList.remove('active');
        current = idx;
        slides[current].classList.add('active');
        applyTlState(current);

        isAnimating = true;
        setTimeout(() => { isAnimating = false; }, 600);
    }

    /* 섹션이 뷰포트 안에 있는지 */
    function isInSection() {
        const rect = section.getBoundingClientRect();
        return rect.top <= 0 && rect.bottom >= window.innerHeight;
    }

    /* wheel 이벤트 — 스크롤 1회 = 슬라이드 1개 */
    window.addEventListener('wheel', function (e) {
        if (!isInSection()) return;

        if (current === TOTAL - 1 && e.deltaY > 0) return; // 마지막 → 탈출
        if (current === 0 && e.deltaY < 0) return;          // 처음 → 탈출

        e.preventDefault();
        if (isAnimating) return;

        if (e.deltaY > 0) goTo(current + 1);
        else              goTo(current - 1);

    }, { passive: false });

    /* 터치 지원 */
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (!isInSection()) return;
        const diff = touchStartY - e.changedTouches[0].clientY;
        if (Math.abs(diff) < 30) return;
        if (diff > 0) goTo(current + 1);
        else          goTo(current - 1);
    }, { passive: true });

    /* 초기 상태 적용 */
    applyTlState(0);

})();

//스캔
const scanData = {
    sign: {
        bg: "img/sign-bg.png",
        main: "img/service-scan01.png",
        loading: "img/service-scan01-1.png",
        result: "img/service-scan01-2.png",
        popup: "img/service-scan01-3.png"
    },
    receipt: {
        bg: "img/receipt-bg.png",
        main: "img/service-scan02.png",
        loading: "img/service-scan02-1.png",
        result: "img/service-scan02-2.png",
        popup: "img/service-scan02-3.png" // 영수증용 팝업 이미지명 확인 필요!
    }
};

// 🎯 2. 현재 어떤 모드인지 기억하는 변수 (기본값: 간판스캔)
let currentMode = "sign";

// 🖥️ 3. 제어할 HTML 이미지 태그들 가져오기 (js- 클래스로 콕 집음)
const pageWrap = document.querySelector('.scan-page-wrap');
const bgImg = document.querySelector('.js-scan-bg');
const mainImg = document.querySelector('.js-phone-main');
const loadingImg = document.querySelector('.js-phone-loading');
const resultImg = document.querySelector('.js-phone-result');
const popupImg = document.querySelector('.js-phone-popup');

// 🎛️ 4. 상단 탭 버튼 클릭 이벤트 (담곰이의 change 이벤트와 같은 원리!)
const tabButtons = document.querySelectorAll('.tab-btn');
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // 클릭한 버튼의 타입(sign 또는 receipt)을 알아내서 현재 모드 변경
        currentMode = button.getAttribute('data-type');

        bgImg.src = scanData[currentMode].bg;
        mainImg.src = scanData[currentMode].main;
        loadingImg.src = scanData[currentMode].loading;
        resultImg.src = scanData[currentMode].result;
        popupImg.src = scanData[currentMode].popup;

        // 탭 바꿨으니 진행중이던 상태들은 깔끔하게 청소
        pageWrap.classList.remove('is-scanning', 'is-done', 'show-popup');
    });
});

// ⏳ 5. 스캔 시작 함수
function startScan() {
    pageWrap.classList.add('is-scanning');
    setTimeout(() => {
        pageWrap.classList.remove('is-scanning');
        pageWrap.classList.add('is-done');
    }, 1600);
}

// 🔍 6. 자세히 보기 함수
function showDetail() {
    pageWrap.classList.toggle('show-popup');
}

// // ↺ 7. 초기화 리셋 함수
// function resetScan() {
//     pageWrap.classList.remove('is-scanning', 'is-done', 'show-popup');
// }