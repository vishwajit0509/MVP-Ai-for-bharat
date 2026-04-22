import React from 'react'

const CSS = `
  .hg-loader { --dur: 2s; display:block; }
  .hg-glare-top,.hg-glare-bottom,.hg-model,.hg-motion-thick,.hg-motion-medium,
  .hg-motion-thin,.hg-sand-drop,.hg-sand-fill,.hg-sand-grain-left,.hg-sand-grain-right,
  .hg-sand-line-left,.hg-sand-line-right,.hg-sand-mound-top,.hg-sand-mound-bottom {
    animation-duration:var(--dur);
    animation-timing-function:cubic-bezier(0.83,0,0.17,1);
    animation-iteration-count:infinite;
  }
  .hg-glare-top   { animation-name: hg-glare-top; }
  .hg-glare-bottom{ animation-name: hg-glare-bottom; }
  .hg-model       { animation-name: hg-loader-flip; transform-origin:12.25px 16.75px; }
  .hg-motion-thick,.hg-motion-medium,.hg-motion-thin { transform-origin:26px 26px; }
  .hg-motion-thick  { animation-name:hg-motion-thick; }
  .hg-motion-medium { animation-name:hg-motion-medium; }
  .hg-motion-thin   { animation-name:hg-motion-thin; }
  .hg-sand-drop   { animation-name:hg-sand-drop; }
  .hg-sand-fill   { animation-name:hg-sand-fill; }
  .hg-sand-grain-left  { animation-name:hg-sand-grain-left; }
  .hg-sand-grain-right { animation-name:hg-sand-grain-right; }
  .hg-sand-line-left   { animation-name:hg-sand-line-left; }
  .hg-sand-line-right  { animation-name:hg-sand-line-right; }
  .hg-sand-mound-top   { animation-name:hg-sand-mound-top; }
  .hg-sand-mound-bottom{ animation-name:hg-sand-mound-bottom; transform-origin:12.25px 31.5px; }

  @keyframes hg-loader-flip {
    from { transform:translate(13.75px,9.25px) rotate(-180deg); }
    24%, to { transform:translate(13.75px,9.25px) rotate(0); }
  }
  @keyframes hg-glare-top {
    from { stroke:rgba(255,255,255,0); }
    24%, to { stroke:white; }
  }
  @keyframes hg-glare-bottom {
    from { stroke:white; }
    24%, to { stroke:rgba(255,255,255,0); }
  }
  @keyframes hg-motion-thick {
    from { animation-timing-function:cubic-bezier(0.33,0,0.67,0); stroke:rgba(255,255,255,0); stroke-dashoffset:153.94; transform:rotate(0.67turn); }
    20% { animation-timing-function:cubic-bezier(0.33,1,0.67,1); stroke:rgba(245,158,11,0.9); stroke-dashoffset:141.11; transform:rotate(1turn); }
    40%, to { stroke:rgba(255,255,255,0); stroke-dashoffset:153.94; transform:rotate(1.33turn); }
  }
  @keyframes hg-motion-medium {
    from, 8% { animation-timing-function:cubic-bezier(0.33,0,0.67,0); stroke:rgba(255,255,255,0); stroke-dashoffset:153.94; transform:rotate(0.5turn); }
    20% { animation-timing-function:cubic-bezier(0.33,1,0.67,1); stroke:rgba(255,255,255,0.85); stroke-dashoffset:147.53; transform:rotate(0.83turn); }
    32%, to { stroke:rgba(255,255,255,0); stroke-dashoffset:153.94; transform:rotate(1.17turn); }
  }
  @keyframes hg-motion-thin {
    from, 4% { animation-timing-function:cubic-bezier(0.33,0,0.67,0); stroke:rgba(255,255,255,0); stroke-dashoffset:153.94; transform:rotate(0.33turn); }
    24% { animation-timing-function:cubic-bezier(0.33,1,0.67,1); stroke:rgba(255,255,255,0.6); stroke-dashoffset:134.7; transform:rotate(0.67turn); }
    44%, to { stroke:rgba(255,255,255,0); stroke-dashoffset:153.94; transform:rotate(1turn); }
  }
  @keyframes hg-sand-drop {
    from, 10% { animation-timing-function:cubic-bezier(0.12,0,0.39,0); stroke-dashoffset:1; }
    70%, to { stroke-dashoffset:-107; }
  }
  @keyframes hg-sand-fill {
    from, 10% { animation-timing-function:cubic-bezier(0.12,0,0.39,0); stroke-dashoffset:55; }
    70%, to { stroke-dashoffset:-54; }
  }
  @keyframes hg-sand-grain-left {
    from, 10% { animation-timing-function:cubic-bezier(0.12,0,0.39,0); stroke-dashoffset:29; }
    70%, to { stroke-dashoffset:-22; }
  }
  @keyframes hg-sand-grain-right {
    from, 10% { animation-timing-function:cubic-bezier(0.12,0,0.39,0); stroke-dashoffset:27; }
    70%, to { stroke-dashoffset:-24; }
  }
  @keyframes hg-sand-line-left {
    from, 10% { animation-timing-function:cubic-bezier(0.12,0,0.39,0); stroke-dashoffset:53; }
    70%, to { stroke-dashoffset:-55; }
  }
  @keyframes hg-sand-line-right {
    from, 10% { animation-timing-function:cubic-bezier(0.12,0,0.39,0); stroke-dashoffset:14; }
    70%, to { stroke-dashoffset:-24.5; }
  }
  @keyframes hg-sand-mound-top {
    from, 10% { animation-timing-function:linear; transform:translate(0,0); }
    15% { animation-timing-function:cubic-bezier(0.12,0,0.39,0); transform:translate(0,1.5px); }
    51%, to { transform:translate(0,13px); }
  }
  @keyframes hg-sand-mound-bottom {
    from, 31% { animation-timing-function:cubic-bezier(0.61,1,0.88,1); transform:scale(1,0); }
    56%, to { transform:scale(1,1); }
  }
`

export function HourglassLoader({ size = 28 }) {
  const hue = 35 // warm amber-sand
  return (
    <>
      <style>{CSS}</style>
      <svg
        aria-label="Hourglass loader"
        role="img"
        height={size}
        width={size}
        viewBox="0 0 56 56"
        className="hg-loader"
        style={{ '--hue': hue }}
      >
        <clipPath id="hg-sand-mound-top">
          <path d="M 14.613 13.087 C 15.814 12.059 19.3 8.039 20.3 6.539 C 21.5 4.789 21.5 2.039 21.5 2.039 L 3 2.039 C 3 2.039 3 4.789 4.2 6.539 C 5.2 8.039 8.686 12.059 9.887 13.087 C 11 14.039 12.25 14.039 12.25 14.039 C 12.25 14.039 13.5 14.039 14.613 13.087 Z" />
        </clipPath>
        <clipPath id="hg-sand-mound-bottom">
          <path d="M 14.613 20.452 C 15.814 21.48 19.3 25.5 20.3 27 C 21.5 28.75 21.5 31.5 21.5 31.5 L 3 31.5 C 3 31.5 3 28.75 4.2 27 C 5.2 25.5 8.686 21.48 9.887 20.452 C 11 19.5 12.25 19.5 12.25 19.5 C 12.25 19.5 13.5 19.5 14.613 20.452 Z" />
        </clipPath>
        <g transform="translate(2,2)">
          <g transform="rotate(-90,26,26)" strokeLinecap="round" strokeDashoffset="153.94" strokeDasharray="153.94 153.94" stroke="hsl(0,0%,100%)" fill="none">
            <circle transform="rotate(0,26,26)" r="24.5" cy={26} cx={26} strokeWidth="2.5" className="hg-motion-thick" />
            <circle transform="rotate(90,26,26)" r="24.5" cy={26} cx={26} strokeWidth="1.75" className="hg-motion-medium" />
            <circle transform="rotate(180,26,26)" r="24.5" cy={26} cx={26} strokeWidth={1} className="hg-motion-thin" />
          </g>
          <g transform="translate(13.75,9.25)" className="hg-model">
            <path d="M 1.5 2 L 23 2 C 23 2 22.5 8.5 19 12 C 16 15.5 13.5 13.5 13.5 16.75 C 13.5 20 16 18 19 21.5 C 22.5 25 23 31.5 23 31.5 L 1.5 31.5 C 1.5 31.5 2 25 5.5 21.5 C 8.5 18 11 20 11 16.75 C 11 13.5 8.5 15.5 5.5 12 C 2 8.5 1.5 2 1.5 2 Z" fill={`hsl(${hue},90%,85%)`} />
            <g strokeLinecap="round" stroke={`hsl(35,90%,90%)`}>
              <line y2="20.75" x2={12} y1="15.75" x1={12} strokeDasharray="0.25 33.75" strokeWidth={1} className="hg-sand-grain-left" />
              <line y2="21.75" x2="12.5" y1="16.75" x1="12.5" strokeDasharray="0.25 33.75" strokeWidth={1} className="hg-sand-grain-right" />
              <line y2="31.5" x2="12.25" y1={18} x1="12.25" strokeDasharray="0.5 107.5" strokeWidth={1} className="hg-sand-drop" />
              <line y2="31.5" x2="12.25" y1="14.75" x1="12.25" strokeDasharray="54 54" strokeWidth="1.5" className="hg-sand-fill" />
              <line y2="31.5" x2={12} y1={16} x1={12} strokeDasharray="1 107" strokeWidth={1} stroke={`hsl(35,90%,83%)`} className="hg-sand-line-left" />
              <line y2="31.5" x2="12.5" y1={16} x1="12.5" strokeDasharray="12 96" strokeWidth={1} stroke={`hsl(35,90%,83%)`} className="hg-sand-line-right" />
              <g strokeWidth={0} fill={`hsl(35,90%,90%)`}>
                <path d="M 12.25 15 L 15.392 13.486 C 21.737 11.168 22.5 2 22.5 2 L 2 2.013 C 2 2.013 2.753 11.046 9.009 13.438 L 12.25 15 Z" clipPath="url(#hg-sand-mound-top)" />
                <path d="M 12.25 18.5 L 15.392 20.014 C 21.737 22.332 22.5 31.5 22.5 31.5 L 2 31.487 C 2 31.487 2.753 22.454 9.009 20.062 Z" clipPath="url(#hg-sand-mound-bottom)" />
              </g>
            </g>
            <g strokeWidth={2} strokeLinecap="round" opacity="0.7" fill="none">
              <path d="M 19.437 3.421 C 19.437 3.421 19.671 6.454 17.914 8.846 C 16.157 11.238 14.5 11.5 14.5 11.5" stroke="hsl(0,0%,100%)" className="hg-glare-top" />
              <path transform="rotate(180,12.25,16.75)" d="M 19.437 3.421 C 19.437 3.421 19.671 6.454 17.914 8.846 C 16.157 11.238 14.5 11.5 14.5 11.5" stroke="hsla(0,0%,100%,0)" className="hg-glare-bottom" />
            </g>
            <rect height={2} width="24.5" fill={`hsl(${hue},90%,50%)`} />
            <rect height={1} width="19.5" y="0.5" x="2.5" ry="0.5" rx="0.5" fill={`hsl(${hue},90%,57.5%)`} />
            <rect height={2} width="24.5" y="31.5" fill={`hsl(${hue},90%,50%)`} />
            <rect height={1} width="19.5" y={32} x="2.5" ry="0.5" rx="0.5" fill={`hsl(${hue},90%,57.5%)`} />
          </g>
        </g>
      </svg>
    </>
  )
}
